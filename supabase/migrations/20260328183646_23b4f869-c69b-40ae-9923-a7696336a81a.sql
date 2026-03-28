-- 1. Remove the overly permissive public INSERT policy on leads
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- 2. Add a restricted INSERT policy: only the service role (edge functions) can insert leads
-- Since the edge function uses service_role key, it bypasses RLS entirely.
-- We add an authenticated-only insert policy as a safer fallback for any direct inserts.
CREATE POLICY "Authenticated users can insert leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Add gestor SELECT policy for leads in their PDV
CREATE POLICY "Gestores can view leads in their PDV"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'gestor'::app_role)
    AND pdv_id IN (
      SELECT id FROM public.pdv WHERE manager_id = auth.uid()
    )
  );

-- 4. Add gestor UPDATE policy for leads in their PDV
CREATE POLICY "Gestores can update leads in their PDV"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'gestor'::app_role)
    AND pdv_id IN (
      SELECT id FROM public.pdv WHERE manager_id = auth.uid()
    )
  );