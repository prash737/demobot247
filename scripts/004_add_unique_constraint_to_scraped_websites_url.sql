ALTER TABLE public.scraped_websites
ADD CONSTRAINT unique_url UNIQUE (url);
