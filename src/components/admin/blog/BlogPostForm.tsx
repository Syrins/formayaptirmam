
import React from 'react';
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { BlogPost, Category } from "@/types/blog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from 'react-markdown';

interface BlogPostFormProps {
  currentPost: Partial<BlogPost> | null;
  setCurrentPost: (post: Partial<BlogPost> | null) => void;
  categories: Category[];
  selectedTab: string;
  preview: string;
  setPreview: (preview: string) => void;
  generateSlug: (title: string) => string;
  handleTitleChange: (title: string) => void;
  generateExcerpt: (content: string, maxLength?: number) => string;
  calculateReadingTime: (content: string) => number;
  handleImageUploaded: (url: string) => void;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  currentPost,
  setCurrentPost,
  categories,
  selectedTab,
  preview,
  setPreview,
  handleTitleChange,
  handleImageUploaded
}) => {
  const { t } = useLanguage();
  
  const handleContentChange = (content: string) => {
    if (currentPost) {
      setCurrentPost({
        ...currentPost, 
        content
      });
      setPreview(content);
    }
  };
  
  return (
    <div>
      {selectedTab === "content" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="dark:text-gray-200">{t('title') || 'Başlık'}</Label>
            <Input
              id="title"
              value={currentPost?.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t('post_title') || 'Yazı Başlığı'}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slug" className="dark:text-gray-200">{t('slug') || 'URL'}</Label>
              <Input
                id="slug"
                value={currentPost?.slug || ''}
                onChange={(e) => setCurrentPost({...currentPost, slug: e.target.value})}
                placeholder={t('post_slug') || 'yazi-basligi'}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="category" className="dark:text-gray-200">{t('category') || 'Kategori'}</Label>
              <Select 
                value={currentPost?.category_id || ""}
                onValueChange={(value) => setCurrentPost({...currentPost, category_id: value})}
              >
                <SelectTrigger id="category" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                  <SelectValue placeholder={t('select_category') || "Kategori seçin"} />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="content" className="dark:text-gray-200">{t('content') || 'İçerik'}</Label>
            <Textarea
              id="content"
              value={currentPost?.content || ''}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={t('post_content') || 'Yazı içeriği...'}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 font-mono h-48"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('supports_markdown') || 'Markdown formatını destekler'}
            </p>
          </div>
          
          {preview && (
            <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-sm font-medium mb-2 dark:text-gray-200">{t('preview') || 'Önizleme'}</div>
              <div className="prose dark:prose-invert max-w-none prose-sm">
                <ReactMarkdown>{preview}</ReactMarkdown>
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="excerpt" className="dark:text-gray-200">{t('excerpt') || 'Özet'}</Label>
            <Textarea
              id="excerpt"
              value={currentPost?.excerpt || ''}
              onChange={(e) => setCurrentPost({...currentPost, excerpt: e.target.value})}
              placeholder={t('post_excerpt') || 'Yazının kısa özeti'}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 h-20"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author" className="dark:text-gray-200">{t('author') || 'Yazar'}</Label>
              <Input
                id="author"
                value={currentPost?.author || ''}
                onChange={(e) => setCurrentPost({...currentPost, author: e.target.value})}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="reading_time" className="dark:text-gray-200">{t('reading_time') || 'Okuma Süresi (dk)'}</Label>
              <Input
                id="reading_time"
                type="number"
                value={currentPost?.reading_time || 5}
                onChange={(e) => setCurrentPost({...currentPost, reading_time: parseInt(e.target.value)})}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
      )}
      
      {selectedTab === "media" && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block dark:text-gray-200">{t('featured_image') || 'Öne Çıkan Görsel'}</Label>
            <div className="mb-4">
              {currentPost?.featured_image ? (
                <div className="relative w-full h-60 rounded-md overflow-hidden">
                  <img 
                    src={currentPost.featured_image}
                    alt="Featured image"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400">
                  <span className="ml-2">
                    {t('no_image_selected') || 'Görsel seçilmedi'}
                  </span>
                </div>
              )}
            </div>
            <ImageUploader 
              onImageUploaded={handleImageUploaded}
              currentImageUrl={currentPost?.featured_image}
              bucketName="blog"
              folderPath="featured-images"
            />
          </div>
        </div>
      )}
      
      {selectedTab === "seo" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="meta_title" className="dark:text-gray-200">{t('meta_title') || 'Meta Başlık'}</Label>
            <Input
              id="meta_title"
              value={currentPost?.meta_title || ''}
              onChange={(e) => setCurrentPost({...currentPost, meta_title: e.target.value})}
              placeholder={currentPost?.title || ''}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('meta_title_description') || 'Önerilen uzunluk: 50-60 karakter'}
            </p>
          </div>
          
          <div>
            <Label htmlFor="meta_description" className="dark:text-gray-200">{t('meta_description') || 'Meta Açıklama'}</Label>
            <Textarea
              id="meta_description"
              value={currentPost?.meta_description || ''}
              onChange={(e) => setCurrentPost({...currentPost, meta_description: e.target.value})}
              placeholder={currentPost?.excerpt || ''}
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 h-28"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('meta_description_tip') || 'Önerilen uzunluk: 120-160 karakter'}
            </p>
          </div>
          
          <div>
            <Label htmlFor="meta_keywords" className="dark:text-gray-200">{t('meta_keywords') || 'Meta Anahtar Kelimeler'}</Label>
            <Input
              id="meta_keywords"
              value={currentPost?.meta_keywords || ''}
              onChange={(e) => setCurrentPost({...currentPost, meta_keywords: e.target.value})}
              placeholder="anahtar,kelime1,kelime2,kelime3"
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('comma_separated') || 'Virgülle ayrılmış değerler (5-8 anahtar kelime önerilir)'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostForm;
