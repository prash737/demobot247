CREATE TABLE IF NOT EXISTS public.scraped_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  scraped_at timestamptz DEFAULT now(),
  scraped_data jsonb
);

ALTER TABLE public.scraped_websites ENABLE ROW LEVEL SECURITY;

-- Optional: Create policies if you want to allow client-side access later,
-- but for server-side inserts using service key, RLS can be bypassed.
-- For this demo, we'll assume server-side inserts bypass RLS.
