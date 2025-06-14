
import React, { useState } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowDown, 
  ArrowUp, 
  Trash2, 
  Plus, 
  Save, 
  Loader2 
} from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { HomepageSection } from "@/hooks/use-homepage-content";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface HomeSectionItemProps {
  section: HomepageSection;
  onUpdate: (section: HomepageSection) => Promise<void>;
  onDelete: (sectionId: string, sectionKey: string) => Promise<void>;
  onAddFeature: (sectionKey: string) => Promise<void>;
  saving: boolean;
  sections: HomepageSection[];
  setSections: React.Dispatch<React.SetStateAction<HomepageSection[]>>;
}

const HomeSectionItem: React.FC<HomeSectionItemProps> = ({ 
  section, 
  onUpdate, 
  onDelete, 
  onAddFeature,
  saving,
  sections,
  setSections
}) => {
  const [editedSection, setEditedSection] = useState<HomepageSection>(section);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedSection(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setEditedSection(prev => ({
      ...prev,
      is_active: checked
    }));
  };
  
  const handleMoveUp = () => {
    if (section.display_order <= 0) return;
    
    const updatedSections = [...sections];
    const currentIndex = updatedSections.findIndex(s => s.id === section.id);
    const prevIndex = updatedSections.findIndex(s => s.display_order === section.display_order - 1);
    
    if (prevIndex === -1) return;
    
    // Swap display orders
    const updatedSection = {
      ...editedSection,
      display_order: editedSection.display_order - 1
    };
    
    const prevSection = {
      ...updatedSections[prevIndex],
      display_order: updatedSections[prevIndex].display_order + 1
    };
    
    // Update in UI
    updatedSections[currentIndex] = updatedSection;
    updatedSections[prevIndex] = prevSection;
    
    // Update state
    setEditedSection(updatedSection);
    setSections(updatedSections);
    
    // Send updates to the server
    onUpdate(updatedSection);
    onUpdate(prevSection);
  };
  
  const handleMoveDown = () => {
    if (section.display_order >= sections.length - 1) return;
    
    const updatedSections = [...sections];
    const currentIndex = updatedSections.findIndex(s => s.id === section.id);
    const nextIndex = updatedSections.findIndex(s => s.display_order === section.display_order + 1);
    
    if (nextIndex === -1) return;
    
    // Swap display orders
    const updatedSection = {
      ...editedSection,
      display_order: editedSection.display_order + 1
    };
    
    const nextSection = {
      ...updatedSections[nextIndex],
      display_order: updatedSections[nextIndex].display_order - 1
    };
    
    // Update in UI
    updatedSections[currentIndex] = updatedSection;
    updatedSections[nextIndex] = nextSection;
    
    // Update state
    setEditedSection(updatedSection);
    setSections(updatedSections);
    
    // Send updates to the server
    onUpdate(updatedSection);
    onUpdate(nextSection);
  };

  const handleImageUpload = (url: string) => {
    setEditedSection(prev => ({
      ...prev,
      image_url: url
    }));
  };
  
  const handleSave = () => {
    onUpdate(editedSection);
  };
  
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    
    onDelete(section.id, section.section_key);
    setConfirmDelete(false);
  };

  return (
    <AccordionItem value={section.id} className="border rounded-md">
      <AccordionTrigger className="px-4 hover:no-underline">
        <span className="flex items-center gap-2">
          {editedSection.is_active ? (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          ) : (
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          )}
          <span>
            {language === 'tr' ? editedSection.title_tr : editedSection.title_en}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="p-4 space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMoveUp}
              disabled={section.display_order <= 0}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMoveDown}
              disabled={section.display_order >= sections.length - 1}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`section-active-${section.id}`}>Aktif</Label>
            <Switch 
              id={`section-active-${section.id}`}
              checked={editedSection.is_active} 
              onCheckedChange={handleSwitchChange} 
            />
          </div>
        </div>
        
        <Tabs defaultValue={language} onValueChange={(val) => setLanguage(val as 'tr' | 'en')}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="tr">Türkçe</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tr">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Başlık</Label>
                <Input
                  name="title_tr"
                  value={editedSection.title_tr}
                  onChange={handleInputChange}
                  placeholder="Bölüm başlığı"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Açıklama</Label>
                <Textarea
                  name="description_tr"
                  value={editedSection.description_tr}
                  onChange={handleInputChange}
                  placeholder="Bölüm açıklaması"
                  rows={5}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="en">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  name="title_en"
                  value={editedSection.title_en}
                  onChange={handleInputChange}
                  placeholder="Section title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  name="description_en"
                  value={editedSection.description_en}
                  onChange={handleInputChange}
                  placeholder="Section description"
                  rows={5}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="grid gap-2">
          <Label>Resim</Label>
          <ImageUploader
            currentImageUrl={editedSection.image_url || undefined}
            onImageUploaded={handleImageUpload}
            bucketName="homepage"
            folderPath="sections"
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {confirmDelete ? "Emin misiniz?" : "Sil"}
            </Button>
          </div>
          
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => onAddFeature(section.section_key)}
              disabled={saving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Özellik Ekle
            </Button>
            
            <Button 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default HomeSectionItem;
