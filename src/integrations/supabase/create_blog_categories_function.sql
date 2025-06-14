
-- This function counts the number of blog posts per category
CREATE OR REPLACE FUNCTION public.get_blog_categories()
RETURNS TABLE(category text, count bigint) 
LANGUAGE sql
AS $$
  SELECT 
    category,
    COUNT(*) as count
  FROM 
    blogs
  WHERE 
    category IS NOT NULL AND category != ''
  GROUP BY 
    category
  ORDER BY 
    count DESC;
$$;
