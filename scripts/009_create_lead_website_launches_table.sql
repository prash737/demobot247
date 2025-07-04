CREATE TABLE IF NOT EXISTS lead_website_launches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES demo_leads(id) ON DELETE CASCADE, -- Updated reference
    website_url TEXT NOT NULL,
    launched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (lead_id, website_url)
);
