
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LogoTypeEditor from "./logo/LogoTypeEditor";
import LogoColorEditor from "./logo/LogoColorEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

export interface SiteSettings {
  id: string;
  logo_type: string;
  logo_text?: string;
  logo_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  text_color?: string;
  background_color?: string;
  use_gradient: boolean;
  gradient_start?: string;
  gradient_end?: string;
  gradient_direction?: string;
  gradient_intensity?: number;
  font_family?: string;
  text_shadow?: boolean;
  text_shadow_color?: string;
  text_shadow_blur?: number;
  letter_colors?: Record<number, string>;
  use_letter_colors?: boolean;
}

const AdminLogoSettings: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  useEffect(() => {
    fetchSettings();
    
    // Subscribe to settings changes
    const channel = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'site_settings',
        filter: 'id=eq.default'
      }, (payload) => {
        // Transform the data and set state
        const newData = payload.new as any;
        setSettings({
          ...newData,
          // Convert Json to Record<number, string>
          letter_colors: newData.letter_colors ? transformLetterColors(newData.letter_colors) : {},
          use_letter_colors: !!newData.use_letter_colors
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Helper function to transform letter_colors from Json to Record<number, string>
  const transformLetterColors = (jsonData: Json): Record<number, string> => {
    if (!jsonData || typeof jsonData !== 'object') return {};
    
    const result: Record<number, string> = {};
    Object.entries(jsonData as object).forEach(([key, value]) => {
      const numKey = parseInt(key, 10);
      if (!isNaN(numKey) && typeof value === 'string') {
        result[numKey] = value;
      }
    });
    return result;
  };
  
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "default")
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        // Transform the data before setting state
        setSettings({
          ...data,
          letter_colors: data.letter_colors ? transformLetterColors(data.letter_colors) : {},
          use_letter_colors: !!data.use_letter_colors
        });
      } else {
        setSettings({
          id: "default",
          logo_type: "text",
          logo_text: "FormaYaptirma",
          primary_color: "#9b87f5",
          text_color: "#222222",
          background_color: "#ffffff",
          use_gradient: false,
          font_family: "poppins",
          gradient_intensity: 100,
          text_shadow: false,
          text_shadow_color: "rgba(0,0,0,0.25)",
          text_shadow_blur: 4,
          letter_colors: {},
          use_letter_colors: false
        });
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      toast.error(t("settings_load_error") || "Ayarlar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Transform letter_colors from Record<number, string> back to a plain object for database storage
      const dataToUpdate = {
        ...updatedSettings,
        letter_colors: updatedSettings.letter_colors || {}
      };
      
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          ...dataToUpdate,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setSettings(updatedSettings as SiteSettings);
      toast.success(t("settings_updated") || "Ayarlar güncellendi");
    } catch (error) {
      console.error("Error updating site settings:", error);
      toast.error(t("settings_update_error") || "Ayarlar güncellenirken hata oluştu");
      throw error;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!settings) {
    return (
      <div className="text-center p-10 dark:text-gray-300">
        <p>{t("no_settings_found") || "Ayarlar bulunamadı"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">{t("logo_settings") || "Logo Ayarları"}</CardTitle>
          <CardDescription className="dark:text-gray-400">
            {t("logo_settings_description") || "Sitenizin logosu ve renklerini ayarlayın."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="logo">{t("logo_and_text") || "Logo & Yazı"}</TabsTrigger>
              <TabsTrigger value="colors">{t("colors") || "Renkler"}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="logo">
              <LogoTypeEditor 
                settings={settings} 
                updateSettings={updateSettings}
              />
            </TabsContent>
            
            <TabsContent value="colors">
              <LogoColorEditor 
                settings={settings} 
                updateSettings={updateSettings}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogoSettings;
