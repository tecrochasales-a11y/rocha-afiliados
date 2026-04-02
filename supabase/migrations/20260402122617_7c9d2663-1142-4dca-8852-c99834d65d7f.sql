
CREATE TABLE public.payment_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#6b7280',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment_statuses" ON public.payment_statuses
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active payment_statuses" ON public.payment_statuses
  FOR SELECT TO public USING (is_active = true);

INSERT INTO public.payment_statuses (name, key, color, display_order) VALUES
  ('Pendente', 'pending', '#f59e0b', 1),
  ('Pago', 'pago', '#10b981', 2),
  ('Cancelado', 'cancelado', '#ef4444', 3);
