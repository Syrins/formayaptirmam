
import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import BlogHeader from "../components/blog/BlogHeader";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

// Lazy load non-critical components
const BlogPostList = lazy(() => import(/* webpackChunkName: "blog-post-list" */ "../components/blog/BlogPostList"));
const BlogSidebarWidget = lazy(() => import(/* webpackChunkName: "blog-sidebar" */ "../components/blog/BlogSidebarWidget"));

interface BlogCategory {
  category: string;
  count: number;
}

const Blog: React.FC = () => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [seoSettings, setSeoSettings] = useState<any>({});
  
  // Optimized SEO settings fetch
  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("seo_settings")
          .select("*")
          .eq("id", "blog")
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching SEO settings:", error);
          return;
        }
        
        if (data) {
          setSeoSettings(data);
        }
      } catch (error) {
        console.error("Error in SEO settings fetch:", error);
      }
    };
    
    fetchSeoSettings();
  }, []);
  
  // Memoized categories fetch
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_blog_categories');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      toast.error(t("error_fetching_categories") || "Error fetching categories");
    } finally {
      setLoading(false);
    }
  }, [t]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Memoized title and description based on language
  const { pageTitle, pageDescription } = useMemo(() => {
    return {
      pageTitle: language === 'tr' ? 'Blog' : 'Our Blog',
      pageDescription: language === 'tr' 
        ? 'En son haberler, güncellemeler ve spor formaları hakkında makaleler'
        : 'Latest news, updates and articles about sports jerseys'
    };
  }, [language]);
  
  // Memoized SEO tags
  const seoTags = useMemo(() => {
    return {
      title: seoSettings.meta_title || pageTitle + ' | Athletic Galaxy',
      description: seoSettings.meta_description || pageDescription
    };
  }, [seoSettings, pageTitle, pageDescription]);
  
  return (
    <Layout>
      <Helmet>
        <title>{seoTags.title}</title>
        <meta name="description" content={seoTags.description} />
        {seoSettings.keywords && <meta name="keywords" content={seoSettings.keywords} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={window.location.href} />
        
        {/* Preload critical images */}
        <link rel="preload" href="/logo.png" as="image" />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTags.title} />
        <meta property="og:description" content={seoTags.description} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTags.title} />
        <meta name="twitter:description" content={seoTags.description} />
      </Helmet>
      
      <BlogHeader 
        title={t("blog_title") || "Blog"}
        excerpt={t("blog_description") || "Discover our latest articles, news, and updates"}
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <Suspense fallback={
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <BlogPostList />
            </Suspense>
          </div>
          <div className="w-full lg:w-1/3">
            <Suspense fallback={
              <div className="rounded-lg border p-4 shadow-sm animate-pulse bg-gray-50 dark:bg-gray-900 h-60"></div>
            }>
              <BlogSidebarWidget title={t("categories") || "Categories"}>
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                ) : categories.length > 0 ? (
                  <ul className="space-y-2">
                    {categories.map((category) => (
                      <li key={category.category} className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">
                          {category.category}
                        </span>
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t("no_categories_found") || "No categories found"}
                  </p>
                )}
              </BlogSidebarWidget>
            </Suspense>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
