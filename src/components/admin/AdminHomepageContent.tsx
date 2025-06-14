
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useHomepageContent } from "@/hooks/use-homepage-content";
import HomeContentEditor from "./home/HomeContentEditor";
import HomeSectionManager from "./home/HomeSectionManager";
import HomeFeatureManager from "./home/HomeFeatureManager";
import HeroContentEditor from "./home/HeroContentEditor";

const AdminHomepageContent: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("hero");
  
  const { 
    sections, 
    features,
    loading, 
    saving,
    setSections,
    setFeatures,
    fetchHomepageContent,
    addSection,
    updateSection,
    deleteSection,
    addFeature,
    updateFeature,
    deleteFeature
  } = useHomepageContent();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-galaxy-purple">
            {t("homepage_content") || "Anasayfa İçeriği"}
          </h2>
          <p className="text-muted-foreground">
            {t("homepage_content_description") || "Anasayfa içeriğini düzenleyin ve yönetin"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchHomepageContent}
            disabled={loading || saving}
            className="border-primary/20 hover:border-primary/60 transition-all"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("refresh") || "Yenile"}
          </Button>
          <Button 
            onClick={addSection} 
            disabled={loading || saving}
            className="bg-gradient-to-r from-galaxy-blue to-galaxy-purple hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("add_section") || "Bölüm Ekle"}
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 shadow-lg shadow-primary/5">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 p-1 bg-muted/30">
            <TabsTrigger 
              value="hero" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t("hero_section") || "Hero Bölümü"}
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800"
            >
              {t("existing_content") || "Mevcut İçerik"}
            </TabsTrigger>
            <TabsTrigger 
              value="sections" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800"
            >
              {t("sections") || "Bölümler"}
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800"
            >
              {t("features") || "Özellikler"}
            </TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t("loading_content") || "İçerik yükleniyor..."}</p>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="hero">
                <HeroContentEditor />
              </TabsContent>
              
              <TabsContent value="content">
                <HomeContentEditor />
              </TabsContent>
              
              <TabsContent value="sections">
                <HomeSectionManager
                  sections={sections}
                  setSections={setSections}
                  updateSection={updateSection}
                  deleteSection={deleteSection}
                  addFeature={addFeature}
                  saving={saving}
                />
              </TabsContent>
              
              <TabsContent value="features">
                <HomeFeatureManager
                  sections={sections}
                  features={features}
                  setFeatures={setFeatures}
                  updateFeature={updateFeature}
                  deleteFeature={deleteFeature}
                  addFeature={addFeature}
                  saving={saving}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminHomepageContent;
