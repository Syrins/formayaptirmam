import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Category } from "@/types/blog";

const BlogCategoryManager: React.FC = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data as Category[] || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(t("failed_to_load_categories") || "Failed to load blog categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setCurrentCategory({
      name: "",
      slug: "",
      description: "",
    });
    setIsNewCategory(true);
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory({ ...category });
    setIsNewCategory(false);
    setDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t("confirm_delete_category") || "Are you sure you want to delete this category?")) return;
    
    try {
      const { error } = await supabase.from("blog_categories").delete().eq("id", id);
      if (error) throw error;
      
      setCategories(categories.filter(category => category.id !== id));
      toast.success(t("category_deleted") || "Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(t("delete_category_error") || "Failed to delete category");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (name: string) => {
    if (currentCategory && (isNewCategory || !currentCategory.slug)) {
      setCurrentCategory({
        ...currentCategory,
        name,
        slug: generateSlug(name),
      });
    } else if (currentCategory) {
      setCurrentCategory({
        ...currentCategory,
        name,
      });
    }
  };

  const handleSaveCategory = async () => {
    if (!currentCategory || !currentCategory.name || !currentCategory.slug) {
      toast.error(t("name_slug_required") || "Name and slug are required");
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (isNewCategory) {
        // Make sure we're sending a proper object with required fields
        const categoryToInsert = {
          name: currentCategory.name,
          slug: currentCategory.slug,
          description: currentCategory.description || null
        };
        
        const { data, error } = await supabase
          .from("blog_categories")
          .insert([categoryToInsert])
          .select();
        
        if (error) throw error;
        toast.success(t("category_created") || "Category created successfully");
      } else if (currentCategory.id) {
        // Make sure we're updating with proper fields
        const categoryToUpdate = {
          name: currentCategory.name,
          slug: currentCategory.slug,
          description: currentCategory.description || null
        };
        
        const { error } = await supabase
          .from("blog_categories")
          .update(categoryToUpdate)
          .eq("id", currentCategory.id);
        
        if (error) throw error;
        toast.success(t("category_updated") || "Category updated successfully");
      }
      
      fetchCategories();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(t("save_category_error") || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-gray-100">{t('blog_categories') || 'Blog Categories'}</h1>
        <Button onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" />
          {t('add_category') || 'Add Category'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : categories.length > 0 ? (
          categories.map(category => (
            <Card key={category.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl dark:text-gray-100">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.description || t('no_description') || 'No description'}
                </p>
                <p className="text-xs text-primary mt-2">
                  /{category.slug}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
            {t('no_categories_found') || 'No categories found. Create your first category!'}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isNewCategory ? t('add_category') || 'Add Category' : t('edit_category') || 'Edit Category'}
            </DialogTitle>
            <DialogDescription>
              {t('manage_blog_category') || 'Create and manage blog categories'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="dark:text-gray-200">{t('name') || 'Name'}</Label>
              <Input
                id="name"
                value={currentCategory?.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t('category_name') || 'Category Name'}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="slug" className="dark:text-gray-200">{t('slug') || 'Slug'}</Label>
              <Input
                id="slug"
                value={currentCategory?.slug || ''}
                onChange={(e) => setCurrentCategory({...currentCategory, slug: e.target.value})}
                placeholder={t('category_slug') || 'category-slug'}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="dark:text-gray-200">{t('description') || 'Description'}</Label>
              <Textarea
                id="description"
                value={currentCategory?.description || ''}
                onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                placeholder={t('category_description') || 'Category Description'}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              {t('cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleSaveCategory} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save_category') || 'Save Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogCategoryManager;
