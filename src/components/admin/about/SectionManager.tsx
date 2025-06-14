
import React from "react";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AboutSection } from "@/hooks/use-about-content";
import SectionItem from "./SectionItem";

interface SectionManagerProps {
  sections: AboutSection[];
  setSections: React.Dispatch<React.SetStateAction<AboutSection[]>>;
  updateSection: (section: AboutSection) => Promise<void>;
  deleteSection: (sectionId: string, sectionKey: string) => Promise<void>;
  addFeature: (sectionKey: string) => Promise<void>;
  saving: boolean;
}

const SectionManager: React.FC<SectionManagerProps> = ({
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
        <CardTitle>Hakkımızda Sayfası Bölümleri</CardTitle>
        <CardDescription>
          Hakkımızda sayfasındaki her bir bölümü düzenleyin. Başlık, açıklama ve resimlerini güncelleyin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {sections.sort((a, b) => a.display_order - b.display_order).map((section) => (
            <SectionItem
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

export default SectionManager;
