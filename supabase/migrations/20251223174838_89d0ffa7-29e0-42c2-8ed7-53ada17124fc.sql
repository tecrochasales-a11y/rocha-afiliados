-- Migração 2: Criar novas tabelas e estruturas

-- 2.1 Criar tabela PDV (Pontos de Venda)
CREATE TABLE public.pdv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2.2 Criar tabela Campaigns (Campanhas)
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  bonus_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  target_affiliates INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2.3 Criar tabela Site Assets (Gestão Visual)
CREATE TABLE public.site_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('logo', 'video', 'image', 'banner', 'favicon')),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 2.4 Criar tabela Notifications (Notificações)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'warning', 'info', 'error', 'lead_converted', 'lead_lost', 'commission_released', 'withdrawal_approved', 'campaign')),
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2.5 Alterar tabela leads - adicionar rejection_reason e pdv_id
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS pdv_id UUID REFERENCES public.pdv(id);

-- 2.6 Alterar tabela commissions - adicionar campos para parcelas
ALTER TABLE public.commissions 
  ADD COLUMN IF NOT EXISTS installment_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_installments INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS base_sale_value NUMERIC;

-- 2.7 Alterar tabela profiles - adicionar pdv_id
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS pdv_id UUID REFERENCES public.pdv(id);

-- 2.8 Habilitar RLS nas novas tabelas
ALTER TABLE public.pdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2.9 Políticas RLS para PDV
CREATE POLICY "Admins can manage PDV" ON public.pdv
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Gestores can view their PDV" ON public.pdv
  FOR SELECT USING (has_role(auth.uid(), 'gestor') AND manager_id = auth.uid());

CREATE POLICY "Affiliates can view active PDV" ON public.pdv
  FOR SELECT USING (is_active = true);

-- 2.10 Políticas RLS para Campaigns
CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Gestores can view campaigns" ON public.campaigns
  FOR SELECT USING (has_role(auth.uid(), 'gestor'));

CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (is_active = true);

-- 2.11 Políticas RLS para Site Assets
CREATE POLICY "Admins can manage site_assets" ON public.site_assets
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Gestores can manage site_assets" ON public.site_assets
  FOR ALL USING (has_role(auth.uid(), 'gestor'));

CREATE POLICY "Anyone can view active site_assets" ON public.site_assets
  FOR SELECT USING (is_active = true);

-- 2.12 Políticas RLS para Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Gestores can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'admin'));

-- 2.13 Criar triggers para updated_at nas novas tabelas
CREATE TRIGGER update_pdv_updated_at
  BEFORE UPDATE ON public.pdv
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_assets_updated_at
  BEFORE UPDATE ON public.site_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2.14 Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_pdv_id ON public.leads(pdv_id);
CREATE INDEX IF NOT EXISTS idx_leads_rejection_reason ON public.leads(rejection_reason) WHERE rejection_reason IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commissions_due_date ON public.commissions(due_date);
CREATE INDEX IF NOT EXISTS idx_commissions_installment ON public.commissions(installment_number);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_pdv_id ON public.profiles(pdv_id);

-- 2.15 Função para criar comissões parceladas (75% em 3x de 25%)
CREATE OR REPLACE FUNCTION public.create_installment_commissions(
  _lead_id UUID,
  _affiliate_id UUID,
  _product_id UUID,
  _sale_value NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_commission NUMERIC;
  installment_amount NUMERIC;
  commission_percentage NUMERIC := 75.00;
BEGIN
  -- Calcula 75% do valor da venda
  total_commission := _sale_value * (commission_percentage / 100);
  
  -- Cada parcela é 25% do valor da venda (75% / 3)
  installment_amount := total_commission / 3;
  
  -- Parcela 1: Imediata (pending)
  INSERT INTO public.commissions (
    lead_id, affiliate_id, product_id, amount, percentage, 
    status, installment_number, total_installments, due_date, base_sale_value
  ) VALUES (
    _lead_id, _affiliate_id, _product_id, installment_amount, 25.00,
    'pending', 1, 3, CURRENT_DATE, _sale_value
  );
  
  -- Parcela 2: 30 dias (scheduled)
  INSERT INTO public.commissions (
    lead_id, affiliate_id, product_id, amount, percentage,
    status, installment_number, total_installments, due_date, base_sale_value
  ) VALUES (
    _lead_id, _affiliate_id, _product_id, installment_amount, 25.00,
    'scheduled', 2, 3, CURRENT_DATE + INTERVAL '30 days', _sale_value
  );
  
  -- Parcela 3: 60 dias (scheduled)
  INSERT INTO public.commissions (
    lead_id, affiliate_id, product_id, amount, percentage,
    status, installment_number, total_installments, due_date, base_sale_value
  ) VALUES (
    _lead_id, _affiliate_id, _product_id, installment_amount, 25.00,
    'scheduled', 3, 3, CURRENT_DATE + INTERVAL '60 days', _sale_value
  );
END;
$$;

-- 2.16 Função para criar notificação de resultado de lead
CREATE OR REPLACE FUNCTION public.create_lead_result_notification(
  _affiliate_id UUID,
  _lead_name TEXT,
  _converted BOOLEAN,
  _commission_amount NUMERIC DEFAULT NULL,
  _rejection_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _converted THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      _affiliate_id,
      'Indicação Convertida! 🎉',
      'Sua indicação ' || _lead_name || ' foi convertida! Você receberá R$ ' || 
      ROUND(_commission_amount::numeric, 2)::text || ' em 3 parcelas mensais.',
      'lead_converted'
    );
  ELSE
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      _affiliate_id,
      'Indicação não convertida',
      'Infelizmente a indicação ' || _lead_name || ' não fechou. Motivo: ' || 
      COALESCE(_rejection_reason, 'Não informado'),
      'lead_lost'
    );
  END IF;
END;
$$;