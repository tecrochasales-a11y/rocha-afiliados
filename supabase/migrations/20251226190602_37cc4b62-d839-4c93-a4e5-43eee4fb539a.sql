-- Allow public to view profiles by tracking_code (needed for referral links)
CREATE POLICY "Anyone can view profile by tracking_code" 
ON public.profiles 
FOR SELECT 
USING (tracking_code IS NOT NULL);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Gestores can view profiles in their PDV
CREATE POLICY "Gestores can view profiles in their PDV" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'gestor'::app_role) 
  AND pdv_id IN (
    SELECT id FROM pdv WHERE manager_id = auth.uid()
  )
);