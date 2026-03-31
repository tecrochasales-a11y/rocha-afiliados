
DROP FUNCTION IF EXISTS public.create_installment_commissions(uuid, uuid, uuid, numeric);

CREATE FUNCTION public.create_installment_commissions(
  _affiliate_id uuid,
  _lead_id uuid,
  _product_id uuid,
  _sale_value numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_commission NUMERIC;
  installment_amount NUMERIC;
  commission_percentage NUMERIC;
  num_installments INTEGER;
  percentage_per_installment NUMERIC;
  i INTEGER;
BEGIN
  SELECT COALESCE((SELECT value::NUMERIC FROM public.app_settings WHERE key = 'commission_percentage'), 30.00)
  INTO commission_percentage;
  
  SELECT COALESCE((SELECT value::INTEGER FROM public.app_settings WHERE key = 'commission_installments'), 1)
  INTO num_installments;

  total_commission := _sale_value * (commission_percentage / 100);
  installment_amount := total_commission / num_installments;
  percentage_per_installment := commission_percentage / num_installments;

  FOR i IN 1..num_installments LOOP
    INSERT INTO public.commissions (
      lead_id, affiliate_id, product_id, amount, percentage,
      status, installment_number, total_installments, due_date, base_sale_value
    ) VALUES (
      _lead_id, _affiliate_id, _product_id, installment_amount, percentage_per_installment,
      CASE WHEN i = 1 THEN 'pending' ELSE 'scheduled' END,
      i, num_installments,
      CURRENT_DATE + ((i - 1) * INTERVAL '30 days'),
      _sale_value
    );
  END LOOP;
END;
$$;
