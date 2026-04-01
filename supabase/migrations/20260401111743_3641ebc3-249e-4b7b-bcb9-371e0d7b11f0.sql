
-- Recalculate all existing commissions based on current app_settings
DO $$
DECLARE
  comm_pct NUMERIC;
  num_inst INTEGER;
  rec RECORD;
  new_total NUMERIC;
  new_installment NUMERIC;
  new_pct_per_inst NUMERIC;
BEGIN
  SELECT COALESCE((SELECT value::NUMERIC FROM public.app_settings WHERE key = 'commission_percentage'), 30.00) INTO comm_pct;
  SELECT COALESCE((SELECT value::INTEGER FROM public.app_settings WHERE key = 'commission_installments'), 1) INTO num_inst;

  -- For each lead that has commissions, delete old and recreate
  FOR rec IN 
    SELECT DISTINCT lead_id, affiliate_id, product_id, base_sale_value
    FROM public.commissions
    WHERE lead_id IS NOT NULL AND base_sale_value IS NOT NULL
  LOOP
    -- Delete old commissions for this lead
    DELETE FROM public.commissions WHERE lead_id = rec.lead_id AND affiliate_id = rec.affiliate_id;
    
    -- Recalculate
    new_total := rec.base_sale_value * (comm_pct / 100);
    new_installment := new_total / num_inst;
    new_pct_per_inst := comm_pct / num_inst;
    
    FOR i IN 1..num_inst LOOP
      INSERT INTO public.commissions (
        lead_id, affiliate_id, product_id, amount, percentage,
        status, installment_number, total_installments, due_date, base_sale_value
      ) VALUES (
        rec.lead_id, rec.affiliate_id, rec.product_id, new_installment, new_pct_per_inst,
        CASE WHEN i = 1 THEN 'pending' ELSE 'scheduled' END,
        i, num_inst,
        CURRENT_DATE + ((i - 1) * INTERVAL '30 days'),
        rec.base_sale_value
      );
    END LOOP;
  END LOOP;
END $$;

-- Fix notification function to use dynamic text
CREATE OR REPLACE FUNCTION public.create_lead_result_notification(
  _affiliate_id uuid, _lead_name text, _converted boolean,
  _commission_amount numeric DEFAULT NULL, _rejection_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  num_inst INTEGER;
BEGIN
  IF _converted THEN
    SELECT COALESCE((SELECT value::INTEGER FROM public.app_settings WHERE key = 'commission_installments'), 1)
    INTO num_inst;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      _affiliate_id,
      'Indicação Convertida! 🎉',
      'Sua indicação ' || _lead_name || ' foi convertida! Você receberá R$ ' || 
      ROUND(_commission_amount::numeric, 2)::text ||
      CASE WHEN num_inst > 1 THEN ' em ' || num_inst || ' parcelas mensais.' ELSE ' em parcela única.' END,
      'lead_converted'
    );
  ELSE
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      _affiliate_id,
      'Indicação não convertida',
      'Infelizmente a indicação ' || _lead_name || ' não fechou. Motivo: ' || 
      COALESCE(_rejection_reason, 'Não informado'),
      'lead_lost'
    );
  END IF;
END;
$fn$;
