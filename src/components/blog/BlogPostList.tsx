
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image?: string;
  created_at: string;
  category?: string;
}

const BlogPostList: React.FC = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("id, title, slug, excerpt, cover_image, created_at, category")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-semibold mb-4">{t("no_blog_posts") || "Henüz blog yazısı bulunmuyor"}</h3>
        <p className="text-muted-foreground">
          {t("check_back_later") || "Daha sonra tekrar kontrol edin"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden transition-all hover:shadow-lg">
          <Link to={`/blog/${post.slug}`}>
            <div className="aspect-video overflow-hidden">
              <img
                src={post.cover_image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          </Link>
          <CardContent className="p-6">
            {post.category && (
              <div className="mb-2">
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
            )}
            <Link to={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-bold mb-2 hover:text-primary transition-colors">
                {post.title}
              </h2>
            </Link>
            <p className="text-muted-foreground mb-4">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
            {post.excerpt && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
            )}
            <Link
              to={`/blog/${post.slug}`}
              className="text-primary font-medium hover:underline"
            >
              {t("read_more") || "Devamını oku"} →
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlogPostList;
