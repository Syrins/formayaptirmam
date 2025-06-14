
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BlogHeader from "@/components/blog/BlogHeader";
import TableOfContents from "@/components/blog/TableOfContents";
import BlogRelatedPosts from "@/components/blog/BlogRelatedPosts";
import BlogSidebarWidget from "@/components/blog/BlogSidebarWidget";
import BlogCommentSection from "@/components/blog/BlogCommentSection";
import BlogNewsletter from "@/components/blog/BlogNewsletter";
import BlogCategories from "@/components/blog/BlogCategories";

const BlogPostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        if (!slug) return;

        const { data, error } = await supabase
          .from("blogs")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) throw error;

        if (data) {
          setPost(data);
          
          // Fetch related posts (same category)
          if (data.category) {
            const { data: relatedData, error: relatedError } = await supabase
              .from("blogs")
              .select("*")
              .eq("category", data.category)
              .neq("slug", slug)
              .limit(3);

            if (!relatedError && relatedData) {
              setRelatedPosts(relatedData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {t("blog_post_not_found") || "Blog post not found"}
            </h2>
            <Button asChild>
              <Link to="/blog">{t("back_to_blog") || "Back to Blog"}</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const formattedDate = post.created_at
    ? format(new Date(post.created_at), "MMMM dd, yyyy")
    : "";

  const generateTableOfContents = (content: string) => {
    // Simple logic to extract headings
    const headings: { id: string; text: string; level: number }[] = [];
    const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const level = parseInt(match[1], 10);
      const text = match[2].replace(/<[^>]*>/g, ""); // Remove any HTML tags within heading
      const id = text.toLowerCase().replace(/\s+/g, "-");
      headings.push({ id, text, level });
    }
    
    return headings;
  };

  // Generate table of contents from content
  const tableOfContents = post.content ? generateTableOfContents(post.content) : [];

  return (
    <Layout>
      <Helmet>
        <title>{post.title} | FormaYaptırma</title>
        <meta name="description" content={post.excerpt || ""} />
      </Helmet>

      <BlogHeader 
        title={post.title}
        excerpt={post.excerpt}
        coverImage={post.cover_image}
        category={post.category}
        date={post.created_at}
      />

      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {tableOfContents.length > 0 && (
                  <TableOfContents headings={tableOfContents} />
                )}
                
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content || "" }}
                />
              </CardContent>
            </Card>

            <div className="mt-8">
              <BlogCommentSection postId={post.id} />
            </div>
            
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <BlogRelatedPosts relatedPosts={relatedPosts} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <BlogSidebarWidget title={t("about_blog") || "About This Blog"}>
              <p>{t("blog_description") || "Our latest news and updates about custom jerseys."}</p>
            </BlogSidebarWidget>
            <BlogCategories />
            <BlogNewsletter />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPostDetail;
