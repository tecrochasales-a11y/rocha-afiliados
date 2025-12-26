-- Tabela para perguntas do formulário de leads (configurável pelo admin)
CREATE TABLE public.lead_form_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  field_key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('radio', 'select', 'text', 'multi_select', 'contact', 'confirmation')),
  options JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conditional_field TEXT,
  conditional_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações globais do app (inclui API keys)
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expandir tabela leads com novos campos
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS company_type TEXT,
  ADD COLUMN IF NOT EXISTS has_health_plan TEXT,
  ADD COLUMN IF NOT EXISTS monthly_income TEXT,
  ADD COLUMN IF NOT EXISTS health_plan_investment TEXT,
  ADD COLUMN IF NOT EXISTS adjustment_month TEXT,
  ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
  ADD COLUMN IF NOT EXISTS covered_ages TEXT,
  ADD COLUMN IF NOT EXISTS cnpj_or_region TEXT,
  ADD COLUMN IF NOT EXISTS accepts_whatsapp BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS form_responses JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'affiliate_link';

-- Enable RLS
ALTER TABLE public.lead_form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead_form_questions
CREATE POLICY "Admins can manage lead_form_questions" 
ON public.lead_form_questions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active questions" 
ON public.lead_form_questions 
FOR SELECT 
USING (is_active = true);

-- RLS policies for app_settings
CREATE POLICY "Admins can manage app_settings" 
ON public.app_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_lead_form_questions_updated_at
BEFORE UPDATE ON public.lead_form_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir perguntas padrão do formulário
INSERT INTO public.lead_form_questions (question, field_key, type, options, display_order, is_required) VALUES
('Você é MEI ou CNPJ?', 'company_type', 'radio', '[{"value": "mei", "label": "MEI"}, {"value": "cnpj", "label": "CNPJ"}]'::jsonb, 1, true),
('Você já tem um plano de saúde?', 'has_health_plan', 'radio', '[{"value": "sim", "label": "Sim"}, {"value": "nao", "label": "Não"}]'::jsonb, 2, true),
('Qual a sua renda mensal?', 'monthly_income', 'select', '[{"value": "ate_2000", "label": "Até R$ 2.000"}, {"value": "2000_5000", "label": "R$ 2.000 a R$ 5.000"}, {"value": "5000_10000", "label": "R$ 5.000 a R$ 10.000"}, {"value": "acima_10000", "label": "Acima de R$ 10.000"}]'::jsonb, 3, true),
('Qual valor você investe em plano de saúde mensalmente?', 'health_plan_investment', 'select', '[{"value": "nao_tenho", "label": "Não tenho plano"}, {"value": "ate_500", "label": "Até R$ 500"}, {"value": "500_1000", "label": "R$ 500 a R$ 1.000"}, {"value": "acima_1000", "label": "Acima de R$ 1.000"}]'::jsonb, 4, true),
('Qual o mês de reajuste do seu plano?', 'adjustment_month', 'select', '[{"value": "janeiro", "label": "Janeiro"}, {"value": "fevereiro", "label": "Fevereiro"}, {"value": "marco", "label": "Março"}, {"value": "abril", "label": "Abril"}, {"value": "maio", "label": "Maio"}, {"value": "junho", "label": "Junho"}, {"value": "julho", "label": "Julho"}, {"value": "agosto", "label": "Agosto"}, {"value": "setembro", "label": "Setembro"}, {"value": "outubro", "label": "Outubro"}, {"value": "novembro", "label": "Novembro"}, {"value": "dezembro", "label": "Dezembro"}, {"value": "nao_sei", "label": "Não sei informar"}]'::jsonb, 5, false),
('Qual a seguradora do seu plano atual?', 'insurance_provider', 'select', '[{"value": "bradesco", "label": "Bradesco Saúde"}, {"value": "sulamerica", "label": "SulAmérica"}, {"value": "unimed", "label": "Unimed"}, {"value": "porto_seguro", "label": "Porto Seguro"}, {"value": "amil", "label": "Amil"}, {"value": "notredame", "label": "NotreDame Intermédica"}, {"value": "hapvida", "label": "Hapvida"}, {"value": "outra", "label": "Outra"}, {"value": "nenhuma", "label": "Não tenho plano"}]'::jsonb, 6, false),
('Quais as idades das pessoas que serão cobertas?', 'covered_ages', 'multi_select', '[{"value": "0_18", "label": "0 a 18 anos"}, {"value": "19_23", "label": "19 a 23 anos"}, {"value": "24_28", "label": "24 a 28 anos"}, {"value": "29_33", "label": "29 a 33 anos"}, {"value": "34_38", "label": "34 a 38 anos"}, {"value": "39_43", "label": "39 a 43 anos"}, {"value": "44_48", "label": "44 a 48 anos"}, {"value": "49_53", "label": "49 a 53 anos"}, {"value": "54_58", "label": "54 a 58 anos"}, {"value": "59_plus", "label": "59 anos ou mais"}]'::jsonb, 7, true),
('Qual o seu CNPJ ou região de interesse?', 'cnpj_or_region', 'text', '[]'::jsonb, 8, false),
('Seus dados de contato', 'contact_info', 'contact', '[]'::jsonb, 9, true),
('Confirme suas informações', 'confirmation', 'confirmation', '[]'::jsonb, 10, true);

-- Inserir configurações padrão do CRM
INSERT INTO public.app_settings (key, value, description, is_secret) VALUES
('painel_corretor_api_key', '', 'Chave de API do Painel do Corretor', true),
('painel_corretor_produto_id', '', 'ID do produto padrão no CRM', false),
('painel_corretor_etiquetas', 'fonte:afiliado', 'Etiquetas padrão para leads (separadas por vírgula)', false);