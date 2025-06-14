
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Palette, PaintBucket, Droplets, Circle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { SiteSettings } from "../AdminLogoSettings";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LogoColorEditorProps {
  settings: SiteSettings;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

// Gradient direction options
const gradientDirections = [
  { value: "to right", label: "Horizontal (→)" },
  { value: "to bottom", label: "Vertical (↓)" },
  { value: "to bottom right", label: "Diagonal (↘)" },
  { value: "45deg", label: "45° (↗)" },
  { value: "135deg", label: "135° (↘)" },
  { value: "225deg", label: "225° (↙)" },
  { value: "315deg", label: "315° (↖)" },
];

// Preset gradient options
const presetGradients = [
  { name: "Sunrise", start: "#FF512F", end: "#F09819", direction: "45deg" },
  { name: "Ocean Blue", start: "#2193b0", end: "#6dd5ed", direction: "135deg" },
  { name: "Purple Love", start: "#cc2b5e", end: "#753a88", direction: "to right" },
  { name: "Fresh Mint", start: "#00b09b", end: "#96c93d", direction: "to bottom" },
  { name: "Cosmic Fusion", start: "#ff00cc", end: "#333399", direction: "315deg" },
  { name: "Warm Sunset", start: "#eb3349", end: "#f45c43", direction: "to bottom right" },
];

const LogoColorEditor: React.FC<LogoColorEditorProps> = ({ settings, updateSettings }) => {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [gradientTab, setGradientTab] = useState<string>("custom");
  const [localSettings, setLocalSettings] = useState<Partial<SiteSettings>>({
    primary_color: settings.primary_color || "#9b87f5",
    secondary_color: settings.secondary_color || "#7E69AB",
    text_color: settings.text_color || "#222222",
    background_color: settings.background_color || "#ffffff",
    use_gradient: settings.use_gradient || false,
    gradient_start: settings.gradient_start || "#9b87f5",
    gradient_end: settings.gradient_end || "#6E59A5",
    gradient_direction: settings.gradient_direction || "135deg",
    gradient_intensity: settings.gradient_intensity || 100,
    text_shadow: settings.text_shadow || false,
    text_shadow_color: settings.text_shadow_color || "rgba(0,0,0,0.25)",
    text_shadow_blur: settings.text_shadow_blur || 4,
  });
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
    } finally {
      setSaving(false);
    }
  };

  // Get preview styles based on current settings
  const getPreviewStyles = () => {
    let baseStyles = {
      fontFamily: settings.font_family ? `'${settings.font_family}', sans-serif` : "'Poppins', sans-serif",
      color: localSettings.text_color,
      padding: "15px 30px",
      borderRadius: "8px",
      display: "inline-block"
    };

    if (localSettings.use_gradient) {
      return {
        ...baseStyles,
        background: `linear-gradient(${localSettings.gradient_direction}, ${localSettings.gradient_start}, ${localSettings.gradient_end})`,
      };
    } else {
      return {
        ...baseStyles,
        background: localSettings.primary_color,
      };
    }
  };
  
  // For logo preview text with gradient
  const getLogoTextStyles = () => {
    const intensity = localSettings.gradient_intensity ? localSettings.gradient_intensity / 100 : 1;
    const transparentColor = "rgba(255,255,255,0)";
    
    // Apply text shadow if enabled
    const textShadow = localSettings.text_shadow 
      ? `0 0 ${localSettings.text_shadow_blur || 4}px ${localSettings.text_shadow_color || 'rgba(0,0,0,0.25)'}`
      : 'none';
      
    if (localSettings.use_gradient) {
      return {
        fontFamily: settings.font_family ? `'${settings.font_family}', sans-serif` : "'Poppins', sans-serif",
        background: intensity < 1
          ? `linear-gradient(${localSettings.gradient_direction}, 
             color-mix(in srgb, ${localSettings.gradient_start} ${intensity * 100}%, ${transparentColor}), 
             color-mix(in srgb, ${localSettings.gradient_end} ${intensity * 100}%, ${transparentColor}))`
          : `linear-gradient(${localSettings.gradient_direction}, ${localSettings.gradient_start}, ${localSettings.gradient_end})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textShadow,
      };
    }
    return {
      textShadow,
    };
  };
  
  // Apply preset gradient
  const applyPresetGradient = (preset: typeof presetGradients[0]) => {
    setLocalSettings({
      ...localSettings,
      gradient_start: preset.start,
      gradient_end: preset.end,
      gradient_direction: preset.direction,
      use_gradient: true
    });
  };
  
  const logoTextParts = (settings.logo_text || "FormaYaptirma").split(/(?=Yaptirma)/);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-6 flex justify-center items-center">
        <div className="preview-container">
          <div className="text-xl font-bold">
            {settings.logo_type === "text" ? (
              localSettings.use_gradient ? (
                <div style={getLogoTextStyles()}>
                  {settings.logo_text || "FormaYaptirma"}
                </div>
              ) : (
                <>
                  <span className="text-white">{logoTextParts[0]}</span>
                  <span style={{ color: localSettings.text_color }}>
                    {logoTextParts.length > 1 ? logoTextParts[1] : ""}
                  </span>
                </>
              )
            ) : (
              settings.logo_image_url ? (
                <img 
                  src={settings.logo_image_url} 
                  alt="Logo" 
                  className="max-h-12"
                />
              ) : (
                <span className="text-white">Logo Preview</span>
              )
            )}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="colors">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="colors">
            <Palette className="mr-2 h-4 w-4" />
            {t("basic_colors") || "Temel Renkler"}
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Droplets className="mr-2 h-4 w-4" />
            {t("advanced_styling") || "Gelişmiş Stiller"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-color" className="dark:text-gray-200">{t("primary_color") || "Ana Renk"}</Label>
              <div className="flex space-x-2">
                <div 
                  className="w-10 h-10 rounded-md border dark:border-gray-600"
                  style={{ backgroundColor: localSettings.primary_color }}
                />
                <Input
                  id="primary-color"
                  type="text"
                  value={localSettings.primary_color || ""}
                  onChange={(e) => setLocalSettings({...localSettings, primary_color: e.target.value})}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
                <Input
                  type="color"
                  value={localSettings.primary_color || "#9b87f5"}
                  onChange={(e) => setLocalSettings({...localSettings, primary_color: e.target.value})}
                  className="w-12 h-10 p-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondary-color" className="dark:text-gray-200">{t("secondary_color") || "İkincil Renk"}</Label>
              <div className="flex space-x-2">
                <div 
                  className="w-10 h-10 rounded-md border dark:border-gray-600"
                  style={{ backgroundColor: localSettings.secondary_color }}
                />
                <Input
                  id="secondary-color"
                  type="text"
                  value={localSettings.secondary_color || ""}
                  onChange={(e) => setLocalSettings({...localSettings, secondary_color: e.target.value})}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
                <Input
                  type="color"
                  value={localSettings.secondary_color || "#7E69AB"}
                  onChange={(e) => setLocalSettings({...localSettings, secondary_color: e.target.value})}
                  className="w-12 h-10 p-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="text-color" className="dark:text-gray-200">{t("text_color") || "Yazı Rengi"}</Label>
              <div className="flex space-x-2">
                <div 
                  className="w-10 h-10 rounded-md border dark:border-gray-600"
                  style={{ backgroundColor: localSettings.text_color }}
                />
                <Input
                  id="text-color"
                  type="text"
                  value={localSettings.text_color || ""}
                  onChange={(e) => setLocalSettings({...localSettings, text_color: e.target.value})}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
                <Input
                  type="color"
                  value={localSettings.text_color || "#222222"}
                  onChange={(e) => setLocalSettings({...localSettings, text_color: e.target.value})}
                  className="w-12 h-10 p-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="background-color" className="dark:text-gray-200">{t("background_color") || "Arka Plan Rengi"}</Label>
              <div className="flex space-x-2">
                <div 
                  className="w-10 h-10 rounded-md border dark:border-gray-600"
                  style={{ backgroundColor: localSettings.background_color }}
                />
                <Input
                  id="background-color"
                  type="text"
                  value={localSettings.background_color || ""}
                  onChange={(e) => setLocalSettings({...localSettings, background_color: e.target.value})}
                  className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
                <Input
                  type="color"
                  value={localSettings.background_color || "#ffffff"}
                  onChange={(e) => setLocalSettings({...localSettings, background_color: e.target.value})}
                  className="w-12 h-10 p-1"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="space-y-6">
            {/* Gradient Controls */}
            <div className="border p-4 rounded-md dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-gradient"
                  checked={localSettings.use_gradient}
                  onCheckedChange={(checked) => setLocalSettings({...localSettings, use_gradient: checked})}
                />
                <Label htmlFor="use-gradient" className="dark:text-gray-200 flex items-center">
                  <Droplets className="mr-2 h-4 w-4" />
                  {t("use_gradient") || "Gradyan Kullan"}
                </Label>
              </div>
              
              {localSettings.use_gradient && (
                <div className="mt-4 space-y-4">
                  <Tabs value={gradientTab} onValueChange={setGradientTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="presets">{t("presets") || "Hazır Gradyanlar"}</TabsTrigger>
                      <TabsTrigger value="custom">{t("custom") || "Özel"}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="presets" className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {presetGradients.map((preset, index) => (
                          <div 
                            key={index}
                            className="h-12 rounded-md cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                            style={{background: `linear-gradient(${preset.direction}, ${preset.start}, ${preset.end})`}}
                            onClick={() => applyPresetGradient(preset)}
                          >
                            <div className="h-full w-full flex items-center justify-center text-white font-medium text-xs">
                              {preset.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="custom" className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gradient-start" className="dark:text-gray-200">{t("gradient_start") || "Gradyan Başlangıç"}</Label>
                          <div className="flex space-x-2">
                            <div 
                              className="w-10 h-10 rounded-md border dark:border-gray-600"
                              style={{ backgroundColor: localSettings.gradient_start }}
                            />
                            <Input
                              id="gradient-start"
                              type="text"
                              value={localSettings.gradient_start || ""}
                              onChange={(e) => setLocalSettings({...localSettings, gradient_start: e.target.value})}
                              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                            />
                            <Input
                              type="color"
                              value={localSettings.gradient_start || "#9b87f5"}
                              onChange={(e) => setLocalSettings({...localSettings, gradient_start: e.target.value})}
                              className="w-12 h-10 p-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="gradient-end" className="dark:text-gray-200">{t("gradient_end") || "Gradyan Bitiş"}</Label>
                          <div className="flex space-x-2">
                            <div 
                              className="w-10 h-10 rounded-md border dark:border-gray-600"
                              style={{ backgroundColor: localSettings.gradient_end }}
                            />
                            <Input
                              id="gradient-end"
                              type="text"
                              value={localSettings.gradient_end || ""}
                              onChange={(e) => setLocalSettings({...localSettings, gradient_end: e.target.value})}
                              className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                            />
                            <Input
                              type="color"
                              value={localSettings.gradient_end || "#6E59A5"}
                              onChange={(e) => setLocalSettings({...localSettings, gradient_end: e.target.value})}
                              className="w-12 h-10 p-1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="gradient-direction" className="dark:text-gray-200">{t("gradient_direction") || "Gradyan Yönü"}</Label>
                        <Select
                          value={localSettings.gradient_direction}
                          onValueChange={(value) => setLocalSettings({...localSettings, gradient_direction: value})}
                        >
                          <SelectTrigger id="gradient-direction" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                            <SelectValue placeholder={t("select_direction") || "Yön seç"} />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
                            {gradientDirections.map((direction) => (
                              <SelectItem key={direction.value} value={direction.value}>
                                {direction.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="gradient-intensity" className="dark:text-gray-200">
                          {t("gradient_intensity") || "Gradyan Yoğunluğu"}: {localSettings.gradient_intensity || 100}%
                        </Label>
                        <Slider
                          id="gradient-intensity"
                          min={10}
                          max={100}
                          step={1}
                          defaultValue={[localSettings.gradient_intensity || 100]}
                          value={[localSettings.gradient_intensity || 100]}
                          onValueChange={(values) => setLocalSettings({...localSettings, gradient_intensity: values[0]})}
                          className="py-4"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="h-12 rounded-md"
                    style={{
                      background: `linear-gradient(${localSettings.gradient_direction}, ${localSettings.gradient_start}, ${localSettings.gradient_end})`
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Text Shadow Controls */}
            <div className="border p-4 rounded-md dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Switch
                  id="text-shadow"
                  checked={localSettings.text_shadow || false}
                  onCheckedChange={(checked) => setLocalSettings({...localSettings, text_shadow: checked})}
                />
                <Label htmlFor="text-shadow" className="dark:text-gray-200">
                  {t("text_shadow") || "Metin Gölgesi"}
                </Label>
              </div>
              
              {localSettings.text_shadow && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="text-shadow-color" className="dark:text-gray-200">{t("text_shadow_color") || "Gölge Rengi"}</Label>
                    <div className="flex space-x-2">
                      <div 
                        className="w-10 h-10 rounded-md border dark:border-gray-600"
                        style={{ backgroundColor: localSettings.text_shadow_color }}
                      />
                      <Input
                        id="text-shadow-color"
                        type="text"
                        value={localSettings.text_shadow_color || ""}
                        onChange={(e) => setLocalSettings({...localSettings, text_shadow_color: e.target.value})}
                        className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      />
                      <Input
                        type="color"
                        value={localSettings.text_shadow_color || "rgba(0,0,0,0.25)"}
                        onChange={(e) => setLocalSettings({...localSettings, text_shadow_color: e.target.value})}
                        className="w-12 h-10 p-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="text-shadow-blur" className="dark:text-gray-200">
                      {t("text_shadow_blur") || "Gölge Bulanıklığı"}: {localSettings.text_shadow_blur || 4}px
                    </Label>
                    <Slider
                      id="text-shadow-blur"
                      min={0}
                      max={20}
                      step={1}
                      defaultValue={[localSettings.text_shadow_blur || 4]}
                      value={[localSettings.text_shadow_blur || 4]}
                      onValueChange={(values) => setLocalSettings({...localSettings, text_shadow_blur: values[0]})}
                      className="py-4"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
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

export default LogoColorEditor;
