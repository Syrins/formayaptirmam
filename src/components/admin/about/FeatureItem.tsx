
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Loader2, Trash } from "lucide-react";
import { AboutFeature } from "@/hooks/use-about-content";
import { useLanguage } from "@/context/LanguageContext";

interface FeatureItemProps {
  feature: AboutFeature;
  sectionKey: string;
  onUpdate: (feature: AboutFeature) => Promise<void>;
  onDelete: (featureId: string) => Promise<void>;
  saving: boolean;
  setFeatures: React.Dispatch<React.SetStateAction<AboutFeature[]>>;
  features: AboutFeature[];
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  feature,
  sectionKey,
  onUpdate,
  onDelete,
  saving,
  setFeatures,
  features,
}) => {
  const { language } = useLanguage();

  const updateFeatureField = (field: string, value: any) => {
    const updated = { ...feature, [field]: value };
    setFeatures(features.map(f => f.id === feature.id ? updated : f));
  };

  return (
    <Card key={feature.id} className="border">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">
            {language === 'tr' ? feature.title_tr : feature.title_en}
            <Badge className="ml-2" variant={feature.is_active ? "default" : "secondary"}>
              {feature.is_active ? "Aktif" : "Pasif"}
            </Badge>
          </CardTitle>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bu özelliği silmek istediğinizden emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. Bu özellik kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(feature.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Evet, Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${feature.id}-title-tr`}>Başlık (TR)</Label>
              <Input
                id={`${feature.id}-title-tr`}
                value={feature.title_tr}
                onChange={(e) => updateFeatureField("title_tr", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${feature.id}-title-en`}>Başlık (EN)</Label>
              <Input
                id={`${feature.id}-title-en`}
                value={feature.title_en}
                onChange={(e) => updateFeatureField("title_en", e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${feature.id}-desc-tr`}>Açıklama (TR)</Label>
              <Textarea
                id={`${feature.id}-desc-tr`}
                value={feature.description_tr}
                rows={3}
                onChange={(e) => updateFeatureField("description_tr", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${feature.id}-desc-en`}>Açıklama (EN)</Label>
              <Textarea
                id={`${feature.id}-desc-en`}
                value={feature.description_en}
                rows={3}
                onChange={(e) => updateFeatureField("description_en", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${feature.id}-image`}>Özellik Görseli</Label>
            <ImageUploader
              currentImageUrl={feature.image_url}
              onImageUploaded={(url) => updateFeatureField("image_url", url)}
              folderPath={`features/${sectionKey}`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${feature.id}-order`}>Sıralama</Label>
              <Input
                id={`${feature.id}-order`}
                type="number"
                value={feature.display_order}
                onChange={(e) => updateFeatureField("display_order", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${feature.id}-status`}>Durum</Label>
              <select
                id={`${feature.id}-status`}
                className="w-full h-10 px-3 rounded-md border"
                value={feature.is_active ? "active" : "inactive"}
                onChange={(e) => updateFeatureField("is_active", e.target.value === "active")}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={() => onUpdate(feature)}
            disabled={saving}
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureItem;
