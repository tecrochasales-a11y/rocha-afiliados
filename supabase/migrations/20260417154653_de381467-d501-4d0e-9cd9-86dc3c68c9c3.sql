CREATE TABLE public.banner_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.banner_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own banner templates"
ON public.banner_templates FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own banner templates"
ON public.banner_templates FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own banner templates"
ON public.banner_templates FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own banner templates"
ON public.banner_templates FOR DELETE
USING (user_id = auth.uid());

CREATE TRIGGER update_banner_templates_updated_at
BEFORE UPDATE ON public.banner_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_banner_templates_user_id ON public.banner_templates(user_id);