-- Inserir conteúdo para a seção Hero
INSERT INTO public.site_content (section, content_key, title, description, value, icon, display_order, extra_data, is_active)
VALUES 
  ('hero', 'main', 'Indique. Converta. Ganhe.', 'Transforme suas indicações em comissões recorrentes. Seja um afiliado Rocha Sales Seguros e ganhe dinheiro indicando planos de saúde e seguros.', 'Programa de Afiliados', NULL, 1, '{"badge_affiliates": "+500 Afiliados", "badge_paid": "R$ 2M+ Pagos", "badge_commission": "30% Comissão", "cta_primary": "Quero ser Afiliado", "cta_secondary": "Já sou Afiliado"}', true);

-- Inserir conteúdo para a seção CTA
INSERT INTO public.site_content (section, content_key, title, description, value, icon, display_order, extra_data, is_active)
VALUES 
  ('cta', 'main', 'Pronto para Começar a Ganhar?', 'Junte-se a mais de 500 afiliados que já estão transformando indicações em comissões recorrentes.', NULL, NULL, 1, '{"benefits": ["Cadastro 100% gratuito", "Comissões de até 30%", "Pagamentos via PIX", "Suporte dedicado"], "cta_text": "Quero ser Afiliado Agora"}', true);

-- Inserir conteúdo para a seção Proposta de Valor
INSERT INTO public.site_content (section, content_key, title, description, value, icon, display_order, is_active)
VALUES 
  ('value_proposition', 'prop_1', 'Produtos de Qualidade', 'Trabalhamos com as melhores operadoras do mercado brasileiro', NULL, 'Sparkles', 1, true),
  ('value_proposition', 'prop_2', 'Altas Comissões', 'Até 30% de comissão em cada venda realizada', NULL, 'DollarSign', 2, true),
  ('value_proposition', 'prop_3', 'Pagamentos Confiáveis', 'Pagamento garantido via PIX assim que a venda é efetivada', NULL, 'Shield', 3, true);

-- Inserir conteúdo para a seção Produtos (editável)
INSERT INTO public.site_content (section, content_key, title, description, value, icon, display_order, extra_data, is_active)
VALUES 
  ('products', 'product_1', 'Planos de Saúde', 'Unimed, Bradesco Saúde, SulAmérica, Amil e mais', 'Até 30%', 'Heart', 1, '{"avgTicket": "R$ 350", "popularity": 5, "featured": true}', true),
  ('products', 'product_2', 'Seguro de Vida', 'Proteção financeira para você e sua família', 'Até 25%', 'Shield', 2, '{"avgTicket": "R$ 280", "popularity": 4, "featured": false}', true),
  ('products', 'product_3', 'Seguro Residencial', 'Proteção completa para seu lar', 'Até 20%', 'Home', 3, '{"avgTicket": "R$ 200", "popularity": 3, "featured": false}', true),
  ('products', 'product_4', 'Seguro Auto', 'Cobertura total para seu veículo', 'Até 15%', 'Car', 4, '{"avgTicket": "R$ 450", "popularity": 4, "featured": false}', true),
  ('products', 'product_5', 'Seguro Empresarial', 'Proteção completa para sua empresa', 'Até 20%', 'Briefcase', 5, '{"avgTicket": "R$ 500", "popularity": 3, "featured": false}', true),
  ('products', 'product_6', 'Outros Seguros', 'Viagem, pets, equipamentos e mais', 'Até 25%', 'Umbrella', 6, '{"avgTicket": "R$ 150", "popularity": 2, "featured": false}', true);