REVOKE ALL ON public.email_notification_runtime FROM anon, authenticated;
REVOKE ALL ON public.email_notifications FROM anon, authenticated;
GRANT SELECT ON public.email_notifications TO authenticated;
GRANT ALL ON public.email_notification_runtime, public.email_notifications TO service_role;