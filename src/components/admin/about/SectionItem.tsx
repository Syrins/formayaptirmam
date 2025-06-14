
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Loader2, Plus, Trash } from "lucide-react";
import { AboutSection } from "@/hooks/use-about-content";
import { useLanguage } from "@/context/LanguageContext";

interface SectionItemProps {
  section: AboutSection;
  onUpdate: (section: AboutSection) => Promise<void>;
  onDelete: (sectionId: string, sectionKey: string) => Promise<void>;
  onAddFeature: (sectionKey: string) => Promise<void>;
  saving: boolean;
  setSections: React.Dispatch<React.SetStateAction<AboutSection[]>>;
  sections: AboutSection[];
}

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  onUpdate,
  onDelete,
  onAddFeature,
  saving,
  setSections,
  sections,
}) => {
  const { language } = useLanguage();

  const updateSectionField = (field: string, value: any) => {
    const updated = { ...section, [field]: value };
    setSections(sections.map(s => s.id === section.id ? updated : s));
  };

  return (
    <AccordionItem key={section.id} value={section.id} className="border rounded-md">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center space-x-2">
          <span>{language === 'tr' ? section.title_tr : section.title_en}</span>
          <Badge variant={section.is_active ? "default" : "secondary"}>
            {section.is_active ? "Aktif" : "Pasif"}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${section.id}-title-tr`}>Başlık (TR)</Label>
              <Input
                id={`${section.id}-title-tr`}
                value={section.title_tr}
                onChange={(e) => updateSectionField("title_tr", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${section.id}-title-en`}>Başlık (EN)</Label>
              <Input
                id={`${section.id}-title-en`}
                value={section.title_en}
                onChange={(e) => updateSectionField("title_en", e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${section.id}-desc-tr`}>Açıklama (TR)</Label>
              <Textarea
                id={`${section.id}-desc-tr`}
                value={section.description_tr}
                rows={3}
                onChange={(e) => updateSectionField("description_tr", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${section.id}-desc-en`}>Açıklama (EN)</Label>
              <Textarea
                id={`${section.id}-desc-en`}
                value={section.description_en}
                rows={3}
                onChange={(e) => updateSectionField("description_en", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-image`}>Bölüm Görseli</Label>
            <ImageUploader
              currentImageUrl={section.image_url}
              onImageUploaded={(url) => updateSectionField("image_url", url)}
              folderPath={`sections/${section.section_key}`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${section.id}-order`}>Sıralama</Label>
              <Input
                id={`${section.id}-order`}
                type="number"
                value={section.display_order}
                onChange={(e) => updateSectionField("display_order", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${section.id}-status`}>Durum</Label>
              <select
                id={`${section.id}-status`}
                className="w-full h-10 px-3 rounded-md border"
                value={section.is_active ? "active" : "inactive"}
                onChange={(e) => updateSectionField("is_active", e.target.value === "active")}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onAddFeature(section.section_key)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Özellik Ekle
              </Button>
              
              {section.section_key.startsWith('custom_section_') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      size="sm"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Bölümü Sil
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bu bölümü silmek istediğinizden emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu işlem geri alınamaz. Bu bölüm ve tüm özellikleri kalıcı olarak silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(section.id, section.section_key)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Evet, Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            <Button 
              onClick={() => onUpdate(section)}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Kaydet
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SectionItem;
