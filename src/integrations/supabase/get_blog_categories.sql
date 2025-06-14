
-- Function to efficiently get blog categories with their post counts
CREATE OR REPLACE FUNCTION get_blog_categories()
RETURNS TABLE(category text, count bigint) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    category, 
    COUNT(*) as count
  FROM 
    blogs
  WHERE 
    category IS NOT NULL 
    AND published = true
  GROUP BY 
    category
  ORDER BY 
    count DESC;
$$;
