
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { BlogPost, Category } from "@/types/blog";
import PostDialog from "./PostDialog";

const BlogEditor: React.FC = () => {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewPost, setIsNewPost] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts(data as BlogPost[] || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error(t("failed_to_load_posts") || "Blog yazıları yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data as Category[] || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddPost = () => {
    const now = new Date().toISOString();
    setCurrentPost({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featured_image: "",
      author: "Admin",
      category_id: "",
      published: false,
      published_at: now,
      created_at: now,
      updated_at: now,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      featured: false,
      reading_time: 5,
      tags: [],
    });
    setIsNewPost(true);
    setDialogOpen(true);
    setPreview("");
  };

  const handleEditPost = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setIsNewPost(false);
    setDialogOpen(true);
    setPreview(post.content || "");
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm(t("confirm_delete_post") || "Bu yazıyı silmek istediğinize emin misiniz?")) return;
    
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== id));
      toast.success(t("post_deleted") || "Yazı başarıyla silindi");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(t("delete_post_error") || "Yazı silinirken hata oluştu");
    }
  };

  const generateSlug = (title: string) => {
    // Create URL-friendly slug from title
    const turkishCharMap: {[key: string]: string} = {
      'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
      'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c'
    };
    
    return title
      .toLowerCase()
      .replace(/[ıİğĞüÜşŞöÖçÇ]/g, match => turkishCharMap[match] || match)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (title: string) => {
    if (currentPost && (isNewPost || !currentPost.slug)) {
      setCurrentPost({
        ...currentPost,
        title,
        slug: generateSlug(title),
        meta_title: title,
      });
    } else if (currentPost) {
      setCurrentPost({
        ...currentPost,
        title,
      });
    }
  };
  
  const generateExcerpt = (content: string, maxLength = 150) => {
    // Find the first paragraph and use it as excerpt
    const paragraphMatch = content.match(/^(.+?)(?:\n|$)/);
    if (paragraphMatch && paragraphMatch[1]) {
      const text = paragraphMatch[1].replace(/#+\s|[*_`]/g, '').trim(); // Remove markdown formatting
      return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    }
    return '';
  };

  const handleSavePost = async () => {
    if (!currentPost) return;
    
    if (!currentPost.title || !currentPost.slug || !currentPost.content) {
      toast.error(t("required_fields_missing") || "Başlık, URL ve içerik alanları zorunludur");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const now = new Date().toISOString();
      
      if (isNewPost) {
        // Ensure we're only sending valid data with required fields
        const postToInsert = {
          title: currentPost.title,
          slug: currentPost.slug,
          content: currentPost.content,
          excerpt: currentPost.excerpt || null,
          featured_image: currentPost.featured_image || null,
          author: currentPost.author || "Admin",
          category_id: currentPost.category_id || null,
          published: currentPost.published || false,
          published_at: currentPost.published_at || now,
          created_at: now,
          updated_at: now,
          meta_title: currentPost.meta_title || null,
          meta_description: currentPost.meta_description || null,
          meta_keywords: currentPost.meta_keywords || null,
          featured: currentPost.featured || false,
          reading_time: currentPost.reading_time || calculateReadingTime(currentPost.content),
          tags: currentPost.tags || []
        };
        
        const { data, error } = await supabase
          .from("blog_posts")
          .insert([postToInsert])
          .select();
        
        if (error) throw error;
        toast.success(t("post_created") || "Blog yazısı başarıyla oluşturuldu");
      } else if (currentPost.id) {
        // Update with proper fields
        const postToUpdate = {
          title: currentPost.title,
          slug: currentPost.slug,
          content: currentPost.content,
          excerpt: currentPost.excerpt || null,
          featured_image: currentPost.featured_image || null,
          author: currentPost.author || "Admin",
          category_id: currentPost.category_id || null,
          published: currentPost.published || false,
          updated_at: now,
          meta_title: currentPost.meta_title || null,
          meta_description: currentPost.meta_description || null,
          meta_keywords: currentPost.meta_keywords || null,
          featured: currentPost.featured || false,
          reading_time: currentPost.reading_time || calculateReadingTime(currentPost.content),
          tags: currentPost.tags || []
        };
        
        const { error } = await supabase
          .from("blog_posts")
          .update(postToUpdate)
          .eq("id", currentPost.id);
        
        if (error) throw error;
        toast.success(t("post_updated") || "Blog yazısı başarıyla güncellendi");
      }
      
      fetchPosts();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error(t("save_post_error") || "Yazı kaydedilirken hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };
  
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return Math.max(1, minutes);
  };
  
  const handleImageUploaded = (url: string) => {
    if (currentPost) {
      setCurrentPost({
        ...currentPost,
        featured_image: url,
      });
    }
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "d MMM yyyy");
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-100">{t('blog_posts') || 'Blog Yazıları'}</h1>
        <Button onClick={handleAddPost}>
          <Plus className="mr-2 h-4 w-4" />
          {t('add_post') || 'Yazı Ekle'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <Card key={post.id} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
                {post.featured_image ? (
                  <img 
                    src={post.featured_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <ImageIcon size={24} />
                  </div>
                )}
                {post.featured && (
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                    {t('featured') || 'Öne Çıkan'}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium line-clamp-2 dark:text-gray-100">{post.title}</h3>
                    <div className={`w-2 h-2 rounded-full mt-1 ${post.published ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {post.excerpt || post.content?.substring(0, 100)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(post.published_at)}
                    </span>
                    <span className="flex gap-1 items-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditPost(post)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
            {t('no_posts_found') || 'Hiç blog yazısı bulunamadı. İlk yazınızı oluşturun!'}
          </div>
        )}
      </div>
      
      <PostDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        isNewPost={isNewPost}
        currentPost={currentPost}
        setCurrentPost={setCurrentPost}
        categories={categories}
        preview={preview}
        setPreview={setPreview}
        isSaving={isSaving}
        handleSavePost={handleSavePost}
        generateSlug={generateSlug}
        handleTitleChange={handleTitleChange}
        generateExcerpt={generateExcerpt}
        calculateReadingTime={calculateReadingTime}
        handleImageUploaded={handleImageUploaded}
      />
    </div>
  );
};

export default BlogEditor;
