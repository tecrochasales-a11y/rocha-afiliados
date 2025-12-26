-- Create table for editable site content sections
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  title TEXT,
  description TEXT,
  value TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  extra_data JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section, content_key)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view active content
CREATE POLICY "Anyone can view active site_content"
ON public.site_content
FOR SELECT
USING (is_active = true);

-- Admins can manage all content
CREATE POLICY "Admins can manage site_content"
ON public.site_content
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial content for "Como Funciona" section
INSERT INTO public.site_content (section, content_key, title, description, icon, display_order) VALUES
('how_it_works', 'step_1', 'Cadastre-se', 'Crie sua conta gratuitamente em menos de 2 minutos. Sem taxas de adesão.', 'UserPlus', 1),
('how_it_works', 'step_2', 'Indique', 'Compartilhe seu link exclusivo com amigos, familiares e sua rede de contatos.', 'Share2', 2),
('how_it_works', 'step_3', 'Cliente Fecha', 'Quando seu indicado contratar um plano ou seguro, a venda é rastreada automaticamente.', 'CheckCircle', 3),
('how_it_works', 'step_4', 'Receba', 'Sua comissão é creditada assim que o contrato é efetivado. Saque via PIX.', 'Wallet', 4);

-- Insert initial content for "Benefícios" section
INSERT INTO public.site_content (section, content_key, title, description, icon, display_order) VALUES
('benefits', 'benefit_1', 'Comissões Competitivas', 'Ganhe até 30% de comissão em cada venda realizada. Valores reais no mercado de seguros.', 'Wallet', 1),
('benefits', 'benefit_2', 'Pagamentos Rápidos', 'Receba suas comissões via PIX assim que o contrato é efetivado. Sem burocracia.', 'Clock', 2),
('benefits', 'benefit_3', 'Dashboard Completo', 'Acompanhe suas indicações, conversões e ganhos em tempo real pelo painel.', 'BarChart3', 3),
('benefits', 'benefit_4', 'Rastreamento Seguro', 'Tecnologia de tracking precisa para garantir que você receba por cada indicação.', 'Shield', 4),
('benefits', 'benefit_5', 'Suporte Dedicado', 'Equipe especializada para ajudar você e seus indicados durante todo o processo.', 'Headphones', 5),
('benefits', 'benefit_6', 'Bonificações Extras', 'Campanhas especiais com bônus adicionais para afiliados com melhor performance.', 'Gift', 6),
('benefits', 'benefit_7', 'Múltiplos Produtos', 'Indique planos de saúde, seguros de vida, auto, residencial e muito mais.', 'TrendingUp', 7),
('benefits', 'benefit_8', 'Cadastro Rápido', 'Em menos de 2 minutos você está pronto para começar a indicar e ganhar.', 'Zap', 8);

-- Insert initial content for "Resultados" section
INSERT INTO public.site_content (section, content_key, title, description, value, icon, display_order, extra_data) VALUES
('results', 'level_1', 'Iniciante', 'Indicando para amigos e família próxima', 'R$ 600', null, 1, '{"leads": "5 indicações/mês", "conversions": "2 vendas", "period": "/mês", "highlight": false}'),
('results', 'level_2', 'Intermediário', 'Expandindo para conhecidos e redes sociais', 'R$ 1.800', null, 2, '{"leads": "15 indicações/mês", "conversions": "6 vendas", "period": "/mês", "highlight": true}'),
('results', 'level_3', 'Avançado', 'Estratégia ativa de captação de leads', 'R$ 4.800', null, 3, '{"leads": "40 indicações/mês", "conversions": "16 vendas", "period": "/mês", "highlight": false}');

-- Insert initial content for "Stats" section
INSERT INTO public.site_content (section, content_key, title, description, value, icon, display_order) VALUES
('stats', 'stat_1', 'Afiliados Ativos', 'Parceiros gerando renda', '500+', 'Users', 1),
('stats', 'stat_2', 'Comissões Pagas', 'Desde o início do programa', 'R$ 2M+', 'DollarSign', 2),
('stats', 'stat_3', 'Comissão Média', 'Por venda realizada', '30%', 'TrendingUp', 3),
('stats', 'stat_4', 'Anos de Mercado', 'Credibilidade garantida', '10+', 'Award', 4);