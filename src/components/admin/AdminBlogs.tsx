
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogEditor from './blog/BlogEditor';
import BlogCategoryManager from './blog/BlogCategoryManager';

const AdminBlogs: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="posts">{t('posts') || 'Posts'}</TabsTrigger>
          <TabsTrigger value="categories">{t('categories') || 'Categories'}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          <BlogEditor />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <BlogCategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBlogs;
