CREATE OR REPLACE FUNCTION public.claim_business_emails(_id uuid DEFAULT NULL) RETURNS SETOF public.email_notifications LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 UPDATE public.email_notifications SET status='uncertain',error_message='Resultado incerto: o envio foi iniciado, mas não houve confirmação. Revisar antes de reenviar.',lease_until=NULL WHERE status='sending' AND lease_until<now();
 UPDATE public.email_notifications SET status=CASE WHEN attempts>=5 THEN 'failed' ELSE 'pending' END,lease_until=NULL,error_message='Preparação interrompida; máximo de cinco tentativas.' WHERE status='processing' AND lease_until<now();
 RETURN QUERY WITH chosen AS (SELECT id FROM public.email_notifications WHERE status='pending' AND attempts<5 AND available_at<=now() AND (_id IS NULL OR id=_id) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 10) UPDATE public.email_notifications e SET status='processing',attempts=attempts+1,lease_until=now()+interval '3 minutes' FROM chosen WHERE e.id=chosen.id RETURNING e.*;
END $$;
REVOKE ALL ON FUNCTION public.claim_business_emails(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_business_emails(uuid) TO service_role;