-- Add thumbnail_url to site_assets for video thumbnails
ALTER TABLE public.site_assets 
ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Add video_thumbnail to testimonials for video testimonials
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS video_thumbnail text;