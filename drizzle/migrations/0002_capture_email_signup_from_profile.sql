DROP TRIGGER email_affiliate_created ON public.user_roles;
CREATE FUNCTION public.capture_affiliate_signup_email() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 PERFORM public.enqueue_business_email('affiliate-created:'||NEW.id,'affiliate_created',NEW.id,'Novo afiliado',jsonb_build_object('name',NEW.full_name,'affiliate_id',NEW.id,'path','/admin/afiliados'),120);
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.capture_affiliate_signup_email() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER email_affiliate_profile_created AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.capture_affiliate_signup_email();