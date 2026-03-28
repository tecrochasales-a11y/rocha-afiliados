-- Replace the broad authenticated INSERT with a more specific one
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;

-- Only allow authenticated affiliates to insert leads where affiliate_id matches their own ID
CREATE POLICY "Affiliates can insert their own leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (affiliate_id = auth.uid());