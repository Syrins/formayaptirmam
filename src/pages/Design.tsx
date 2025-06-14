import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, PenSquare, Layers, CheckCircle, Save, Download, Palette, BoxSelect } from "lucide-react";
import { useDesignOptions, useDesignTemplates, DesignTemplate } from "@/hooks/use-design-options";
import { Helmet } from "react-helmet-async";
import DesignCanvas from "@/components/design/DesignCanvas";
import { Input } from "@/components/ui/input";

interface DesignContent {
  id: string;
  section: string;
  title_en: string;
  title_tr: string;
  description_en: string;
  description_tr: string;
}

const Design: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("2d");
  const [content, setContent] = useState<DesignContent | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"2D" | "3D">("2D");
  const [customText, setCustomText] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  
  // Get design templates
  const { templates, loading: templatesLoading } = useDesignTemplates();
  
  // Get design options
  const { options: colorOptions, loading: colorsLoading } = useDesignOptions("color");
  const { options: fabricOptions, loading: fabricsLoading } = useDesignOptions("fabric");
  const { options: fontOptions, loading: fontsLoading } = useDesignOptions("font");
  
  // Filter templates by type (2D or 3D)
  const filteredTemplates = templates.filter(
    template => template.type === activeTab && template.is_active
  );
  
  // Get selected template details
  const currentTemplate = templates.find(template => template.id === selectedTemplate);

  // Fetch content data
  useEffect(() => {
    const fetchContent = async () => {
      setContentLoading(true);
      try {
        const { data, error } = await supabase
          .from("homepage_content")
          .select("*")
          .eq("section", "design")
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching design content:", error);
          toast.error(t('error_fetching_content') || "İçerik yüklenirken hata oluştu");
        } else if (data) {
          setContent(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setContentLoading(false);
      }
    };
    
    fetchContent();
  }, [t]);

  // Set default selections when data is loaded
  useEffect(() => {
    // Set default template
    if (!selectedTemplate && filteredTemplates.length > 0) {
      setSelectedTemplate(filteredTemplates[0].id);
    }
    
    // Set default color
    if (!selectedColor && colorOptions.length > 0) {
      const defaultColor = colorOptions.find(option => option.is_active);
      if (defaultColor) {
        setSelectedColor(defaultColor.id);
      }
    }
    
    // Set default fabric
    if (!selectedFabric && fabricOptions.length > 0) {
      const defaultFabric = fabricOptions.find(option => option.is_active);
      if (defaultFabric) {
        setSelectedFabric(defaultFabric.id);
      }
    }
    
    // Set default font
    if (!selectedFont && fontOptions.length > 0) {
      const defaultFont = fontOptions.find(option => option.is_active);
      if (defaultFont) {
        setSelectedFont(defaultFont.id);
      }
    }
  }, [templates, colorOptions, fabricOptions, fontOptions, filteredTemplates]);

  // Handle tab change and reset selected template
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update the active view to match the tab
    setActiveView(value === "3d" ? "3D" : "2D");
    
    // Find first template of the new type
    const firstTemplate = templates.find(t => t.type === value && t.is_active);
    if (firstTemplate) {
      setSelectedTemplate(firstTemplate.id);
    } else {
      setSelectedTemplate(null);
    }
  };
  
  // Handle template cycling and selection
  const handlePreviousTemplate = () => {
    if (!selectedTemplate || filteredTemplates.length <= 1) return;
    
    const currentIndex = filteredTemplates.findIndex(t => t.id === selectedTemplate);
    if (currentIndex > 0) {
      setSelectedTemplate(filteredTemplates[currentIndex - 1].id);
    } else {
      setSelectedTemplate(filteredTemplates[filteredTemplates.length - 1].id);
    }
  };
  
  const handleNextTemplate = () => {
    if (!selectedTemplate || filteredTemplates.length <= 1) return;
    
    const currentIndex = filteredTemplates.findIndex(t => t.id === selectedTemplate);
    if (currentIndex < filteredTemplates.length - 1) {
      setSelectedTemplate(filteredTemplates[currentIndex + 1].id);
    } else {
      setSelectedTemplate(filteredTemplates[0].id);
    }
  };
  
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };
  
  // Handle option selections
  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
  };
  
  const handleFabricSelect = (fabricId: string) => {
    setSelectedFabric(fabricId);
  };
  
  const handleFontSelect = (fontId: string) => {
    setSelectedFont(fontId);
  };
  
  // Handle save/download design
  const handleSaveDesign = () => {
    toast.success(t('design_saved') || "Tasarımınız kaydedildi!");
  };
  
  const handleDownloadDesign = () => {
    toast.success(t('design_downloaded') || "Tasarımınız indirildi!");
  };

  // Get selected option details
  const currentColor = colorOptions.find(color => color.id === selectedColor);
  const currentFabric = fabricOptions.find(fabric => fabric.id === selectedFabric);
  const currentFont = fontOptions.find(font => font.id === selectedFont);

  const isLoading = templatesLoading || colorsLoading || fabricsLoading || fontsLoading || contentLoading;

  return (
    <Layout>
      <Helmet>
        <title>Özel Formanızı Tasarlayın - Athletic Galaxy</title>
        <meta name="description" content="Özel formanızı online tasarlayın" />
      </Helmet>
      
      {/* Hero Section - Simplified */}
      <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Özel Formanızı Tasarlayın
            </h1>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mr-2" />
          <span className="text-xl">{t("loading") || "Yükleniyor..."}</span>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Design Canvas */}
            <div className="w-full lg:w-2/3 order-2 lg:order-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
                    <TabsList>
                      <TabsTrigger value="2d" className="flex items-center gap-1">
                        <PenSquare className="h-4 w-4" />
                        <span>2D</span>
                      </TabsTrigger>
                      <TabsTrigger value="3d" className="flex items-center gap-1">
                        <Layers className="h-4 w-4" />
                        <span>3D</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveDesign} className="flex items-center gap-1">
                      <Save className="h-4 w-4" />
                      <span>{t("save_design") || "Kaydet"}</span>
                    </Button>
                    <Button size="sm" onClick={handleDownloadDesign} className="flex items-center gap-1 bg-primary hover:bg-primary/90">
                      <Download className="h-4 w-4" />
                      <span>{t("download") || "İndir"}</span>
                    </Button>
                  </div>
                </div>
                
                {/* Main design canvas */}
                <DesignCanvas 
                  activeView={activeView}
                  setActiveView={setActiveView}
                  text={customText}
                  number={customNumber}
                  selectedColor={currentColor?.value || "#000000"}
                  selectedFont={currentFont?.value || "Arial"}
                  selectedTemplate={currentTemplate || null}
                  onPreviousTemplate={handlePreviousTemplate}
                  onNextTemplate={handleNextTemplate}
                />
              </div>
            </div>
            
            {/* Right Column - Design Options */}
            <div className="w-full lg:w-1/3 order-1 lg:order-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-primary" />
                  {t("design_options") || "Tasarım Seçenekleri"}
                </h2>
                
                {/* Templates */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 text-gray-500 dark:text-gray-400 flex items-center">
                    <BoxSelect className="h-4 w-4 mr-1 text-primary/70" />
                    {t("templates") || "Şablonlar"}:
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`relative cursor-pointer rounded-md overflow-hidden border-2 transition-all shadow-sm hover:shadow-md ${
                          selectedTemplate === template.id 
                            ? 'border-primary ring-1 ring-primary' 
                            : 'border-transparent hover:border-primary/50'
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <img 
                          src={template.preview_url || '/placeholder.svg'} 
                          alt={language === 'tr' ? template.name_tr : template.name} 
                          className="aspect-square object-cover w-full"
                        />
                        {selectedTemplate === template.id && (
                          <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Customization */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 text-gray-500 dark:text-gray-400">
                    {t("customization") || "Özelleştirme"}:
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("custom_text") || "Özel Yazı"}:
                      </label>
                      <Input 
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder={t("enter_text") || "Yazı girin"}
                        maxLength={20}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("jersey_number") || "Forma Numarası"}:
                      </label>
                      <Input 
                        value={customNumber}
                        onChange={(e) => {
                          // Only accept numbers
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 2) {
                            setCustomNumber(value);
                          }
                        }}
                        placeholder={t("enter_number") || "Numara girin"}
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Colors */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 text-gray-500 dark:text-gray-400">
                    {t("colors") || "Renkler"}:
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <div
                        key={color.id}
                        className={`cursor-pointer rounded-full w-8 h-8 flex items-center justify-center border-2 transition-all shadow-sm ${
                          selectedColor === color.id 
                            ? 'border-primary ring-1 ring-primary' 
                            : 'border-transparent hover:border-primary/50'
                        }`}
                        onClick={() => handleColorSelect(color.id)}
                        title={color.displayName}
                      >
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: color.value }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Fabrics and Fonts in single row for space saving */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Fabrics */}
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
                      {t("fabrics") || "Kumaşlar"}:
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {fabricOptions.map((fabric) => (
                        <div
                          key={fabric.id}
                          className={`cursor-pointer rounded-md px-2 py-1 text-xs transition-all ${
                            selectedFabric === fabric.id 
                              ? 'bg-primary text-white shadow' 
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => handleFabricSelect(fabric.id)}
                        >
                          {fabric.displayName}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Fonts */}
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
                      {t("fonts") || "Yazı Tipleri"}:
                    </h3>
                    
                    <div className="space-y-1">
                      {fontOptions.map((font) => (
                        <div
                          key={font.id}
                          className={`cursor-pointer rounded-md px-2 py-1 text-xs transition-all ${
                            selectedFont === font.id 
                              ? 'bg-primary text-white shadow' 
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => handleFontSelect(font.id)}
                          style={{ fontFamily: font.value }}
                        >
                          Aa 123
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Call to action */}
                <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 mt-4">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    {t("contact_for_order") || "Sipariş İçin İletişime Geç"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Design;
