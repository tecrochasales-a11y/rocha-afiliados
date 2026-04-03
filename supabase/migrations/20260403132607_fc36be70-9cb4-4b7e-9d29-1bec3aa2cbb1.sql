
CREATE TABLE public.n8n_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_type TEXT NOT NULL DEFAULT 'all',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.n8n_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage n8n_webhooks" ON public.n8n_webhooks
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing webhook URL if exists
INSERT INTO public.n8n_webhooks (name, webhook_url, webhook_type)
SELECT 'Webhook Principal', value, 'all'
FROM public.app_settings
WHERE key = 'n8n_webhook_url' AND value IS NOT NULL AND value != '';
