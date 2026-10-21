import { useEffect, useState } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Mail, RefreshCw, Send, Play, RotateCcw, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type EmailRow = Database['public']['Tables']['email_notifications']['Row'];
const statusLabels: Record<string,string> = { pending:'Na fila',processing:'Preparando',sending:'Enviando',sent:'Aceito pelo Gmail',failed:'Falha',uncertain:'Resultado incerto',skipped:'Não aplicável' };
const events: Record<string,string> = { test:'Teste',affiliate_created:'Novo afiliado',lead_created:'Nova indicação',lead_status_changed:'Situação da indicação',lead_payment_changed:'Pagamento do cliente',commission_created:'Nova comissão',commission_status_changed:'Situação da comissão',withdrawal_created:'Novo saque',withdrawal_status_changed:'Situação do saque',affiliate_pdv_changed:'Vínculo ao PDV',campaign_created:'Nova campanha',campaign_status_changed:'Situação da campanha',notification:'Outros avisos' };
export default function AdminEmails() {
  const [rows,setRows] = useState<EmailRow[]>([]);
  const [config,setConfig] = useState<{enabled:boolean;sender?:string;recipient?:string}>({enabled:false});
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [status,setStatus] = useState('all');
  const [event,setEvent] = useState('all');
  const [search,setSearch] = useState('');
  const [page,setPage] = useState(0);
  const [count,setCount] = useState(0);
  const { toast } = useToast();
  const invoke = async (body: Record<string,unknown>) => {
    const {data,error} = await supabase.functions.invoke('email-notifications',{body});
    if(error) throw new Error(error instanceof FunctionsHttpError ? await error.context.text() : error.message);
    if(data?.error) throw new Error(data.error);
    return data;
  };
  const load = async () => {
    try {
      let query = supabase.from('email_notifications').select('*',{count:'exact'}).order('created_at',{ascending:false}).range(page*25,page*25+24);
      if(status!=='all') query=query.eq('status',status);
      if(event!=='all') query=query.eq('event_type',event);
      if(search.trim()) query=query.ilike('subject',`%${search.trim()}%`);
      const [result,settings] = await Promise.all([query,invoke({action:'status'})]);
      if(result.error) throw result.error;
      setRows(result.data ?? []); setCount(result.count ?? 0);setConfig(settings);setError('');
    } catch(e) { setError(e instanceof Error?e.message:'Não foi possível carregar os avisos'); }
  };
  useEffect(()=>{ void load(); },[page,status,event,search]);
  const action = async (action: string,id?:string) => {
    setBusy(true);
    try {
      const result = await invoke({action,...(id?{id}:{})});
      if(result.result && result.result.status!=='sent') throw new Error(result.result.error_message ?? 'Envio ainda não confirmado');
      toast({title:action==='test'?'Teste aceito pelo Gmail':action==='activate'?'Avisos ativados':'Concluído'});
      await load();
    } catch(e) { toast({title:'Não foi possível concluir',description:e instanceof Error?e.message:'Tente novamente',variant:'destructive'}); }
    finally { setBusy(false); }
  };
  return <AdminLayout><div className="p-4 md:p-8 space-y-6">
    <header className="flex flex-wrap gap-4 justify-between items-start"><div><h1 className="font-heading text-2xl font-bold flex gap-3 items-center"><Mail className="text-primary"/>Notificações por e-mail</h1><p className="text-muted-foreground mt-2 break-all">Destinatário: {config.recipient ?? 'andersonmenez@gmail.com'}</p><p className="text-sm text-muted-foreground break-all">Remetente: {config.sender ?? 'Gmail não configurado'}</p></div><Badge variant={config.enabled?'default':'secondary'}>{config.enabled?'Ativo':'Aguardando ativação'}</Badge></header>
    {error && <Alert variant="destructive"><AlertDescription className="break-words">{error}</AlertDescription></Alert>}
    <div className="flex flex-wrap gap-2">
      {!config.sender && <Button disabled={busy} onClick={()=>action('configure')}><Mail className="w-4 h-4 mr-2"/>Configurar Gmail</Button>}
      <Button variant="outline" disabled={busy||!config.sender} onClick={()=>action('test')}><Send className="w-4 h-4 mr-2"/>Enviar teste</Button>
      {!config.enabled && <Button disabled={busy||!config.sender} onClick={()=>action('activate')}><Play className="w-4 h-4 mr-2"/>Ativar avisos</Button>}
      <Button variant="outline" disabled={busy||!config.enabled} onClick={()=>action('process')}><RefreshCw className="w-4 h-4 mr-2"/>Processar fila</Button>
      <Button variant="ghost" size="icon" aria-label="Atualizar histórico" disabled={busy} onClick={()=>void load()}>{busy?<Loader2 className="w-4 h-4 animate-spin"/>:<RefreshCw className="w-4 h-4"/>}</Button>
    </div>
    <div className="flex flex-wrap gap-3"><Input className="max-w-sm" aria-label="Buscar assunto" placeholder="Buscar assunto" value={search} onChange={e=>{setPage(0);setSearch(e.target.value);}}/>
      <Select value={status} onValueChange={v=>{setPage(0);setStatus(v);}}><SelectTrigger className="w-48" aria-label="Filtrar situação"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Todas as situações</SelectItem>{Object.entries(statusLabels).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
      <Select value={event} onValueChange={v=>{setPage(0);setEvent(v);}}><SelectTrigger className="w-56" aria-label="Filtrar evento"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Todos os eventos</SelectItem>{Object.entries(events).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
    </div>
    <div className="overflow-x-auto border-y border-border"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Evento / assunto</TableHead><TableHead>Situação</TableHead><TableHead>Tentativas</TableHead><TableHead>Detalhes</TableHead></TableRow></TableHeader><TableBody>{rows.map(row=><TableRow key={row.id}><TableCell className="whitespace-nowrap">{new Date(row.created_at).toLocaleString('pt-BR')}</TableCell><TableCell className="min-w-48"><div className="font-medium">{row.subject}</div><div className="text-xs text-muted-foreground">{events[row.event_type]??row.event_type}</div></TableCell><TableCell><Badge variant={row.status==='failed'||row.status==='uncertain'?'destructive':'secondary'}>{statusLabels[row.status]??row.status}</Badge></TableCell><TableCell>{row.attempts}</TableCell><TableCell className="max-w-sm"><details><summary className="cursor-pointer text-primary">Ver detalhes</summary><div className="space-y-2 text-xs py-2 break-words"><p>{row.recipient_email}</p>{row.error_message&&<p className="text-destructive">{row.error_message}</p>}{row.provider_message_id&&<p>Gmail: {row.provider_message_id}</p>}<pre className="whitespace-pre-wrap break-all">{JSON.stringify(row.payload,null,2)}</pre></div></details>{row.status==='failed'&&<Button variant="ghost" size="sm" disabled={busy} onClick={()=>action('retry',row.id)}><RotateCcw className="w-4 h-4 mr-2"/>Reenviar</Button>}</TableCell></TableRow>)}{!rows.length&&<TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Nenhum envio encontrado</TableCell></TableRow>}</TableBody></Table></div>
    <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{count} registros</p><div className="flex gap-2"><Button variant="outline" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Anterior</Button><Button variant="outline" disabled={(page+1)*25>=count} onClick={()=>setPage(p=>p+1)}>Próxima</Button></div></div>
  </div></AdminLayout>;
}