export const RECIPIENT = 'andersonmenez@gmail.com';
export const APP_URL = 'https://rocha-afiliados.lovable.app';
export function retryDecision(status: number, attempts: number) {
  if (status >= 500) return 'uncertain';
  return status === 429 && attempts < 5 ? 'pending' : 'failed';
}
export function canSendAffiliate(roles: string[]) {
  return roles.includes('affiliate') && !roles.some(r => r === 'admin' || r === 'gestor');
}
export function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
}
const states: Record<string, string> = { pending: 'Pendente', contacted: 'Contatado', qualified: 'Qualificado', converted: 'Convertido', lost: 'Perdido', scheduled: 'Agendado', released: 'Liberado', paid: 'Pago', approved: 'Aprovado', rejected: 'Rejeitado', cancelled: 'Cancelado', canceled: 'Cancelado', true: 'Ativo', false: 'Inativo' };
export function messageParts(subject: string, payload: Record<string, unknown>, createdAt: string, entityId?: string) {
  const fields: Record<string, string> = { name: 'Nome', affiliate: 'Afiliado', pdv: 'PDV', status: 'Situação', previous: 'Anterior', current: 'Atual', amount: 'Valor (R$)', installment: 'Parcela', total_installments: 'Total de parcelas', summary: 'Resumo' };
  const lines = Object.entries(fields).filter(([key]) => payload[key] !== undefined && payload[key] !== null).map(([key, label]) => `${label}: ${states[String(payload[key])] ?? String(payload[key])}`);
  lines.push(`Data: ${new Date(createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
  const allowedPaths = ['/admin','/admin/leads','/admin/afiliados','/admin/comissoes','/admin/saques','/admin/pdv','/admin/campanhas'];
  const path = typeof payload.path === 'string' && allowedPaths.includes(payload.path) ? payload.path : '/admin';
  const url = `${APP_URL}${path}${entityId ? `?id=${encodeURIComponent(entityId)}` : ''}`;
  const text = ['Rocha Sales Seguros', subject, ...lines, url].join('\n');
  const html = `<html lang="pt-BR"><body style="background:#ffffff;color:#181818;font-family:Arial,sans-serif"><div style="max-width:600px;margin:auto;padding:32px;border-top:4px solid #C9A84C"><p>ROCHA SALES SEGUROS</p><h1 style="font-family:Georgia,serif;font-size:24px">${escapeHtml(subject)}</h1>${lines.map(line => `<p>${escapeHtml(line)}</p>`).join('')}<p><a href="${escapeHtml(url)}" style="color:#181818;background:#C9A84C;padding:12px 18px;display:inline-block">Abrir no painel</a></p></div></body></html>`;
  return { text, html };
}
const b64 = (value: string) => btoa(Array.from(new TextEncoder().encode(value), b => String.fromCharCode(b)).join(''));
export function rawEmail(sender: string, id: string, subject: string, text: string, html: string) {
  const boundary = `rocha-${id}`;
  const raw = [`From: Rocha Sales Seguros <${sender}>`, `To: ${RECIPIENT}`, `Reply-To: ${sender}`, `Date: ${new Date().toUTCString()}`, `Message-ID: <${id}@${sender.split('@')[1]}>`, `Subject: =?UTF-8?B?${b64(subject)}?=`, 'MIME-Version: 1.0', `Content-Type: multipart/alternative; boundary="${boundary}"`, '', `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(text), `--${boundary}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(html), `--${boundary}--`].join('\r\n');
  return b64(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}