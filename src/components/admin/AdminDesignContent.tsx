
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, Edit2, Trash2, UploadCloud, Check, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DesignOption, DesignTemplate, useDesignTemplates } from '@/hooks/use-design-options';

// Define content schema
const designContentSchema = z.object({
  id: z.string().optional(),
  section: z.string(),
  title_en: z.string().min(1, { message: "Title (EN) is required" }),
  title_tr: z.string().min(1, { message: "Title (TR) is required" }),
  description_en: z.string().min(1, { message: "Description (EN) is required" }),
  description_tr: z.string().min(1, { message: "Description (TR) is required" }),
});

type DesignContentFormValues = z.infer<typeof designContentSchema>;

interface DesignContent {
  id: string;
  section: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
}

// Design template schema for 3D models and templates
const designTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Template name is required" }),
  name_tr: z.string().min(1, { message: "Template name (TR) is required" }),
  type: z.string().min(1, { message: "Template type is required" }),
  model_url: z.string().optional(),
  texture_url: z.string().optional(),
  preview_url: z.string().min(1, { message: "Preview image URL is required" }),
  is_active: z.boolean(),
  display_order: z.number(),
});

type DesignTemplateFormValues = z.infer<typeof designTemplateSchema>;

const AdminDesignContent: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('content');
  
  // Content state
  const [designContent, setDesignContent] = useState<DesignContent | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  
  // Templates state
  const { templates, loading: templateLoading, error: templateError, refreshTemplates } = useDesignTemplates();
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  
  // Color options display
  const [colorOptions, setColorOptions] = useState<DesignOption[]>([]);
  const [fabricOptions, setFabricOptions] = useState<DesignOption[]>([]);
  const [fontOptions, setFontOptions] = useState<DesignOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  
  // Form setup for content
  const contentForm = useForm<DesignContentFormValues>({
    resolver: zodResolver(designContentSchema),
    defaultValues: {
      section: 'design',
      title_en: '',
      title_tr: '',
      description_en: '',
      description_tr: '',
    }
  });
  
  // Form setup for templates
  const templateForm = useForm<DesignTemplateFormValues>({
    resolver: zodResolver(designTemplateSchema),
    defaultValues: {
      name: '',
      name_tr: '',
      type: '2d',
      preview_url: '',
      is_active: true,
      display_order: 0,
    }
  });
  
  // Fetch design page content
  useEffect(() => {
    const fetchDesignContent = async () => {
      setContentLoading(true);
      try {
        const { data, error } = await supabase
          .from('homepage_content')
          .select('*')
          .eq('section', 'design')
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setDesignContent(data);
        }
      } catch (error) {
        console.error('Error fetching design content:', error);
        toast.error(t('error_fetching_content') || "İçerik yüklenirken hata oluştu");
      } finally {
        setContentLoading(false);
      }
    };
    
    fetchDesignContent();
  }, [t]);
  
  // Fetch design options summary
  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        // Fetch colors
        const { data: colorData, error: colorError } = await supabase
          .from('design_options')
          .select('*')
          .eq('type', 'color')
          .order('display_order', { ascending: true });
          
        if (colorError) throw colorError;
        setColorOptions(colorData || []);
        
        // Fetch fabrics
        const { data: fabricData, error: fabricError } = await supabase
          .from('design_options')
          .select('*')
          .eq('type', 'fabric')
          .order('display_order', { ascending: true });
          
        if (fabricError) throw fabricError;
        setFabricOptions(fabricData || []);
        
        // Fetch fonts
        const { data: fontData, error: fontError } = await supabase
          .from('design_options')
          .select('*')
          .eq('type', 'font')
          .order('display_order', { ascending: true });
          
        if (fontError) throw fontError;
        setFontOptions(fontData || []);
      } catch (error) {
        console.error('Error fetching design options:', error);
        toast.error(t('error_fetching_options') || "Seçenekler yüklenirken hata oluştu");
      } finally {
        setOptionsLoading(false);
      }
    };
    
    fetchOptions();
  }, [t]);
  
  // Handle opening content edit dialog
  const handleOpenContentDialog = () => {
    if (designContent) {
      contentForm.reset({
        id: designContent.id,
        section: designContent.section,
        title_en: designContent.title_en,
        title_tr: designContent.title_tr,
        description_en: designContent.description_en,
        description_tr: designContent.description_tr,
      });
    } else {
      contentForm.reset({
        section: 'design',
        title_en: '',
        title_tr: '',
        description_en: '',
        description_tr: '',
      });
    }
    setContentDialogOpen(true);
  };
  
  // Handle opening template add/edit dialog
  const handleOpenTemplateDialog = (templateId?: string) => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        templateForm.reset({
          id: template.id,
          name: template.name,
          name_tr: template.name_tr,
          type: template.type,
          model_url: template.model_url,
          texture_url: template.texture_url,
          preview_url: template.preview_url,
          is_active: template.is_active,
          display_order: template.display_order,
        });
        setEditingTemplate(templateId);
      }
    } else {
      templateForm.reset({
        name: '',
        name_tr: '',
        type: '2d',
        preview_url: '',
        is_active: true,
        display_order: templates.length + 1,
      });
      setEditingTemplate(null);
    }
    setTemplateDialogOpen(true);
  };
  
  // Handle content save
  const handleSaveContent = async (values: DesignContentFormValues) => {
    try {
      if (values.id) {
        // Update existing content
        const { error } = await supabase
          .from('homepage_content')
          .update({
            title_en: values.title_en,
            title_tr: values.title_tr,
            description_en: values.description_en,
            description_tr: values.description_tr,
          })
          .eq('id', values.id);
          
        if (error) throw error;
        toast.success(t('content_updated_successfully') || "İçerik başarıyla güncellendi");
      } else {
        // Insert new content
        const { error } = await supabase
          .from('homepage_content')
          .insert({
            section: 'design',
            title_en: values.title_en,
            title_tr: values.title_tr,
            description_en: values.description_en,
            description_tr: values.description_tr,
          });
          
        if (error) throw error;
        toast.success(t('content_created_successfully') || "İçerik başarıyla oluşturuldu");
      }
      
      // Refresh content data
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('section', 'design')
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setDesignContent(data);
      
      // Close dialog
      setContentDialogOpen(false);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(t('error_saving_content') || "İçerik kaydedilirken hata oluştu");
    }
  };
  
  // Handle template save
  const handleSaveTemplate = async (values: DesignTemplateFormValues) => {
    try {
      if (values.id) {
        // Update existing template
        const { error } = await supabase
          .from('design_templates')
          .update({
            name: values.name,
            name_tr: values.name_tr,
            type: values.type,
            model_url: values.model_url || null,
            texture_url: values.texture_url || null,
            preview_url: values.preview_url,
            is_active: values.is_active,
            display_order: values.display_order,
          })
          .eq('id', values.id);
          
        if (error) throw error;
        toast.success(t('template_updated_successfully') || "Şablon başarıyla güncellendi");
      } else {
        // Insert new template
        const { error } = await supabase
          .from('design_templates')
          .insert({
            name: values.name,
            name_tr: values.name_tr,
            type: values.type,
            model_url: values.model_url || null,
            texture_url: values.texture_url || null,
            preview_url: values.preview_url,
            is_active: values.is_active,
            display_order: values.display_order,
          });
          
        if (error) throw error;
        toast.success(t('template_created_successfully') || "Şablon başarıyla oluşturuldu");
      }
      
      // Refresh template data
      refreshTemplates();
      
      // Close dialog
      setTemplateDialogOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(t('error_saving_template') || "Şablon kaydedilirken hata oluştu");
    }
  };
  
  // Handle template delete
  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm(t('confirm_delete_template') || "Bu şablonu silmek istediğinizden emin misiniz?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('design_templates')
        .delete()
        .eq('id', templateId);
        
      if (error) throw error;
      toast.success(t('template_deleted_successfully') || "Şablon başarıyla silindi");
      
      // Refresh template data
      refreshTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(t('error_deleting_template') || "Şablon silinirken hata oluştu");
    }
  };
  
  // Handle template status change
  const handleTemplateStatusToggle = async (templateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('design_templates')
        .update({ is_active: !currentStatus })
        .eq('id', templateId);
        
      if (error) throw error;
      toast.success(
        !currentStatus 
        ? (t('template_activated_successfully') || "Şablon başarıyla etkinleştirildi") 
        : (t('template_deactivated_successfully') || "Şablon başarıyla devre dışı bırakıldı")
      );
      
      // Refresh template data
      refreshTemplates();
    } catch (error) {
      console.error('Error updating template status:', error);
      toast.error(t('error_updating_template') || "Şablon güncellenirken hata oluştu");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="content">{t('page_content') || "Sayfa İçeriği"}</TabsTrigger>
          <TabsTrigger value="templates">{t('design_templates') || "Tasarım Şablonları"}</TabsTrigger>
          <TabsTrigger value="options">{t('design_options') || "Tasarım Seçenekleri"}</TabsTrigger>
        </TabsList>
      
        {/* Page Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{t('design_page_content') || "Tasarım Sayfası İçeriği"}</CardTitle>
              <Button variant="outline" size="sm" onClick={handleOpenContentDialog}>
                {designContent ? <Edit2 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {designContent ? t('edit_content') || "Düzenle" : t('create_content') || "Oluştur"}
              </Button>
            </CardHeader>
            <CardContent>
              {contentLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : designContent ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{language === 'en' ? designContent.title_en : designContent.title_tr}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'en' ? designContent.description_en : designContent.description_tr}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {t('no_content_yet') || "Henüz içerik bulunmuyor"}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={handleOpenContentDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('create_content') || "İçerik Oluştur"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      
        {/* Design Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{t('design_templates') || "Tasarım Şablonları"}</CardTitle>
                <CardDescription>{t('design_templates_description') || "2D ve 3D tasarımlar için şablonları yönetin"}</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleOpenTemplateDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                {t('add_template') || "Şablon Ekle"}
              </Button>
            </CardHeader>
            <CardContent>
              {templateLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className={`overflow-hidden ${!template.is_active ? 'opacity-70' : ''}`}>
                      <div className="relative h-32 overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {template.preview_url && (
                          <img 
                            src={template.preview_url} 
                            alt={template.name}
                            className="w-full h-full object-cover" 
                          />
                        )}
                        <div className="absolute top-2 right-2 space-x-1">
                          <Button size="icon" variant="secondary" onClick={() => handleOpenTemplateDialog(template.id)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-background/90 rounded-full px-2 py-1 text-xs">
                          {template.type.toUpperCase()}
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium truncate">
                            {language === 'en' ? template.name : template.name_tr}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {t('display_order')}: {template.display_order}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Switch 
                            checked={template.is_active}
                            onCheckedChange={() => handleTemplateStatusToggle(template.id, template.is_active)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {t('no_templates_yet') || "Henüz şablon bulunmuyor"}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => handleOpenTemplateDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('add_template') || "Şablon Ekle"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      
        {/* Design Options Tab */}
        <TabsContent value="options">
          <Card>
            <CardHeader>
              <CardTitle>{t('design_options_summary') || "Tasarım Seçenekleri Özeti"}</CardTitle>
              <CardDescription>
                {t('options_managed_separately') || "Bu seçenekler 'Tasarım' bölümünde yönetilir"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optionsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Color Options */}
                  <div>
                    <h3 className="font-medium mb-2">{t('color_options') || "Renk Seçenekleri"}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      {colorOptions.length > 0 ? (
                        colorOptions.filter(option => option.is_active).slice(0, 6).map((option) => (
                          <div key={option.id} className="flex flex-col items-center">
                            <div 
                              className="w-8 h-8 rounded-full border"
                              style={{ backgroundColor: option.value }}
                            ></div>
                            <span className="text-xs mt-1">
                              {language === 'tr' ? option.name_tr : option.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground col-span-full">
                          {t('no_color_options') || "Renk seçeneği bulunmuyor"}
                        </p>
                      )}
                      {colorOptions.length > 6 && (
                        <p className="text-sm text-muted-foreground col-span-full mt-2">
                          {/* Fix: Using the updated t function with params object */}
                          {t('and_more_options', { count: colorOptions.length - 6 }) || `Ve ${colorOptions.length - 6} adet daha...`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Fabric Options */}
                  <div>
                    <h3 className="font-medium mb-2">{t('fabric_options') || "Kumaş Seçenekleri"}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {fabricOptions.length > 0 ? (
                        fabricOptions.filter(option => option.is_active).slice(0, 6).map((option) => (
                          <div key={option.id} className="bg-secondary/30 rounded-md px-3 py-1">
                            <span className="text-sm">
                              {language === 'tr' ? option.name_tr : option.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground col-span-full">
                          {t('no_fabric_options') || "Kumaş seçeneği bulunmuyor"}
                        </p>
                      )}
                      {fabricOptions.length > 6 && (
                        <p className="text-sm text-muted-foreground col-span-full mt-2">
                          {/* Fix: Using the updated t function with params object */}
                          {t('and_more_options', { count: fabricOptions.length - 6 }) || `Ve ${fabricOptions.length - 6} adet daha...`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Font Options */}
                  <div>
                    <h3 className="font-medium mb-2">{t('font_options') || "Font Seçenekleri"}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {fontOptions.length > 0 ? (
                        fontOptions.filter(option => option.is_active).slice(0, 6).map((option) => (
                          <div key={option.id} className="bg-secondary/30 rounded-md px-3 py-1">
                            <span className="text-sm" style={{ fontFamily: option.value }}>
                              {language === 'tr' ? option.name_tr : option.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground col-span-full">
                          {t('no_font_options') || "Font seçeneği bulunmuyor"}
                        </p>
                      )}
                      {fontOptions.length > 6 && (
                        <p className="text-sm text-muted-foreground col-span-full mt-2">
                          {/* Fix: Using the updated t function with params object */}
                          {t('and_more_options', { count: fontOptions.length - 6 }) || `Ve ${fontOptions.length - 6} adet daha...`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Content Edit Dialog */}
      <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {designContent ? t('edit_design_content') || "Tasarım İçeriğini Düzenle" : t('create_design_content') || "Tasarım İçeriği Oluştur"}
            </DialogTitle>
            <DialogDescription>
              {t('design_content_instructions') || "Tasarım sayfasının içeriğini düzenleyin"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...contentForm}>
            <form onSubmit={contentForm.handleSubmit(handleSaveContent)} className="space-y-4">
              <FormField
                control={contentForm.control}
                name="title_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (EN)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={contentForm.control}
                name="title_tr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (TR)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={contentForm.control}
                name="description_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (EN)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={contentForm.control}
                name="description_tr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (TR)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setContentDialogOpen(false)}>
                  {t('cancel') || "İptal"}
                </Button>
                <Button type="submit">
                  {t('save') || "Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Template Edit Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? t('edit_design_template') || "Tasarım Şablonunu Düzenle" : t('create_design_template') || "Tasarım Şablonu Oluştur"}
            </DialogTitle>
            <DialogDescription>
              {t('design_template_instructions') || "Tasarım şablonu detaylarını girin"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit(handleSaveTemplate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={templateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (EN)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={templateForm.control}
                  name="name_tr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (TR)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={templateForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('template_type') || "Şablon Tipi"}</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                          {...field}
                        >
                          <option value="2d">2D</option>
                          <option value="3d">3D</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={templateForm.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('display_order') || "Görüntüleme Sırası"}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={templateForm.control}
                name="preview_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('preview_image_url') || "Önizleme Görsel URL"}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={templateForm.control}
                name="model_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('model_url') || "3D Model URL"} (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={templateForm.control}
                name="texture_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('texture_url') || "Doku URL"} (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={templateForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('active_status') || "Aktif Durum"}
                      </FormLabel>
                      <FormDescription>
                        {t('active_status_description') || "Şablon kullanıcılara gösterilecek"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                  {t('cancel') || "İptal"}
                </Button>
                <Button type="submit">
                  {t('save') || "Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDesignContent;
