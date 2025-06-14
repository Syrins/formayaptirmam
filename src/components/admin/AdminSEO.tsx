
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { Save, Loader2, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

// Define the schema for SEO settings
const seoSchema = z.object({
  site_title: z.string().optional(),
  site_description: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  keywords: z.string().optional()
});

type SeoFormValues = z.infer<typeof seoSchema>;

interface SeoSetting {
  id: string;
  site_title: string | null;
  site_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
}

const AdminSEO: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [seoSettings, setSeoSettings] = useState<Record<string, SeoSetting>>({});
  
  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      site_title: "",
      site_description: "",
      meta_title: "",
      meta_description: "",
      keywords: ""
    }
  });

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  // Update form values when active tab changes
  useEffect(() => {
    if (seoSettings[activeTab]) {
      const setting = seoSettings[activeTab];
      form.reset({
        site_title: setting.site_title || "",
        site_description: setting.site_description || "",
        meta_title: setting.meta_title || "",
        meta_description: setting.meta_description || "",
        keywords: setting.keywords || ""
      });
    }
  }, [activeTab, seoSettings]);

  const fetchSeoSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*");

      if (error) throw error;
      
      const settingsMap: Record<string, SeoSetting> = {};
      
      // Transform array to map with id as key
      if (data) {
        data.forEach((setting) => {
          settingsMap[setting.id] = setting;
        });
      }
      
      setSeoSettings(settingsMap);
    } catch (error: any) {
      toast.error(error.message || "SEO ayarları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (data: SeoFormValues) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("seo_settings")
        .update({
          site_title: data.site_title,
          site_description: data.site_description,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          keywords: data.keywords
        })
        .eq("id", activeTab);

      if (error) throw error;
      
      // Update local state
      setSeoSettings(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          site_title: data.site_title || null,
          site_description: data.site_description || null,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          keywords: data.keywords || null
        }
      }));
      
      toast.success(t("seo_settings_saved") || "SEO ayarları başarıyla kaydedildi");
    } catch (error: any) {
      toast.error(error.message || "SEO ayarları kaydedilirken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    {
      id: "general",
      name: t("general") || "Genel"
    },
    {
      id: "home",
      name: t("homepage") || "Ana Sayfa"
    },
    {
      id: "products",
      name: t("products") || "Ürünler"
    },
    {
      id: "blog",
      name: t("blog") || "Blog"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("seo_settings_title") || "SEO Ayarları"}</h2>
        <Button 
          variant="outline" 
          onClick={fetchSeoSettings}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("refresh") || "Yenile"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("seo_settings") || "SEO Ayarları"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {activeTab === "general" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="site_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("site_title") || "Site Başlığı"}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              {t("site_title_description") || "Sitenizin genel başlığı."}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="site_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("site_description") || "Site Açıklaması"}</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  {activeTab !== "general" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="meta_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("meta_title") || "Meta Başlık"}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="meta_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("meta_description") || "Meta Açıklama"}</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} />
                            </FormControl>
                            <FormDescription>
                              {t("meta_description_info") || "Google aramalarında görünecek açıklama."}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("keywords") || "Anahtar Kelimeler"}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              {t("keywords_info") || "Virgülle ayrılmış anahtar kelimeler."}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("saving") || "Kaydediliyor..."}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t("save_settings") || "Ayarları Kaydet"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSEO;
