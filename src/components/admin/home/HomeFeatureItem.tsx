import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/image-uploader";
import { ArrowDown, ArrowUp, Trash2, Save, Loader2 } from "lucide-react";
import { HomepageFeature } from "@/hooks/use-homepage-content";

interface HomeFeatureItemProps {
  feature: HomepageFeature;
  sectionKey: string;
  onUpdate: (feature: HomepageFeature) => Promise<void>;
  onDelete: (featureId: string) => Promise<void>;
  saving: boolean;
  features: HomepageFeature[];
  setFeatures: React.Dispatch<React.SetStateAction<HomepageFeature[]>>;
}

const HomeFeatureItem: React.FC<HomeFeatureItemProps> = ({
  feature,
  sectionKey,
  onUpdate,
  onDelete,
  saving,
  features,
  setFeatures,
}) => {
  const [editedFeature, setEditedFeature] = useState<HomepageFeature>(feature);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  
  const sectionFeatures = features.filter(f => f.section_key === sectionKey);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedFeature(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setEditedFeature(prev => ({
      ...prev,
      is_active: checked
    }));
  };
  
  const handleImageUpload = (url: string) => {
    setEditedFeature(prev => ({
      ...prev,
      image_url: url
    }));
  };
  
  const handleMoveUp = () => {
    if (feature.display_order <= 0) return;
    
    const updatedFeatures = [...features];
    const currentIndex = updatedFeatures.findIndex(f => f.id === feature.id);
    const prevIndex = updatedFeatures.findIndex(f => 
      f.section_key === sectionKey && f.display_order === feature.display_order - 1
    );
    
    if (prevIndex === -1) return;
    
    // Swap display orders
    const updatedFeature = {
      ...editedFeature,
      display_order: editedFeature.display_order - 1
    };
    
    const prevFeature = {
      ...updatedFeatures[prevIndex],
      display_order: updatedFeatures[prevIndex].display_order + 1
    };
    
    // Update in UI
    updatedFeatures[currentIndex] = updatedFeature;
    updatedFeatures[prevIndex] = prevFeature;
    
    // Update state
    setEditedFeature(updatedFeature);
    setFeatures(updatedFeatures);
    
    // Send updates to the server
    onUpdate(updatedFeature);
    onUpdate(prevFeature);
  };
  
  const handleMoveDown = () => {
    if (feature.display_order >= sectionFeatures.length - 1) return;
    
    const updatedFeatures = [...features];
    const currentIndex = updatedFeatures.findIndex(f => f.id === feature.id);
    const nextIndex = updatedFeatures.findIndex(f => 
      f.section_key === sectionKey && f.display_order === feature.display_order + 1
    );
    
    if (nextIndex === -1) return;
    
    // Swap display orders
    const updatedFeature = {
      ...editedFeature,
      display_order: editedFeature.display_order + 1
    };
    
    const nextFeature = {
      ...updatedFeatures[nextIndex],
      display_order: updatedFeatures[nextIndex].display_order - 1
    };
    
    // Update in UI
    updatedFeatures[currentIndex] = updatedFeature;
    updatedFeatures[nextIndex] = nextFeature;
    
    // Update state
    setEditedFeature(updatedFeature);
    setFeatures(updatedFeatures);
    
    // Send updates to the server
    onUpdate(updatedFeature);
    onUpdate(nextFeature);
  };
  
  const handleSave = () => {
    onUpdate(editedFeature);
  };
  
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    
    onDelete(feature.id);
    setConfirmDelete(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (feature.display_order <= 0) return;
                
                const updatedFeatures = [...features];
                const currentIndex = updatedFeatures.findIndex(f => f.id === feature.id);
                const prevIndex = updatedFeatures.findIndex(f => 
                  f.section_key === sectionKey && f.display_order === feature.display_order - 1
                );
                
                if (prevIndex === -1) return;
                
                // Swap display orders
                const updatedFeature = {
                  ...editedFeature,
                  display_order: editedFeature.display_order - 1
                };
                
                const prevFeature = {
                  ...updatedFeatures[prevIndex],
                  display_order: updatedFeatures[prevIndex].display_order + 1
                };
                
                // Update in UI
                updatedFeatures[currentIndex] = updatedFeature;
                updatedFeatures[prevIndex] = prevFeature;
                
                // Update state
                setEditedFeature(updatedFeature);
                setFeatures(updatedFeatures);
                
                // Send updates to the server
                onUpdate(updatedFeature);
                onUpdate(prevFeature);
              }}
              disabled={feature.display_order <= 0 || saving}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (feature.display_order >= sectionFeatures.length - 1) return;
                
                const updatedFeatures = [...features];
                const currentIndex = updatedFeatures.findIndex(f => f.id === feature.id);
                const nextIndex = updatedFeatures.findIndex(f => 
                  f.section_key === sectionKey && f.display_order === feature.display_order + 1
                );
                
                if (nextIndex === -1) return;
                
                // Swap display orders
                const updatedFeature = {
                  ...editedFeature,
                  display_order: editedFeature.display_order + 1
                };
                
                const nextFeature = {
                  ...updatedFeatures[nextIndex],
                  display_order: updatedFeatures[nextIndex].display_order - 1
                };
                
                // Update in UI
                updatedFeatures[currentIndex] = updatedFeature;
                updatedFeatures[nextIndex] = nextFeature;
                
                // Update state
                setEditedFeature(updatedFeature);
                setFeatures(updatedFeatures);
                
                // Send updates to the server
                onUpdate(updatedFeature);
                onUpdate(nextFeature);
              }}
              disabled={feature.display_order >= sectionFeatures.length - 1 || saving}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`feature-active-${feature.id}`}>Aktif</Label>
            <Switch 
              id={`feature-active-${feature.id}`}
              checked={editedFeature.is_active} 
              onCheckedChange={handleSwitchChange} 
              disabled={saving}
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
                  value={editedFeature.title_tr}
                  onChange={handleInputChange}
                  placeholder="Özellik başlığı"
                  disabled={saving}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Açıklama</Label>
                <Textarea
                  name="description_tr"
                  value={editedFeature.description_tr}
                  onChange={handleInputChange}
                  placeholder="Özellik açıklaması"
                  rows={3}
                  disabled={saving}
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
                  value={editedFeature.title_en}
                  onChange={handleInputChange}
                  placeholder="Feature title"
                  disabled={saving}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  name="description_en"
                  value={editedFeature.description_en}
                  onChange={handleInputChange}
                  placeholder="Feature description"
                  rows={3}
                  disabled={saving}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="grid gap-2">
          <Label>Link (Optional)</Label>
          <Input
            name="link"
            value={editedFeature.link || ""}
            onChange={handleInputChange}
            placeholder="https://example.com"
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty if no link is needed
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label>Resim</Label>
          <ImageUploader
            currentImageUrl={editedFeature.image_url || undefined}
            onImageUploaded={handleImageUpload}
            bucketName="homepage"
            folderPath="features"
            disabled={saving}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 pt-0">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={saving}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {confirmDelete ? "Emin misiniz?" : "Sil"}
        </Button>
        
        <Button 
          size="sm"
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
      </CardFooter>
    </Card>
  );
};

export default HomeFeatureItem;
