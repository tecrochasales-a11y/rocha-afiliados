
-- Remove duplicate commissions: keep only the first commission per lead
DELETE FROM public.commissions
WHERE id NOT IN (
  SELECT DISTINCT ON (lead_id) id
  FROM public.commissions
  WHERE lead_id IS NOT NULL
  ORDER BY lead_id, created_at ASC
);
