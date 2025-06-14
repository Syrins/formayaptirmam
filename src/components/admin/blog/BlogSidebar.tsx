
import React from 'react';
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Edit, 
  Image as ImageIcon, 
  Search 
} from "lucide-react";
import { BlogPost } from "@/types/blog";

interface BlogSidebarProps {
  currentPost: Partial<BlogPost> | null;
  setCurrentPost: (post: Partial<BlogPost> | null) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({
  currentPost,
  setCurrentPost,
  selectedTab,
  setSelectedTab
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <Button 
        variant={selectedTab === 'content' ? 'default' : 'ghost'} 
        className="w-full justify-start" 
        onClick={() => setSelectedTab("content")}
      >
        <Edit className="mr-2 h-4 w-4" />
        {t('content') || 'İçerik'}
      </Button>
      
      <Button 
        variant={selectedTab === 'media' ? 'default' : 'ghost'} 
        className="w-full justify-start" 
        onClick={() => setSelectedTab("media")}
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        {t('media') || 'Medya'}
      </Button>
      
      <Button 
        variant={selectedTab === 'seo' ? 'default' : 'ghost'} 
        className="w-full justify-start" 
        onClick={() => setSelectedTab("seo")}
      >
        <Search className="mr-2 h-4 w-4" />
        {t('seo') || 'SEO'}
      </Button>
      
      <div className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={currentPost?.published || false}
              onCheckedChange={(checked) => setCurrentPost({ ...currentPost, published: checked })}
            />
            <Label htmlFor="published" className="dark:text-gray-200">
              {t('published') || 'Yayınlandı'}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={currentPost?.featured || false}
              onCheckedChange={(checked) => setCurrentPost({ ...currentPost, featured: checked })}
            />
            <Label htmlFor="featured" className="dark:text-gray-200">
              {t('featured_post') || 'Öne Çıkarıldı'}
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSidebar;
