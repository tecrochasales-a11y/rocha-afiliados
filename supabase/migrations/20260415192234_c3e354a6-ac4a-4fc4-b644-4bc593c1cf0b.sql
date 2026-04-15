CREATE POLICY "Gestores can view commissions in their PDV"
ON public.commissions FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  AND affiliate_id IN (
    SELECT p.id FROM public.profiles p
    WHERE p.pdv_id IN (
      SELECT pdv.id FROM public.pdv
      WHERE pdv.manager_id = auth.uid()
    )
  )
);