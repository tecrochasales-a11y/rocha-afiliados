import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { RECIPIENT, canSendAffiliate, messageParts, rawEmail, retryDecision } from '../_shared/business-email.ts';

const gateway = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1';
const schema = z.object({ action: z.enum(['status','configure','activate','test','process','retry']), id: z.string().uuid().optional() }).strict();
Deno.serve(async req => {
  const respond = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return respond({ ok: true });
  if (req.method !== 'POST') return respond({ error: 'Método não permitido' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    const gmailKey = Deno.env.get('GOOGLE_MAIL_API_KEY');
    const dispatchSecret = Deno.env.get('EMAIL_DISPATCH_SECRET');
    if (!url || !serviceKey || !apiKey || !gmailKey || !dispatchSecret) return respond({ error: 'Configuração de envio incompleta' }, 503);
    const db = createClient(url, serviceKey);
    const scheduler = req.headers.get('x-email-dispatch-secret') === dispatchSecret;
    if (!scheduler) {
      const authorization = req.headers.get('authorization');
      if (!authorization?.startsWith('Bearer ')) return respond({ error: 'Autenticação necessária' }, 401);
      const { data, error } = await db.auth.getUser(authorization.slice(7));
      if (error || !data.user) return respond({ error: 'Sessão inválida' }, 401);
      const { data: admin, error: roleError } = await db.rpc('has_role', { _user_id: data.user.id, _role: 'admin' });
      if (roleError || !admin) return respond({ error: 'Acesso exclusivo de administrador' }, 403);
    }
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return respond({ error: 'Solicitação inválida' }, 400);
    const { action, id } = parsed.data;
    if (scheduler && action !== 'process') return respond({ error: 'Ação não permitida' }, 403);
    const check = <T,>(result: { data: T; error: { message: string } | null }): T => { if (result.error) throw new Error(result.error.message); return result.data; };
    const headers = { Authorization: `Bearer ${apiKey}`, 'X-Connection-Api-Key': gmailKey, 'Content-Type': 'application/json' };
    const config = check(await db.from('email_notification_runtime').select('enabled,sender_email').eq('id', true).maybeSingle());
    if (action === 'status') return respond({ enabled: config?.enabled ?? false, sender: config?.sender_email, recipient: RECIPIENT });
    if (action === 'configure') {
      const profileResponse = await fetch(`${gateway}/users/me/profile`, { headers, signal: AbortSignal.timeout(15000) });
      if (!profileResponse.ok) { const details = await profileResponse.text(); console.error(`Gmail [${profileResponse.status}]: ${details}`); return respond({ error: 'Falha ao verificar Gmail', status: profileResponse.status, details }, profileResponse.status); }
      const profile = await profileResponse.json();
      if (!z.string().email().safeParse(profile.emailAddress).success) return respond({ error: 'Remetente inválido' }, 502);
      check(await db.rpc('configure_email_worker', { _url: `${url}/functions/v1/email-notifications`, _secret: dispatchSecret, _sender: profile.emailAddress }));
      return respond({ sender: profile.emailAddress, recipient: RECIPIENT, enabled: config?.enabled ?? false });
    }
    if (!config?.sender_email) return respond({ error: 'Configure a conexão Gmail primeiro' }, 409);
    if (action === 'activate') {
      const test = check(await db.from('email_notifications').select('id').eq('event_type','test').eq('status','sent').limit(1));
      if (!test?.length) return respond({ error: 'Envie um teste com sucesso antes de ativar' }, 409);
      check(await db.from('email_notification_runtime').update({ enabled: true, updated_at: new Date().toISOString() }).eq('id',true));
      check(await db.rpc('wake_email_queue'));
      return respond({ enabled: true });
    }
    let targetId: string | undefined;
    if (action === 'test') {
      const test = check(await db.from('email_notifications').insert({ event_key: `test:${crypto.randomUUID()}`, event_type: 'test', subject: 'Teste de notificações — Rocha Sales', payload: { summary: 'Este é um teste do sistema de avisos. O destinatário de todos os eventos é Anderson.', path: '/admin' } }).select('id').single());
      targetId = test.id;
    } else if (action === 'retry') {
      if (!id) return respond({ error: 'Selecione um envio com falha' }, 400);
      const updated = check(await db.from('email_notifications').update({ status: 'pending', attempts: 0, available_at: new Date().toISOString(), error_message: null, lease_until: null }).eq('id',id).eq('status','failed').select('id'));
      if (!updated.length) return respond({ error: 'Apenas falhas confirmadas podem ser reenviadas' }, 409);
      targetId = id;
    } else if (!config.enabled) return respond({ enabled: false, processed: 0 });
    const rows = check(await db.rpc('claim_business_emails', { _id: targetId ?? null }));
    let sent = 0;
    for (const row of rows) {
      const payload = row.payload as Record<string, unknown>;
      if (row.event_type === 'affiliate_created' && row.entity_id) {
        const roles = check(await db.from('user_roles').select('role').eq('user_id',row.entity_id));
        if (!canSendAffiliate(roles.map(r => r.role))) { check(await db.from('email_notifications').update({ status:'skipped',lease_until:null,error_message:'Conta não é afiliado exclusivo' }).eq('id',row.id)); continue; }
        const profile = check(await db.from('profiles').select('full_name').eq('id',row.entity_id).maybeSingle());
        payload.name = profile?.full_name ?? payload.name;
      }
      const parts = messageParts(row.subject, payload, row.created_at, row.entity_id ?? undefined);
      const raw = rawEmail(config.sender_email, row.id, row.subject, parts.text, parts.html);
      check(await db.from('email_notifications').update({ status:'sending',lease_until:new Date(Date.now()+180000).toISOString() }).eq('id',row.id).eq('status','processing'));
      try {
        const response = await fetch(`${gateway}/users/me/messages/send`, { method:'POST',headers,body:JSON.stringify({ raw }),signal:AbortSignal.timeout(20000) });
        if (!response.ok) {
          const details = await response.text();
          console.error(`Gmail send [${response.status}]: ${details}`);
          const state = retryDecision(response.status,row.attempts);
          const retryAfter = Number(response.headers.get('retry-after'));
          const delay = Number.isFinite(retryAfter) && retryAfter>0 ? retryAfter*1000 : Math.min(3600000,60000*2**row.attempts);
          check(await db.from('email_notifications').update({ status:state,error_message:`[${response.status}]: ${details}`,lease_until:null,available_at:new Date(Date.now()+delay).toISOString() }).eq('id',row.id));
          if (response.status === 429) break;
          continue;
        }
        const result = await response.json();
        if (typeof result.id !== 'string') throw new Error('Gmail não confirmou o identificador do envio');
        check(await db.from('email_notifications').update({ status:'sent',provider_message_id:result.id,sent_at:new Date().toISOString(),lease_until:null,error_message:null }).eq('id',row.id));
        sent++;
      } catch (error) {
        check(await db.from('email_notifications').update({ status:'uncertain',lease_until:null,error_message:error instanceof Error ? error.message : 'Envio sem confirmação' }).eq('id',row.id));
      }
    }
    check(await db.rpc('wake_email_queue'));
    // Tick disarms the schedule when the queue has drained; do not send an extra HTTP request here.
    const pending = check(await db.from('email_notifications').select('id').in('status',['pending','processing','sending']).limit(1));
    if (!pending.length) check(await db.rpc('email_queue_tick'));
    const testResult = targetId ? check(await db.from('email_notifications').select('status,error_message').eq('id',targetId).single()) : undefined;
    return respond({ sent, processed:rows.length, result:testResult });
  } catch (error) {
    console.error('email-notifications:',error instanceof Error ? error.message : 'Unknown error');
    return respond({ error:error instanceof Error ? error.message : 'Falha no envio' },500);
  }
});