import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  cover_image?: string;
  created_at: string;
}

export interface BlogRelatedPostsProps {
  currentPostId?: string;
  category?: string;
  relatedPosts?: BlogPost[];
}

const BlogRelatedPosts: React.FC<BlogRelatedPostsProps> = ({ 
  currentPostId, 
  category, 
  relatedPosts: initialRelatedPosts 
}) => {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(!initialRelatedPosts);
  const { t } = useLanguage();

  useEffect(() => {
    // If related posts are provided, use them directly
    if (initialRelatedPosts && initialRelatedPosts.length > 0) {
      setRelatedPosts(initialRelatedPosts);
      setLoading(false);
      return;
    }

    // Otherwise fetch related posts from Supabase
    const fetchRelatedPosts = async () => {
      if (!currentPostId && !category) {
        setLoading(false);
        return;
      }
      
      try {
        let query = supabase
          .from("blogs")
          .select("id, title, slug, cover_image, created_at");
          
        if (currentPostId) {
          query = query.neq("id", currentPostId);
        }
        
        if (category) {
          query = query.eq("category", category);
        }

        const { data, error } = await query.order("created_at", { ascending: false }).limit(3);

        if (error) {
          throw error;
        }

        setRelatedPosts(data || []);
      } catch (error) {
        console.error("Error fetching related posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPostId, category, initialRelatedPosts]);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  if (relatedPosts.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("no_related_posts") || "İlgili yazı bulunamadı."}</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg mb-4">{t("related_posts") || "İlgili Yazılar"}</h3>
      {relatedPosts.map((post) => (
        <div key={post.id} className="flex items-start gap-3">
          {post.cover_image && (
            <Link to={`/blog/${post.slug}`} className="flex-shrink-0">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-16 h-16 rounded-md object-cover"
              />
            </Link>
          )}
          <div>
            <Link to={`/blog/${post.slug}`} className="text-sm font-medium hover:text-primary">
              {post.title}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogRelatedPosts;
