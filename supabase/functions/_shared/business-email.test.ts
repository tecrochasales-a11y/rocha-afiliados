import { test, expect } from 'bun:test';
import { RECIPIENT, canSendAffiliate, retryDecision, rawEmail } from './business-email';
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