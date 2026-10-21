-- lovable-cron-fallback-reviewed: bounded email retry queue wakes on enqueue and unschedules after drain; at most 1440 runs/day only while occupied
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE TABLE public.email_notification_runtime (id boolean PRIMARY KEY DEFAULT true CHECK (id), enabled boolean NOT NULL DEFAULT false, worker_url text, worker_secret text, sender_email text, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.email_notification_runtime TO service_role;
ALTER TABLE public.email_notification_runtime ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.email_notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_key text UNIQUE NOT NULL, event_type text NOT NULL, entity_id uuid, recipient_email text NOT NULL DEFAULT 'andersonmenez@gmail.com' CHECK (recipient_email = 'andersonmenez@gmail.com'), subject text NOT NULL, payload jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sending','sent','failed','uncertain','skipped')), attempts integer NOT NULL DEFAULT 0, available_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz, provider_message_id text, error_message text, created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz);
GRANT SELECT ON public.email_notifications TO authenticated;
GRANT ALL ON public.email_notifications TO service_role;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_history_admin ON public.email_notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX email_notification_queue ON public.email_notifications(status, available_at);
CREATE FUNCTION public.email_queue_tick() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE cfg public.email_notification_runtime;
BEGIN
 SELECT * INTO cfg FROM public.email_notification_runtime WHERE id;
 IF NOT COALESCE(cfg.enabled,false) OR NOT EXISTS (SELECT 1 FROM public.email_notifications WHERE status IN ('pending','processing','sending')) THEN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='rocha-email-queue') THEN PERFORM cron.unschedule('rocha-email-queue'); END IF;
  RETURN;
 END IF;
 IF cfg.worker_url IS NOT NULL AND cfg.worker_secret IS NOT NULL THEN
  PERFORM net.http_post(url:=cfg.worker_url, headers:=jsonb_build_object('Content-Type','application/json','x-email-dispatch-secret',cfg.worker_secret), body:='{"action":"process"}'::jsonb, timeout_milliseconds:=55000);
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.email_queue_tick() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.email_queue_tick() TO service_role;
CREATE FUNCTION public.wake_email_queue() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF EXISTS (SELECT 1 FROM public.email_notification_runtime WHERE id AND enabled) AND EXISTS (SELECT 1 FROM public.email_notifications WHERE status IN ('pending','processing','sending')) AND NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname='rocha-email-queue') THEN
  PERFORM cron.schedule('rocha-email-queue','* * * * *','SELECT public.email_queue_tick();');
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.wake_email_queue() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wake_email_queue() TO service_role;
CREATE FUNCTION public.configure_email_worker(_url text, _secret text, _sender text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.email_notification_runtime(id,worker_url,worker_secret,sender_email) VALUES(true,_url,_secret,_sender) ON CONFLICT(id) DO UPDATE SET worker_url=excluded.worker_url,worker_secret=excluded.worker_secret,sender_email=excluded.sender_email,updated_at=now();
END $$;
REVOKE ALL ON FUNCTION public.configure_email_worker(text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.configure_email_worker(text,text,text) TO service_role;
CREATE FUNCTION public.enqueue_business_email(_key text,_type text,_entity uuid,_subject text,_payload jsonb,_delay integer DEFAULT 0) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.email_notifications(event_key,event_type,entity_id,subject,payload,available_at) VALUES(_key,_type,_entity,_subject,_payload,now()+make_interval(secs=>_delay)) ON CONFLICT(event_key) DO NOTHING;
 PERFORM public.wake_email_queue();
END $$;
REVOKE ALL ON FUNCTION public.enqueue_business_email(text,text,uuid,text,jsonb,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_business_email(text,text,uuid,text,jsonb,integer) TO service_role;
CREATE FUNCTION public.claim_business_emails(_id uuid DEFAULT NULL) RETURNS SETOF public.email_notifications LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 UPDATE public.email_notifications SET status='uncertain',error_message='Resultado incerto: o envio foi iniciado, mas não houve confirmação. Revisar antes de reenviar.',lease_until=NULL WHERE status='sending' AND lease_until<now();
 UPDATE public.email_notifications SET status='pending',lease_until=NULL WHERE status='processing' AND lease_until<now();
 RETURN QUERY WITH chosen AS (SELECT id FROM public.email_notifications WHERE status='pending' AND available_at<=now() AND (_id IS NULL OR id=_id) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 10) UPDATE public.email_notifications e SET status='processing',attempts=attempts+1,lease_until=now()+interval '3 minutes' FROM chosen WHERE e.id=chosen.id RETURNING e.*;
END $$;
REVOKE ALL ON FUNCTION public.claim_business_emails(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_business_emails(uuid) TO service_role;
CREATE FUNCTION public.capture_business_email() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE j jsonb:=to_jsonb(NEW); prev jsonb; fields text[]; f text; who uuid; affiliate_name text; pdv_name text; p jsonb; row_id uuid; label text; path text; evt text;
BEGIN
 IF TG_OP='UPDATE' THEN prev:=to_jsonb(OLD); ELSE prev:='{}'::jsonb; END IF;
 row_id:=(j->>'id')::uuid;
 IF TG_TABLE_NAME='user_roles' THEN
  IF j->>'role'<>'affiliate' THEN RETURN NEW; END IF;
  who:=(j->>'user_id')::uuid;
  IF EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=who AND role IN ('admin','gestor')) THEN RETURN NEW; END IF;
  SELECT full_name INTO affiliate_name FROM public.profiles WHERE id=who;
  PERFORM public.enqueue_business_email('affiliate-created:'||who,'affiliate_created',who,'Novo afiliado',jsonb_build_object('name',affiliate_name,'affiliate_id',who,'path','/admin/afiliados'),120);
  RETURN NEW;
 END IF;
 who:=COALESCE((j->>'affiliate_id')::uuid,CASE WHEN TG_TABLE_NAME='profiles' THEN row_id END);
 SELECT full_name INTO affiliate_name FROM public.profiles WHERE id=who;
 SELECT name INTO pdv_name FROM public.pdv WHERE id=COALESCE((j->>'pdv_id')::uuid,(SELECT pdv_id FROM public.profiles WHERE id=who));
 path:=CASE TG_TABLE_NAME WHEN 'leads' THEN '/admin/leads' WHEN 'commissions' THEN '/admin/comissoes' WHEN 'withdrawals' THEN '/admin/saques' WHEN 'profiles' THEN '/admin/pdv' WHEN 'campaigns' THEN '/admin/campanhas' ELSE '/admin' END;
 p:=jsonb_strip_nulls(jsonb_build_object('name',j->>'name','affiliate',affiliate_name,'pdv',pdv_name,'path',path,'amount',j->>'amount','installment',j->>'installment_number','total_installments',j->>'total_installments','status',j->>'status'));
 IF TG_TABLE_NAME='notifications' THEN
  IF j->>'type' IN ('lead_converted','lead_lost','commission_released','commission_paid','withdrawal_approved','withdrawal_paid','campaign') THEN RETURN NEW; END IF;
  PERFORM public.enqueue_business_email('notification:'||row_id,'notification',row_id,COALESCE(j->>'title','Notificação'),jsonb_build_object('summary',j->>'message','path','/admin'));
  RETURN NEW;
 END IF;
 IF TG_OP='INSERT' THEN
  evt:=CASE TG_TABLE_NAME WHEN 'leads' THEN 'lead_created' WHEN 'commissions' THEN 'commission_created' WHEN 'withdrawals' THEN 'withdrawal_created' WHEN 'campaigns' THEN 'campaign_created' END;
  label:=CASE TG_TABLE_NAME WHEN 'leads' THEN 'Nova indicação' WHEN 'commissions' THEN 'Nova comissão' WHEN 'withdrawals' THEN 'Nova solicitação de saque' WHEN 'campaigns' THEN 'Nova campanha' END;
  IF evt IS NOT NULL THEN PERFORM public.enqueue_business_email(evt||':'||row_id,evt,row_id,label,p); END IF;
 ELSE
  fields:=CASE TG_TABLE_NAME WHEN 'leads' THEN ARRAY['status','payment_status'] WHEN 'commissions' THEN ARRAY['status'] WHEN 'withdrawals' THEN ARRAY['status'] WHEN 'profiles' THEN ARRAY['pdv_id'] WHEN 'campaigns' THEN ARRAY['is_active'] ELSE ARRAY[]::text[] END;
  FOREACH f IN ARRAY fields LOOP
   IF j->f IS DISTINCT FROM prev->f THEN
    evt:=CASE WHEN TG_TABLE_NAME='leads' AND f='payment_status' THEN 'lead_payment_changed' WHEN TG_TABLE_NAME='leads' THEN 'lead_status_changed' WHEN TG_TABLE_NAME='commissions' THEN 'commission_status_changed' WHEN TG_TABLE_NAME='withdrawals' THEN 'withdrawal_status_changed' WHEN TG_TABLE_NAME='profiles' THEN 'affiliate_pdv_changed' ELSE 'campaign_status_changed' END;
    label:=CASE evt WHEN 'lead_payment_changed' THEN 'Pagamento do cliente atualizado' WHEN 'lead_status_changed' THEN 'Situação da indicação atualizada' WHEN 'commission_status_changed' THEN 'Situação da comissão atualizada' WHEN 'withdrawal_status_changed' THEN 'Situação do saque atualizada' WHEN 'affiliate_pdv_changed' THEN 'Vínculo ao PDV atualizado' ELSE 'Situação da campanha atualizada' END;
    IF TG_TABLE_NAME<>'profiles' OR public.has_role(row_id,'affiliate') THEN
     PERFORM public.enqueue_business_email(evt||':'||row_id||':'||gen_random_uuid(),evt,row_id,label,p||jsonb_build_object('previous',prev->f,'current',j->f));
    END IF;
   END IF;
  END LOOP;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.capture_business_email() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER email_affiliate_created AFTER INSERT ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.capture_business_email();
CREATE TRIGGER email_lead_events AFTER INSERT OR UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.capture_business_email();
CREATE TRIGGER email_commission_events AFTER INSERT OR UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.capture_business_email();
CREATE TRIGGER email_withdrawal_events AFTER INSERT OR UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.capture_business_email();
CREATE TRIGGER email_pdv_events AFTER UPDATE OF pdv_id ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.capture_business_email();
CREATE TRIGGER email_campaign_events AFTER INSERT OR UPDATE OF is_active ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.capture_business_email();
CREATE TRIGGER email_other_notification AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.capture_business_email();