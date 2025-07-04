ALTER TABLE public.scraped_websites
ADD COLUMN IF NOT EXISTS country_code TEXT;
