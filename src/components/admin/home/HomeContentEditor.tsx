
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

// Define content types for different sections
interface SectionContent {
  id?: string;
  section: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  created_at?: string;
  updated_at?: string;
}

const HomeContentEditor: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Content for different sections
  const [featuredContent, setFeaturedContent] = useState<SectionContent>({
    section: "featured",
    title_tr: "",
    title_en: "",
    description_tr: "",
    description_en: ""
  });
  
  const [popularContent, setPopularContent] = useState<SectionContent>({
    section: "popular",
    title_tr: "",
    title_en: "",
    description_tr: "",
    description_en: ""
  });
  
  const [latestContent, setLatestContent] = useState<SectionContent>({
    section: "latest",
    title_tr: "",
    title_en: "",
    description_tr: "",
    description_en: ""
  });

  const [featuresContent, setFeaturesContent] = useState<SectionContent>({
    section: "features",
    title_tr: "",
    title_en: "",
    description_tr: "",
    description_en: ""
  });
  
  // Load content for all sections
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("homepage_content")
          .select("*");
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Process each content item
          data.forEach(item => {
            switch(item.section) {
              case "featured":
                setFeaturedContent(item);
                break;
              case "popular":
                setPopularContent(item);
                break;
              case "latest":
                setLatestContent(item);
                break;
              case "features":
                setFeaturesContent(item);
                break;
              default:
                break;
            }
          });
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast.error(t("content_load_error") || "İçerik yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [t]);

  // Save content for current section
  const saveContent = async (content: SectionContent) => {
    setSaving(true);
    try {
      // Check if content already exists
      if (content.id) {
        // Update existing content
        const { error } = await supabase
          .from("homepage_content")
          .update({
            title_tr: content.title_tr,
            title_en: content.title_en,
            description_tr: content.description_tr,
            description_en: content.description_en,
            updated_at: new Date().toISOString()
          })
          .eq("id", content.id);
          
        if (error) throw error;
        
        toast.success(t("content_updated") || "İçerik güncellendi");
      } else {
        // Create new content
        const { error } = await supabase
          .from("homepage_content")
          .insert({
            section: content.section,
            title_tr: content.title_tr,
            title_en: content.title_en,
            description_tr: content.description_tr,
            description_en: content.description_en
          });
          
        if (error) throw error;
        
        // Refresh the page to get new content with ID
        window.location.reload();
        
        toast.success(t("content_created") || "İçerik oluşturuldu");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error(t("content_save_error") || "İçerik kaydedilirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Generate the content form for the given section
  const renderContentForm = (content: SectionContent, setContent: React.Dispatch<React.SetStateAction<SectionContent>>) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${content.section}-title-tr`}>{t("title_tr") || "Başlık (TR)"}</Label>
            <Input
              id={`${content.section}-title-tr`}
              value={content.title_tr}
              onChange={(e) => setContent({...content, title_tr: e.target.value})}
              placeholder="Başlık Türkçe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${content.section}-title-en`}>{t("title_en") || "Başlık (EN)"}</Label>
            <Input
              id={`${content.section}-title-en`}
              value={content.title_en}
              onChange={(e) => setContent({...content, title_en: e.target.value})}
              placeholder="Title English"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${content.section}-description-tr`}>{t("description_tr") || "Açıklama (TR)"}</Label>
            <Textarea
              id={`${content.section}-description-tr`}
              value={content.description_tr}
              onChange={(e) => setContent({...content, description_tr: e.target.value})}
              placeholder="Açıklama Türkçe"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${content.section}-description-en`}>{t("description_en") || "Açıklama (EN)"}</Label>
            <Textarea
              id={`${content.section}-description-en`}
              value={content.description_en}
              onChange={(e) => setContent({...content, description_en: e.target.value})}
              placeholder="Description English"
              rows={4}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => saveContent(content)} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("save") || "Kaydet"}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("homepage_section_content") || "Anasayfa Bölüm İçerikleri"}</CardTitle>
        <CardDescription>
          {t("homepage_section_content_description") || "Anasayfadaki bölümlerin başlık ve açıklamalarını düzenleyin."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="featured">{t("featured_section") || "Öne Çıkan"}</TabsTrigger>
            <TabsTrigger value="popular">{t("popular_section") || "Popüler"}</TabsTrigger>
            <TabsTrigger value="latest">{t("latest_section") || "Yeni Eklenenler"}</TabsTrigger>
            <TabsTrigger value="features">{t("features_section") || "Özellikler"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured" className="pt-4">
            {renderContentForm(featuredContent, setFeaturedContent)}
          </TabsContent>
          
          <TabsContent value="popular" className="pt-4">
            {renderContentForm(popularContent, setPopularContent)}
          </TabsContent>
          
          <TabsContent value="latest" className="pt-4">
            {renderContentForm(latestContent, setLatestContent)}
          </TabsContent>
          
          <TabsContent value="features" className="pt-4">
            {renderContentForm(featuresContent, setFeaturesContent)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HomeContentEditor;
