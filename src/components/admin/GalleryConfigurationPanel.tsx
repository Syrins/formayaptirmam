
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GallerySettings {
  id: string;
  title_en: string;
  title_tr: string;
  description_en: string;
  description_tr: string;
  items_per_page: number;
  show_search: boolean;
  show_filters: boolean;
  default_filter_view: string;
  show_price: boolean;
  show_min_order: boolean;
  show_stock_status: boolean;
  show_delivery_time: boolean;
  delivery_time_text_en: string;
  delivery_time_text_tr: string;
  layout_type: string;
  sort_order: string;
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: Partial<GallerySettings> = {
  title_en: 'Jersey Gallery',
  title_tr: 'Forma Galerisi',
  description_en: 'Browse our collection of high-quality custom jerseys for your team.',
  description_tr: 'Takımınız için yüksek kaliteli özel formaları keşfedin.',
  items_per_page: 12,
  show_search: true,
  show_filters: true,
  default_filter_view: 'expanded',
  show_price: true,
  show_min_order: true,
  show_stock_status: true,
  show_delivery_time: true,
  delivery_time_text_en: '2-3 business days delivery',
  delivery_time_text_tr: '2-3 iş gününde teslim',
  layout_type: 'grid',
  sort_order: 'newest'
};

const GalleryConfigurationPanel: React.FC = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<GallerySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const form = useForm<GallerySettings>({
    defaultValues: defaultSettings as GallerySettings
  });
  
  // Fetch gallery settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // Use 'as any' to bypass TypeScript constraints since we can't modify types.ts
        const { data, error } = await (supabase as any)
          .from('gallery_settings')
          .select('*')
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching gallery settings:', error);
          toast.error(t('error_fetching_settings') || 'Error fetching gallery settings');
          return;
        }
        
        if (data) {
          // Cast the data to GallerySettings to ensure type safety
          setSettings(data as GallerySettings);
          form.reset(data as GallerySettings);
        } else {
          // If no settings exist, use defaults
          setSettings(defaultSettings as GallerySettings);
        }
      } catch (error) {
        console.error('Error in gallery settings fetch:', error);
        toast.error(t('error_fetching_settings') || 'Error fetching gallery settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [t, form]);
  
  const onSubmit = async (data: GallerySettings) => {
    try {
      setSaving(true);
      
      // Check if we're updating or inserting
      if (settings && settings.id) {
        // Update existing settings
        const { error } = await (supabase as any)
          .from('gallery_settings')
          .update(data)
          .eq('id', settings.id);
          
        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await (supabase as any)
          .from('gallery_settings')
          .insert([data]);
          
        if (error) throw error;
      }
      
      toast.success(t('settings_saved') || 'Gallery settings saved successfully');
      
      // Refresh settings
      const { data: refreshedData, error: refreshError } = await (supabase as any)
        .from('gallery_settings')
        .select('*')
        .single();
        
      if (refreshError) throw refreshError;
      
      if (refreshedData) {
        setSettings(refreshedData as GallerySettings);
        form.reset(refreshedData as GallerySettings);
      }
    } catch (error) {
      console.error('Error saving gallery settings:', error);
      toast.error(t('error_saving_settings') || 'Error saving gallery settings');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('gallery_advanced_configuration') || 'Advanced Gallery Configuration'}</CardTitle>
        <CardDescription>
          {t('gallery_configuration_description') || 'Customize how your gallery page appears and functions'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">{t('general') || 'General'}</TabsTrigger>
                <TabsTrigger value="display">{t('display_options') || 'Display Options'}</TabsTrigger>
                <TabsTrigger value="product_info">{t('product_information') || 'Product Information'}</TabsTrigger>
              </TabsList>
              
              {/* General Settings */}
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('title') || 'Title'} (EN)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title_tr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('title') || 'Title'} (TR)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('description') || 'Description'} (EN)</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description_tr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('description') || 'Description'} (TR)</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="items_per_page"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('items_per_page') || 'Items Per Page'}</FormLabel>
                        <FormControl>
                          <Input type="number" min={4} max={48} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sort_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('default_sort_order') || 'Default Sort Order'}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('select_sort_order') || 'Select sort order'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="newest">{t('newest_first') || 'Newest First'}</SelectItem>
                            <SelectItem value="price_low">{t('price_low_to_high') || 'Price: Low to High'}</SelectItem>
                            <SelectItem value="price_high">{t('price_high_to_low') || 'Price: High to Low'}</SelectItem>
                            <SelectItem value="display_order">{t('display_order') || 'Display Order'}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Display Options */}
              <TabsContent value="display" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="layout_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('layout_type') || 'Layout Type'}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('select_layout') || 'Select layout'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="grid">{t('grid') || 'Grid'}</SelectItem>
                            <SelectItem value="list">{t('list') || 'List'}</SelectItem>
                            <SelectItem value="masonry">{t('masonry') || 'Masonry'}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="default_filter_view"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('default_filter_view') || 'Default Filter View'}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('select_filter_view') || 'Select filter view'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="expanded">{t('expanded') || 'Expanded'}</SelectItem>
                            <SelectItem value="collapsed">{t('collapsed') || 'Collapsed'}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="show_search"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t('show_search') || 'Show Search'}
                          </FormLabel>
                          <FormDescription>
                            {t('show_search_description') || 'Display search bar in gallery'}
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
                  
                  <FormField
                    control={form.control}
                    name="show_filters"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t('show_filters') || 'Show Filters'}
                          </FormLabel>
                          <FormDescription>
                            {t('show_filters_description') || 'Display filter options in gallery'}
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
                </div>
              </TabsContent>
              
              {/* Product Information */}
              <TabsContent value="product_info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="show_price"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t('show_price') || 'Show Price'}
                          </FormLabel>
                          <FormDescription>
                            {t('show_price_description') || 'Display product price in gallery'}
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
                  
                  <FormField
                    control={form.control}
                    name="show_min_order"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t('show_min_order') || 'Show Minimum Order'}
                          </FormLabel>
                          <FormDescription>
                            {t('show_min_order_description') || 'Display minimum order quantity'}
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="show_stock_status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t('show_stock_status') || 'Show Stock Status'}
                          </FormLabel>
                          <FormDescription>
                            {t('show_stock_status_description') || 'Display product stock status'}
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
                  
                  <FormField
                    control={form.control}
                    name="show_delivery_time"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t('show_delivery_time') || 'Show Delivery Time'}
                          </FormLabel>
                          <FormDescription>
                            {t('show_delivery_time_description') || 'Display delivery time information'}
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
                </div>
                
                {form.watch('show_delivery_time') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="delivery_time_text_en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('delivery_time_text') || 'Delivery Time Text'} (EN)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="delivery_time_text_tr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('delivery_time_text') || 'Delivery Time Text'} (TR)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save_settings') || 'Save Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GalleryConfigurationPanel;
