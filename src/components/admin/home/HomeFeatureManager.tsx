
import React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { HomepageSection, HomepageFeature } from "@/hooks/use-homepage-content";
import { useLanguage } from "@/context/LanguageContext";
import HomeFeatureItem from "./HomeFeatureItem";

interface HomeFeatureManagerProps {
  sections: HomepageSection[];
  features: HomepageFeature[];
  setFeatures: React.Dispatch<React.SetStateAction<HomepageFeature[]>>;
  updateFeature: (feature: HomepageFeature) => Promise<void>;
  deleteFeature: (featureId: string) => Promise<void>;
  addFeature: (sectionKey: string) => Promise<void>;
  saving: boolean;
}

const HomeFeatureManager: React.FC<HomeFeatureManagerProps> = ({
  sections,
  features,
  setFeatures,
  updateFeature,
  deleteFeature,
  addFeature,
  saving,
}) => {
  const { language } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anasayfa Özellikleri</CardTitle>
        <CardDescription>
          Her bölümün özelliklerini yönetin. Özellikler ekleyebilir, düzenleyebilir ve silebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {sections.sort((a, b) => a.display_order - b.display_order).map((section) => {
            const sectionFeatures = features.filter(f => f.section_key === section.section_key);
            
            return (
              <AccordionItem key={`features-${section.id}`} value={`features-${section.id}`} className="border rounded-md">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center">
                    <span>{language === 'tr' ? section.title_tr : section.title_en}</span>
                    <Badge className="ml-2" variant="outline">{sectionFeatures.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-2">
                  {sectionFeatures.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>Bu bölüm için henüz özellik bulunmuyor.</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => addFeature(section.section_key)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Özellik Ekle
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sectionFeatures.sort((a, b) => a.display_order - b.display_order).map((feature) => (
                        <HomeFeatureItem
                          key={feature.id}
                          feature={feature}
                          sectionKey={section.section_key}
                          onUpdate={updateFeature}
                          onDelete={deleteFeature}
                          saving={saving}
                          setFeatures={setFeatures}
                          features={features}
                        />
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => addFeature(section.section_key)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Özellik Ekle
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default HomeFeatureManager;
