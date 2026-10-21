DO $$
DECLARE a uuid; l uuid; c uuid; w uuid; campaign uuid; baseline integer; n integer;
BEGIN
 SELECT p.id INTO a FROM public.profiles p WHERE public.has_role(p.id,'affiliate') AND NOT public.has_role(p.id,'admin') AND NOT public.has_role(p.id,'gestor') LIMIT 1;
 IF a IS NULL THEN RAISE EXCEPTION 'An affiliate fixture is required'; END IF;
 BEGIN
  SELECT count(*) INTO baseline FROM public.email_notifications;
  INSERT INTO public.leads(name,email,affiliate_id,status) VALUES('TESTE EMAIL - rollback','teste@example.invalid',a,'pending') RETURNING id INTO l;
  SELECT count(*) INTO n FROM public.email_notifications WHERE event_type='lead_created' AND entity_id=l AND recipient_email='andersonmenez@gmail.com';
  IF n<>1 THEN RAISE EXCEPTION 'New lead must enqueue one email to Anderson'; END IF;
  UPDATE public.leads SET status='contacted' WHERE id=l;
  UPDATE public.leads SET status='contacted' WHERE id=l;
  SELECT count(*) INTO n FROM public.email_notifications WHERE event_type='lead_status_changed' AND entity_id=l;
  IF n<>1 THEN RAISE EXCEPTION 'Unchanged status must not enqueue'; END IF;
  UPDATE public.leads SET payment_status='paid' WHERE id=l;
  SELECT count(*) INTO n FROM public.email_notifications WHERE event_type='lead_payment_changed' AND entity_id=l;
  IF n<>1 THEN RAISE EXCEPTION 'Payment change must enqueue'; END IF;
  INSERT INTO public.commissions(affiliate_id,lead_id,amount,percentage,status) VALUES(a,l,1,1,'pending') RETURNING id INTO c;
  UPDATE public.commissions SET status='paid' WHERE id=c;
  SELECT count(*) INTO n FROM public.email_notifications WHERE entity_id=c AND event_type IN ('commission_created','commission_status_changed');
  IF n<>2 THEN RAISE EXCEPTION 'Commission create and change must enqueue'; END IF;
  INSERT INTO public.withdrawals(affiliate_id,amount,pix_key,status) VALUES(a,1,'TESTE','pending') RETURNING id INTO w;
  UPDATE public.withdrawals SET status='approved' WHERE id=w;
  SELECT count(*) INTO n FROM public.email_notifications WHERE entity_id=w AND event_type IN ('withdrawal_created','withdrawal_status_changed');
  IF n<>2 THEN RAISE EXCEPTION 'Withdrawal create and change must enqueue'; END IF;
  INSERT INTO public.campaigns(name,start_date,bonus_percentage,is_active) VALUES('TESTE EMAIL - rollback',current_date,0,true) RETURNING id INTO campaign;
  UPDATE public.campaigns SET is_active=false WHERE id=campaign;
  SELECT count(*) INTO n FROM public.email_notifications WHERE entity_id=campaign AND event_type IN ('campaign_created','campaign_status_changed');
  IF n<>2 THEN RAISE EXCEPTION 'Campaign create and change must enqueue'; END IF;
  PERFORM public.enqueue_business_email('test-dedup','test',l,'Teste','{}');
  PERFORM public.enqueue_business_email('test-dedup','test',l,'Teste','{}');
  SELECT count(*) INTO n FROM public.email_notifications WHERE event_key='test-dedup';
  IF n<>1 THEN RAISE EXCEPTION 'Event key must deduplicate'; END IF;
  IF has_table_privilege('authenticated','public.email_notification_runtime','SELECT') THEN RAISE EXCEPTION 'Runtime secrets must not be readable by clients'; END IF;
  IF has_function_privilege('authenticated','public.claim_business_emails(uuid)','EXECUTE') THEN RAISE EXCEPTION 'Clients must not claim queue'; END IF;
  RAISE EXCEPTION USING ERRCODE='Z0001',MESSAGE='Tests passed; rolling fixtures back';
 EXCEPTION WHEN SQLSTATE 'Z0001' THEN
  SELECT count(*) INTO n FROM public.email_notifications;
  IF n<>baseline THEN RAISE EXCEPTION 'Fixture rollback failed'; END IF;
  RAISE NOTICE 'Email event rules passed; no business records or emails persisted';
 END;
END $$;