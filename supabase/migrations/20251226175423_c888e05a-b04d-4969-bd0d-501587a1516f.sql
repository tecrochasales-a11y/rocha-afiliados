-- Adicionar campo para status de pagamento do cliente na tabela leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Comentário explicativo sobre os status de pagamento:
-- pending: Aguardando pagamento do cliente
-- paid: Cliente pagou a proposta
-- cancelled: Proposta cancelada/não paga

COMMENT ON COLUMN public.leads.payment_status IS 'Status do pagamento da proposta pelo cliente: pending, paid, cancelled';