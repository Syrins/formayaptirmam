
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface HeroSettings {
  id?: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  image_url?: string | null;
  customer_count?: number;
  rating_value?: number;
  rating_count?: number;
  show_ratings?: boolean;
  created_at?: string;
  updated_at?: string;
  section: string;
}

const HeroContentEditor: React.FC = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title_tr: "",
    title_en: "",
    description_tr: "",
    description_en: "",
    image_url: null,
    customer_count: 2000,
    rating_value: 4.9,
    rating_count: 5,
    show_ratings: true,
    section: "hero"
  });
  
  const form = useForm<HeroSettings>({
    defaultValues: heroSettings
  });
  
  useEffect(() => {
    const fetchHeroContent = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("homepage_content")
          .select("*")
          .eq("section", "hero")
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            throw error;
          }
        } else if (data) {
          // Use type assertion to tell TypeScript about additional properties
          const fullData = data as any;
          
          // Get customer count, rating value, and other settings from the content object
          const settings: HeroSettings = {
            id: fullData.id,
            title_tr: fullData.title_tr || "",
            title_en: fullData.title_en || "",
            description_tr: fullData.description_tr || "",
            description_en: fullData.description_en || "",
            image_url: fullData.image_url,
            customer_count: fullData.customer_count || 2000,
            rating_value: fullData.rating_value || 4.9,
            rating_count: fullData.rating_count || 5,
            show_ratings: fullData.show_ratings !== undefined ? fullData.show_ratings : true,
            section: "hero"
          };
          
          setHeroSettings(settings);
          form.reset(settings);
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
        toast.error(t("content_load_error") || "İçerik yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchHeroContent();
  }, [t, form]);

  const handleSubmit = async (values: HeroSettings) => {
    setSaving(true);
    try {
      if (heroSettings.id) {
        // Update existing hero content
        const { error } = await supabase
          .from("homepage_content")
          .update({
            title_tr: values.title_tr,
            title_en: values.title_en,
            description_tr: values.description_tr,
            description_en: values.description_en,
            image_url: values.image_url,
            customer_count: values.customer_count,
            rating_value: values.rating_value,
            rating_count: values.rating_count,
            show_ratings: values.show_ratings,
            updated_at: new Date().toISOString()
          })
          .eq("id", heroSettings.id);
          
        if (error) throw error;
        
        toast.success(t("hero_content_updated") || "Anasayfa hero içeriği güncellendi");
      } else {
        // Create new hero content
        const { data, error } = await supabase
          .from("homepage_content")
          .insert({
            section: "hero",
            title_tr: values.title_tr,
            title_en: values.title_en,
            description_tr: values.description_tr,
            description_en: values.description_en,
            image_url: values.image_url,
            customer_count: values.customer_count,
            rating_value: values.rating_value,
            rating_count: values.rating_count,
            show_ratings: values.show_ratings
          })
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          setHeroSettings({
            ...values,
            id: data.id
          });
        }
        
        toast.success(t("hero_content_created") || "Anasayfa hero içeriği oluşturuldu");
      }
    } catch (error) {
      console.error("Error saving hero content:", error);
      toast.error(t("content_save_error") || "İçerik kaydedilirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };
  
  const handleImageUpload = async (url: string) => {
    setHeroSettings({
      ...heroSettings,
      image_url: url
    });
    form.setValue("image_url", url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("hero_section_settings") || "Anasayfa Hero Bölümü Ayarları"}</CardTitle>
        <CardDescription>
          {t("hero_section_description") || "Anasayfadaki hero bölümünün başlığını, açıklamasını ve görseli düzenleyin."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title_tr"
                  defaultValue={heroSettings.title_tr}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("title_tr") || "Başlık (TR)"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Premium Toptancılar İçin Formalar" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description_tr"
                  defaultValue={heroSettings.description_tr}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description_tr") || "Açıklama (TR)"}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Toptan dağıtım için tasarlanmış özel forma koleksiyonumuzu keşfedin." 
                          rows={4}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title_en"
                  defaultValue={heroSettings.title_en}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("title_en") || "Başlık (EN)"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Premium Jerseys for Wholesalers" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description_en"
                  defaultValue={heroSettings.description_en}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description_en") || "Açıklama (EN)"}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Explore our collection of custom jerseys designed for wholesale distribution." 
                          rows={4}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>{t("hero_image") || "Hero Görseli"}</Label>
                <ImageUploader
                  currentImageUrl={heroSettings.image_url || ""}
                  onImageUploaded={handleImageUpload}
                  bucketName="homepage_images"
                  folderPath="hero"
                />
              </div>

              <div className="border p-4 rounded-md space-y-4">
                <h3 className="font-medium text-lg">{t("customer_testimonial_settings") || "Müşteri Değerlendirme Ayarları"}</h3>
                
                <FormField
                  control={form.control}
                  name="show_ratings"
                  defaultValue={heroSettings.show_ratings}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t("show_ratings") || "Değerlendirmeleri Göster"}</FormLabel>
                        <FormDescription>
                          {t("show_ratings_description") || "Anasayfada yıldız değerlendirmelerini ve müşteri sayısını göster."}
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="customer_count"
                    defaultValue={heroSettings.customer_count}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("customer_count") || "Müşteri Sayısı"}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rating_value"
                    defaultValue={heroSettings.rating_value}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("rating_value") || "Değerlendirme Puanı"}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rating_count"
                    defaultValue={heroSettings.rating_count}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("star_count") || "Yıldız Sayısı"}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={saving || uploadingImage}
              className="w-full md:w-auto"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save_settings") || "Ayarları Kaydet"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HeroContentEditor;
