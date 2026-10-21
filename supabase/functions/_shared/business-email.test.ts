import { test, expect } from 'bun:test';
import { RECIPIENT, canSendAffiliate, retryDecision, rawEmail, emailDestination } from './business-email';
test('all notifications target only Anderson', () => {
  expect(RECIPIENT).toBe('andersonmenez@gmail.com');
  const raw = rawEmail('sender@example.com','abc','Aviso','Texto','<p>Texto</p>');
  const decoded = Buffer.from(raw,'base64url').toString('utf8');
  expect(decoded).toContain('To: andersonmenez@gmail.com\r\n');
  expect(decoded).not.toContain('Cc:');
});
test('admin and gestor accounts do not generate affiliate signup emails', () => {
  expect(canSendAffiliate(['affiliate'])).toBe(true);
  expect(canSendAffiliate(['affiliate','admin'])).toBe(false);
  expect(canSendAffiliate(['affiliate','gestor'])).toBe(false);
});
test('rate-limit retries stop after five attempts', () => {
  expect(retryDecision(429,4)).toBe('pending');
  expect(retryDecision(429,5)).toBe('failed');
});
test('ambiguous provider errors never blindly resend', () => {
  expect(retryDecision(503,1)).toBe('uncertain');
  expect(retryDecision(400,1)).toBe('failed');
});
test('email links open the corresponding record on the published app', () => {
  for (const path of ['/admin/leads','/admin/afiliados','/admin/comissoes','/admin/saques','/admin/pdv','/admin/campanhas']) {
    expect(emailDestination({path}, 'record-123')).toBe(`https://rocha-afiliados.lovable.app${path}?id=record-123`);
  }
});
test('PDV assignment links target the affiliate identified by the event', () => {
  expect(emailDestination({path:'/admin/pdv'},'profile-123','affiliate_pdv_changed')).toBe('https://rocha-afiliados.lovable.app/admin/afiliados?id=profile-123');
});
test('unrecognized paths cannot redirect email links to external sites', () => {
  expect(emailDestination({path:'https://evil.example'},'record-123')).toBe('https://rocha-afiliados.lovable.app/admin');
});