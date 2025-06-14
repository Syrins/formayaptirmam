
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BlogCategory } from "@/types/blog";

const BlogCategories: React.FC = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Update the type parameter to use the correct return type
        const { data, error } = await supabase.rpc("get_blog_categories");
        
        if (error) {
          throw error;
        }
        
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching blog categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("no_categories") || "Henüz kategori bulunmamaktadır."}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Link to={`/blog/category/${cat.category}`} key={cat.category}>
          <Badge variant="outline" className="hover:bg-muted cursor-pointer">
            {cat.category} ({cat.count})
          </Badge>
        </Link>
      ))}
    </div>
  );
};

export default BlogCategories;
