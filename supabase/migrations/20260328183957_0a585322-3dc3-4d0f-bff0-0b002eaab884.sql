-- 1. Drop the overly permissive tracking code policy
DROP POLICY IF EXISTS "Anyone can view profile by tracking_code" ON public.profiles;

-- 2. Create a secure RPC that returns only safe fields for tracking code lookup
CREATE OR REPLACE FUNCTION public.get_affiliate_by_tracking_code(_tracking_code text)
RETURNS TABLE(id uuid, full_name text, tracking_code text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.tracking_code
  FROM public.profiles p
  WHERE p.tracking_code = _tracking_code
  LIMIT 1;
$$;