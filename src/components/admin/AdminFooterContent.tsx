
import React from "react";
import FooterContentEditor from "./footer/FooterContentEditor";
import FooterLinksManager from "./footer/FooterLinksManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";

const AdminFooterContent: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("footer_settings") || "Footer Ayarları"}</CardTitle>
          <CardDescription>
            {t("footer_settings_description") || "Sitenizin alt bilgisini düzenleyin ve özelleştirin."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sections">{t("footer_sections") || "Alt Bilgi Bölümleri"}</TabsTrigger>
              <TabsTrigger value="links">{t("footer_links") || "Alt Bilgi Linkleri"}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="pt-4">
              <FooterContentEditor />
            </TabsContent>
            
            <TabsContent value="links" className="pt-4">
              <FooterLinksManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFooterContent;
