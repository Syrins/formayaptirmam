
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AboutSection, AboutFeature } from "@/hooks/use-about-content";
import { toast } from "sonner";
import SectionManager from "./about/SectionManager";
import FeatureManager from "./about/FeatureManager";

const AdminAboutContent: React.FC = () => {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [features, setFeatures] = useState<AboutFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('about_sections')
          .select('*')
          .order('display_order');

        if (sectionsError) throw sectionsError;
        
        // Fetch features
        const { data: featuresData, error: featuresError } = await supabase
          .from('about_features')
          .select('*')
          .order('section_key, display_order');
          
        if (featuresError) throw featuresError;

        setSections(sectionsData || []);
        setFeatures(featuresData || []);
      } catch (error) {
        console.error("Error fetching about data:", error);
        toast.error("İçerik yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update section handler
  const updateSection = async (section: AboutSection) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('about_sections')
        .update({
          title_tr: section.title_tr,
          title_en: section.title_en,
          description_tr: section.description_tr,
          description_en: section.description_en,
          is_active: section.is_active,
          display_order: section.display_order,
          image_url: section.image_url
        })
        .eq('id', section.id);
        
      if (error) throw error;
      
      toast.success("Bölüm başarıyla güncellendi");
      
      // Update local state
      setSections(prev => prev.map(s => s.id === section.id ? section : s));
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Bölüm güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };
  
  // Update feature handler
  const updateFeature = async (feature: AboutFeature) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('about_features')
        .update({
          title_tr: feature.title_tr,
          title_en: feature.title_en,
          description_tr: feature.description_tr,
          description_en: feature.description_en,
          is_active: feature.is_active,
          display_order: feature.display_order,
          image_url: feature.image_url
        })
        .eq('id', feature.id);
        
      if (error) throw error;
      
      toast.success("Özellik başarıyla güncellendi");
      
      // Update local state
      setFeatures(prev => prev.map(f => f.id === feature.id ? feature : f));
    } catch (error) {
      console.error("Error updating feature:", error);
      toast.error("Özellik güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Add new feature handler
  const addFeature = async (section_key: string) => {
    setSaving(true);
    try {
      // Get highest display order for this section
      const sectionFeatures = features.filter(f => f.section_key === section_key);
      const maxOrder = sectionFeatures.length > 0 
        ? Math.max(...sectionFeatures.map(f => f.display_order)) 
        : 0;
      
      const newFeature = {
        section_key,
        title_tr: "Yeni Özellik",
        title_en: "New Feature",
        description_tr: "Özellik açıklaması",
        description_en: "Feature description",
        display_order: maxOrder + 1,
        is_active: true
      };
      
      const { data, error } = await supabase
        .from('about_features')
        .insert([newFeature])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success("Yeni özellik eklendi");
        setFeatures([...features, data[0]]);
      }
    } catch (error) {
      console.error("Error adding feature:", error);
      toast.error("Özellik eklenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };
  
  // Delete feature handler
  const deleteFeature = async (featureId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('about_features')
        .delete()
        .eq('id', featureId);
        
      if (error) throw error;
      
      toast.success("Özellik başarıyla silindi");
      
      // Update local state
      setFeatures(features.filter(f => f.id !== featureId));
    } catch (error) {
      console.error("Error deleting feature:", error);
      toast.error("Özellik silinirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Add new section handler
  const addSection = async () => {
    setSaving(true);
    try {
      // Get highest display order
      const maxOrder = sections.length > 0 
        ? Math.max(...sections.map(s => s.display_order)) 
        : 0;
      
      // Generate a unique key
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const sectionKey = `custom_section_${timestamp}_${randomString}`;
      
      const newSection = {
        section_key: sectionKey,
        title_tr: "Yeni Bölüm",
        title_en: "New Section",
        description_tr: "Bölüm açıklaması",
        description_en: "Section description",
        display_order: maxOrder + 1,
        is_active: true
      };
      
      const { data, error } = await supabase
        .from('about_sections')
        .insert([newSection])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success("Yeni bölüm eklendi");
        setSections([...sections, data[0]]);
      }
    } catch (error) {
      console.error("Error adding section:", error);
      toast.error("Bölüm eklenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };
  
  // Delete section handler
  const deleteSection = async (sectionId: string, sectionKey: string) => {
    setSaving(true);
    try {
      // First check if this is a custom section (non-default section)
      if (!sectionKey.startsWith('custom_section_')) {
        toast.error("Varsayılan bölümler silinemez");
        setSaving(false);
        return;
      }
      
      // Delete related features first (cascade doesn't work in supabase client)
      const { error: featuresError } = await supabase
        .from('about_features')
        .delete()
        .eq('section_key', sectionKey);
        
      if (featuresError) throw featuresError;
      
      // Then delete the section
      const { error: sectionError } = await supabase
        .from('about_sections')
        .delete()
        .eq('id', sectionId);
        
      if (sectionError) throw sectionError;
      
      toast.success("Bölüm başarıyla silindi");
      
      // Update local state
      setSections(sections.filter(s => s.id !== sectionId));
      setFeatures(features.filter(f => f.section_key !== sectionKey));
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Bölüm silinirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2 text-lg">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hakkımızda Sayfası Yönetimi</h1>
        <Button onClick={addSection}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Bölüm Ekle
        </Button>
      </div>
      
      <Tabs defaultValue="sections">
        <TabsList className="mb-4">
          <TabsTrigger value="sections">Bölümler</TabsTrigger>
          <TabsTrigger value="features">Özellikler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sections" className="space-y-4">
          <SectionManager 
            sections={sections}
            setSections={setSections}
            updateSection={updateSection}
            deleteSection={deleteSection}
            addFeature={addFeature}
            saving={saving}
          />
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4">
          <FeatureManager 
            sections={sections}
            features={features}
            setFeatures={setFeatures}
            updateFeature={updateFeature}
            deleteFeature={deleteFeature}
            addFeature={addFeature}
            saving={saving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAboutContent;
