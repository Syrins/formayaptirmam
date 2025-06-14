
import React, { useState } from 'react';
import { useLanguage } from "@/context/LanguageContext";
import { BlogPost, Category } from "@/types/blog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import BlogSidebar from "./BlogSidebar";
import BlogPostForm from "./BlogPostForm";
import TextGenerationPreview from "./TextGenerationPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PostDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isNewPost: boolean;
  currentPost: Partial<BlogPost> | null;
  setCurrentPost: (post: Partial<BlogPost> | null) => void;
  categories: Category[];
  preview: string;
  setPreview: (preview: string) => void;
  isSaving: boolean;
  handleSavePost: () => Promise<void>;
  generateSlug: (title: string) => string;
  handleTitleChange: (title: string) => void;
  generateExcerpt: (content: string, maxLength?: number) => string;
  calculateReadingTime: (content: string) => number;
  handleImageUploaded: (url: string) => void;
}

const PostDialog: React.FC<PostDialogProps> = ({
  open,
  setOpen,
  isNewPost,
  currentPost,
  setCurrentPost,
  categories,
  preview,
  setPreview,
  isSaving,
  handleSavePost,
  generateSlug,
  handleTitleChange,
  generateExcerpt,
  calculateReadingTime,
  handleImageUploaded
}) => {
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState("content");
  const [dialogTab, setDialogTab] = useState<"edit" | "generate">("edit");
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isNewPost ? t('add_post') || 'Yazı Ekle' : t('edit_post') || 'Yazı Düzenle'}
          </DialogTitle>
          <DialogDescription>
            {t('manage_blog_post') || 'Blog yazı içeriğini ve ayarlarını yönetin'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={dialogTab} onValueChange={(value) => setDialogTab(value as "edit" | "generate")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit">İçerik Düzenle</TabsTrigger>
            <TabsTrigger value="generate">AI İçerik (Devre Dışı)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit">
            <div className="grid grid-cols-4 gap-6 py-4">
              {/* Left sidebar */}
              <div className="col-span-1">
                <BlogSidebar 
                  currentPost={currentPost}
                  setCurrentPost={setCurrentPost}
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                />
              </div>
              
              {/* Main content */}
              <div className="col-span-3">
                <BlogPostForm 
                  currentPost={currentPost}
                  setCurrentPost={setCurrentPost}
                  categories={categories}
                  selectedTab={selectedTab}
                  preview={preview}
                  setPreview={setPreview}
                  generateSlug={generateSlug}
                  handleTitleChange={handleTitleChange}
                  generateExcerpt={generateExcerpt}
                  calculateReadingTime={calculateReadingTime}
                  handleImageUploaded={handleImageUploaded}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="generate">
            <TextGenerationPreview />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            {t('cancel') || 'İptal'}
          </Button>
          <Button onClick={handleSavePost} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNewPost ? (
              t('add_post') || 'Yazı Ekle'
            ) : (
              t('save_post') || 'Yazı Kaydet'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostDialog;
