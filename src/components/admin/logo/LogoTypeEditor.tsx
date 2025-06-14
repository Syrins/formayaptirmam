
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Loader2, Type, Palette } from "lucide-react";
import { SiteSettings } from "../AdminLogoSettings";
import { useLanguage } from "@/context/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

interface LogoTypeEditorProps {
  settings: SiteSettings;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

// Font options
const fontOptions = [
  { value: "poppins", name: "Poppins" },
  { value: "roboto", name: "Roboto" },
  { value: "inter", name: "Inter" },
  { value: "open-sans", name: "Open Sans" },
  { value: "montserrat", name: "Montserrat" },
  { value: "lato", name: "Lato" }
];

const LogoTypeEditor: React.FC<LogoTypeEditorProps> = ({ settings, updateSettings }) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<Partial<SiteSettings>>({
    logo_type: settings.logo_type,
    logo_text: settings.logo_text,
    logo_image_url: settings.logo_image_url,
    font_family: settings.font_family || "poppins",
    use_letter_colors: settings.use_letter_colors || false,
    letter_colors: settings.letter_colors || {}
  });
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
    } finally {
      setSaving(false);
    }
  };
  
  const handleImageUploaded = (url: string) => {
    setLocalSettings({
      ...localSettings,
      logo_image_url: url
    });
  };

  // Preview styles based on current settings
  const previewLogoStyles = {
    fontFamily: 
      localSettings.font_family === "poppins" ? "'Poppins', sans-serif" :
      localSettings.font_family === "roboto" ? "'Roboto', sans-serif" :
      localSettings.font_family === "inter" ? "'Inter', sans-serif" :
      localSettings.font_family === "open-sans" ? "'Open Sans', sans-serif" :
      localSettings.font_family === "montserrat" ? "'Montserrat', sans-serif" :
      localSettings.font_family === "lato" ? "'Lato', sans-serif" :
      "'Poppins', sans-serif",
    color: settings.text_color || "#222222",
    fontSize: "2rem",
    fontWeight: 700
  };

  // For letter-by-letter color preview
  const renderLogoPreview = () => {
    if (!localSettings.logo_text) return "FormaYaptirma";
    
    if (localSettings.use_letter_colors) {
      return (
        <div className="flex">
          {Array.from(localSettings.logo_text).map((letter, index) => (
            <span 
              key={index} 
              style={{
                color: localSettings.letter_colors?.[index] || settings.text_color || "#222222",
                ...previewLogoStyles
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      );
    } else {
      const logoTextParts = (localSettings.logo_text || "FormaYaptirma").split(/(?=Yaptirma)/);
      return (
        <div style={previewLogoStyles} className="text-2xl font-bold">
          {logoTextParts[0]}
          <span style={{ color: settings.primary_color || "#9b87f5" }}>
            {logoTextParts.length > 1 ? logoTextParts[1] : ""}
          </span>
        </div>
      );
    }
  };
  
  // Update letter color
  const handleLetterColorChange = (index: number, color: string) => {
    const updatedColors = {
      ...(localSettings.letter_colors || {}),
      [index]: color
    };
    
    setLocalSettings({
      ...localSettings,
      letter_colors: updatedColors
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-6 flex justify-center items-center">
        <div className="preview-container">
          {localSettings.logo_type === "text" ? (
            renderLogoPreview()
          ) : (
            <div className="h-16 flex items-center">
              {localSettings.logo_image_url ? (
                <img 
                  src={localSettings.logo_image_url} 
                  alt="Logo" 
                  className="max-h-full"
                />
              ) : (
                <div className="bg-gray-300 dark:bg-gray-700 w-48 h-12 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  {t("no_logo_selected") || "Logo seçilmedi"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <RadioGroup
        value={localSettings.logo_type}
        onValueChange={(value) => setLocalSettings({...localSettings, logo_type: value})}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="flex items-center space-x-2 border rounded-md p-4 dark:border-gray-700">
          <RadioGroupItem value="text" id="logo-type-text" />
          <Label htmlFor="logo-type-text" className="dark:text-gray-200">{t("text_logo") || "Yazı Logo"}</Label>
        </div>
        <div className="flex items-center space-x-2 border rounded-md p-4 dark:border-gray-700">
          <RadioGroupItem value="image" id="logo-type-image" />
          <Label htmlFor="logo-type-image" className="dark:text-gray-200">{t("image_logo") || "Resim Logo"}</Label>
        </div>
      </RadioGroup>
      
      <Separator className="dark:bg-gray-700" />
      
      {localSettings.logo_type === "text" ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="logo-text" className="dark:text-gray-200">{t("logo_text") || "Logo Metni"}</Label>
            <Input
              id="logo-text"
              value={localSettings.logo_text || ""}
              onChange={(e) => setLocalSettings({...localSettings, logo_text: e.target.value})}
              placeholder="FormaYaptirma"
              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("logo_text_hint") || "İpucu: Markanızı iki parçaya ayırmak için 'FormaYaptirma' gibi yazın."}
            </p>
          </div>
          
          <div>
            <Label htmlFor="font-family" className="dark:text-gray-200">{t("font_family") || "Yazı Tipi"}</Label>
            <Select
              value={localSettings.font_family}
              onValueChange={(value) => setLocalSettings({...localSettings, font_family: value})}
            >
              <SelectTrigger id="font-family" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                <SelectValue placeholder={t("select_font") || "Yazı tipi seç"} />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
                {fontOptions.map((font) => (
                  <SelectItem
                    key={font.value}
                    value={font.value}
                    style={{ fontFamily: `'${font.name}', sans-serif` }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-letter-colors"
                  checked={localSettings.use_letter_colors}
                  onCheckedChange={(checked) => setLocalSettings({...localSettings, use_letter_colors: checked})}
                />
                <Label htmlFor="use-letter-colors" className="dark:text-gray-200 flex items-center">
                  <Palette className="mr-2 h-4 w-4" />
                  {t("letter_by_letter_colors") || "Harfleri Ayrı Renklendir"}
                </Label>
              </div>
            </div>
            
            {localSettings.use_letter_colors && localSettings.logo_text && (
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3 dark:text-gray-200">
                  {t("letter_colors") || "Harf Renkleri"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from(localSettings.logo_text).map((letter, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="border dark:border-gray-600 px-2 py-1 w-8 text-center">
                        {letter}
                      </div>
                      <div className="flex-1 flex space-x-2">
                        <Input
                          type="text"
                          value={localSettings.letter_colors?.[index] || settings.text_color || "#222222"}
                          onChange={(e) => handleLetterColorChange(index, e.target.value)}
                          className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 flex-1"
                        />
                        <Input
                          type="color"
                          value={localSettings.letter_colors?.[index] || settings.text_color || "#222222"}
                          onChange={(e) => handleLetterColorChange(index, e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Label className="dark:text-gray-200">{t("logo_image") || "Logo Resmi"}</Label>
          <ImageUploader 
            onImageUploaded={handleImageUploaded} 
            currentImageUrl={localSettings.logo_image_url}
            bucketName="about"
            folderPath="logos"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("logo_image_hint") || "En iyi sonuçlar için şeffaf arka planlı (PNG) bir logo kullanın."}
          </p>
        </div>
      )}
      
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("save_settings") || "Ayarları Kaydet"}
      </Button>
    </div>
  );
};

export default LogoTypeEditor;
