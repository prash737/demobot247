DO $$
BEGIN
    -- Check if the 'question' column exists in 'faqs_uploaded'
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'faqs_uploaded'
        AND column_name = 'question'
    ) THEN
        ALTER TABLE public.faqs_uploaded
        ADD COLUMN question TEXT;
    END IF;

    -- Check if the 'answer' column exists in 'faqs_uploaded'
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'faqs_uploaded'
        AND column_name = 'answer'
    ) THEN
        ALTER TABLE public.faqs_uploaded
        ADD COLUMN answer TEXT;
    END IF;
END
$$;
