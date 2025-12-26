-- Create testimonials table for dynamic testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_initials TEXT,
  avatar_url TEXT,
  content TEXT NOT NULL,
  earnings TEXT NOT NULL,
  period TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
  video_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials
FOR SELECT
USING (is_active = true);

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true);

-- Allow public read access to site-assets bucket
CREATE POLICY "Anyone can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Admins can upload to site-assets bucket
CREATE POLICY "Admins can upload site assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update site assets
CREATE POLICY "Admins can update site assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete site assets
CREATE POLICY "Admins can delete site assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- Insert some initial testimonials data (real structure, you can update via admin)
INSERT INTO public.testimonials (name, role, avatar_initials, content, earnings, period, stars, display_order)
VALUES 
  ('Carlos Silva', 'Afiliado desde 2022', 'CS', 'Em apenas 6 meses, consegui uma renda extra significativa indicando planos de saúde para amigos e conhecidos. O sistema é muito transparente e os pagamentos sempre chegam no prazo.', 'R$ 15.000+', 'em 6 meses', 5, 1),
  ('Ana Rodrigues', 'Afiliada desde 2021', 'AR', 'A melhor decisão que tomei foi me tornar afiliada. Trabalho no meu tempo, sem pressão, e ainda consigo ajudar pessoas a encontrarem o plano ideal. As comissões são muito justas!', 'R$ 42.000+', 'em 1 ano', 5, 2),
  ('Pedro Santos', 'Afiliado desde 2023', 'PS', 'O dashboard é incrível! Consigo acompanhar cada lead em tempo real. O suporte é excepcional e sempre me ajudam quando preciso. Recomendo para quem quer uma renda extra séria.', 'R$ 8.500+', 'em 3 meses', 5, 3);