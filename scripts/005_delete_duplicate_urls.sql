DELETE FROM public.scraped_websites
WHERE id IN (
    SELECT id
    FROM (
        SELECT
            id,
            ROW_NUMBER() OVER (PARTITION BY url ORDER BY id) as rn
        FROM public.scraped_websites
    ) t
    WHERE t.rn > 1
);
