
import React from "react";
import { ShoppingBag, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { DesignOption } from "@/hooks/use-design-options";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DesignControlsProps {
  fabricOptions: DesignOption[];
  fontOptions: DesignOption[];
  selectedFabric: string;
  setSelectedFabric: (fabric: string) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  number: string;
  setNumber: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  activeView: "2D" | "3D";
  setActiveView: React.Dispatch<React.SetStateAction<"2D" | "3D">>;
}

const DesignControls: React.FC<DesignControlsProps> = ({
  fabricOptions,
  fontOptions,
  selectedFabric,
  setSelectedFabric,
  selectedFont,
  setSelectedFont,
  text,
  setText,
  number,
  setNumber,
  isLoading,
  activeView,
  setActiveView,
}) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleBuyNowClick = () => {
    const fabricName = fabricOptions.find(f => f.value === selectedFabric)?.displayName || '';
    const fontName = fontOptions.find(f => f.value === selectedFont)?.displayName || '';
    
    const message = encodeURIComponent(
      language === 'tr' 
        ? `Merhaba, aşağıdaki özelliklere sahip özel bir forma siparişi hakkında bilgi almak istiyorum:\n- Kumaş: ${fabricName}\n- Font: ${fontName}\n- Metin: ${text}\n- Numara: ${number}\nBu özel tasarımı sipariş etmek hakkında daha fazla bilgi alabilir miyim?`
        : `Hello, I'd like to inquire about a custom jersey order with the following specifications:\n- Fabric: ${fabricName}\n- Font: ${fontName}\n- Text: ${text}\n- Number: ${number}\nCould you please provide more details about ordering this custom design?`
    );
    
    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/905543428442?text=${message}`, '_blank');

    toast({
      title: t("custom_design") || "Custom Design",
      description: t("custom_design_details") || "Your custom design details have been prepared for ordering",
    });
  };

  const handleFileUpload = () => {
    toast({
      title: t("upload_logo") || "Upload Logo",
      description: t("upload_coming_soon") || "Logo upload feature is coming soon",
    });
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">{t("customization_options") || "Customization Options"}</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "2D" | "3D")} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="2D">
            {t("view_2d") || "2D View"}
          </TabsTrigger>
          <TabsTrigger value="3D">
            {t("view_3d") || "3D View"}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <h2 className="text-xl font-semibold mb-6">{t("customization_options") || "Customization Options"}</h2>
      
      {/* Fabric Selection */}
      <div className="mb-6">
        <Label htmlFor="fabric-select" className="block mb-2">{t("fabric_type") || "Fabric Type"}</Label>
        <Select value={selectedFabric} onValueChange={setSelectedFabric}>
          <SelectTrigger id="fabric-select" className="w-full">
            <SelectValue placeholder={language === 'tr' ? 'Kumaş tipi seçin' : 'Select fabric type'} />
          </SelectTrigger>
          <SelectContent>
            {fabricOptions.map((fabric) => (
              <SelectItem key={fabric.id} value={fabric.value}>
                {fabric.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Text Options */}
      <div className="mb-6">
        <Label className="block mb-3">{t("text_customization") || "Text Customization"}</Label>
        
        <div className="space-y-3">
          {/* Font Selection */}
          <div>
            <Label htmlFor="font-select" className="block mb-2 text-sm">{t("font_style") || "Font Style"}</Label>
            <Select value={selectedFont} onValueChange={setSelectedFont}>
              <SelectTrigger id="font-select" className="w-full">
                <SelectValue placeholder={language === 'tr' ? 'Font seçin' : 'Select font'} />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.id} value={font.value} style={{ fontFamily: font.value }}>
                    {font.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Text Input */}
          <div>
            <Label htmlFor="text-input" className="block mb-2 text-sm">{t("team_name") || "Team Name"}</Label>
            <Input
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={language === 'tr' ? 'Takım adı girin' : 'Enter team name'}
            />
          </div>
          
          {/* Number Input */}
          <div>
            <Label htmlFor="number-input" className="block mb-2 text-sm">{t("jersey_number") || "Jersey Number"}</Label>
            <Input
              id="number-input"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder={language === 'tr' ? 'Numara girin' : 'Enter number'}
              type="number"
              min="0"
              max="99"
            />
          </div>
        </div>
      </div>
      
      {/* Logo Upload */}
      <div className="mb-8">
        <Label className="block mb-3">{t("upload_logo") || "Upload Logo"}</Label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t("upload_logo_text") || "Upload your team logo or other imagery"}
          </p>
          <Button variant="outline" size="sm" onClick={handleFileUpload}>
            {t("upload_logo") || "Upload Logo"}
          </Button>
        </div>
      </div>
      
      {/* Order Button */}
      <Button 
        onClick={handleBuyNowClick}
        className="bg-galaxy-gradient hover:opacity-90 transition-all duration-300 w-full"
        size="lg"
      >
        <ShoppingBag className="h-5 w-5 mr-2" /> 
        {t("order_via_whatsapp") || "Order via WhatsApp"}
      </Button>
      
      {/* Features List */}
      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{t("features_included") || "Features Included"}</h3>
        <ul className="text-sm space-y-1">
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" /> 
            {t("feature_custom_fabrics") || "Custom fabrics"}
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" /> 
            {t("feature_team_name") || "Team name and numbers"}
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" /> 
            {t("feature_custom_fonts") || "Multiple font options"}
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" /> 
            {t("feature_bulk_order") || "Bulk order discounts"}
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" /> 
            {t("feature_quality") || "Premium quality materials"}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DesignControls;
