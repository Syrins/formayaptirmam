
import React from "react";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HomepageSection } from "@/hooks/use-homepage-content";
import HomeSectionItem from "./HomeSectionItem";

interface HomeSectionManagerProps {
  sections: HomepageSection[];
  setSections: React.Dispatch<React.SetStateAction<HomepageSection[]>>;
  updateSection: (section: HomepageSection) => Promise<void>;
  deleteSection: (sectionId: string, sectionKey: string) => Promise<void>;
  addFeature: (sectionKey: string) => Promise<void>;
  saving: boolean;
}

const HomeSectionManager: React.FC<HomeSectionManagerProps> = ({
  sections,
  setSections,
  updateSection,
  deleteSection,
  addFeature,
  saving,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anasayfa Bölümleri</CardTitle>
        <CardDescription>
          Anasayfadaki her bir bölümü düzenleyin. Başlık, açıklama ve resimlerini güncelleyin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {sections.sort((a, b) => a.display_order - b.display_order).map((section) => (
            <HomeSectionItem
              key={section.id}
              section={section}
              onUpdate={updateSection}
              onDelete={deleteSection}
              onAddFeature={addFeature}
              saving={saving}
              setSections={setSections}
              sections={sections}
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default HomeSectionManager;
