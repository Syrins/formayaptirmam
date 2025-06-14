import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

export interface HomepageSection {
  id: string;
  section_key: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageFeature {
  id: string;
  section_key: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  image_url: string | null;
  link: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useHomepageContent = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [features, setFeatures] = useState<HomepageFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  // Fetch all homepage sections and features
  const fetchHomepageContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch homepage sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (sectionsError) throw sectionsError;
      
      // Fetch homepage features
      const { data: featuresData, error: featuresError } = await supabase
        .from("homepage_features")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (featuresError) throw featuresError;

      setSections(sectionsData || []);
      
      // Process features to ensure they have the link property
      const processedFeatures = (featuresData || []).map(feature => ({
        ...feature,
        link: feature.link || null
      })) as HomepageFeature[];

      setFeatures(processedFeatures);
      
      // Check if we need to create default features
      const referencesForSection = processedFeatures.filter(f => f.section_key === 'references');
      if (referencesForSection.length === 0) {
        try {
          const defaultReferences = [
            {
              section_key: "references",
              title_tr: "Ali Yılmaz",
              title_en: "Ali Yilmaz",
              description_tr: "FormaYaptırma ile çalışmak harika bir deneyimdi. Formalarımız tam istediğimiz gibi oldu.",
              description_en: "Working with FormaYaptirma was a great experience. Our jerseys turned out exactly as we wanted.",
              display_order: 0,
              is_active: true,
              link: null
            },
            {
              section_key: "references",
              title_tr: "Ayşe Kaya",
              title_en: "Ayse Kaya",
              description_tr: "Kaliteli kumaş ve uygun fiyatlarla harika hizmet aldık. Kesinlikle tavsiye ediyorum.",
              description_en: "We received great service with quality fabric and reasonable prices. Highly recommended.",
              display_order: 1,
              is_active: true,
              link: null
            },
            {
              section_key: "references",
              title_tr: "Mehmet Demir",
              title_en: "Mehmet Demir",
              description_tr: "Takımımız için özel tasarladığımız formalar çok beğenildi. Teşekkürler!",
              description_en: "The jerseys we designed for our team were very popular. Thank you!",
              display_order: 2,
              is_active: true,
              link: null
            },
            {
              section_key: "references",
              title_tr: "Zeynep Öztürk",
              title_en: "Zeynep Ozturk",
              description_tr: "Hızlı teslimat ve mükemmel müşteri hizmeti. Tekrar çalışacağız.",
              description_en: "Fast delivery and excellent customer service. We will work together again.",
              display_order: 3,
              is_active: true,
              link: null
            },
            {
              section_key: "references",
              title_tr: "Osman Yıldız",
              title_en: "Osman Yildiz",
              description_tr: "Çok profesyonel bir ekip. Siparişimiz zamanında ve kusursuz teslim edildi.",
              description_en: "Very professional team. Our order was delivered on time and flawlessly.",
              display_order: 4,
              is_active: true,
              link: null
            },
            {
              section_key: "references",
              title_tr: "Selin Kara",
              title_en: "Selin Kara",
              description_tr: "Forma tasarım sürecinde verdikleri destek için çok teşekkürler. Harika iş çıkardılar.",
              description_en: "Thank you for your support during the jersey design process. They did a great job.",
              display_order: 5,
              is_active: true,
              link: null
            }
          ];
          
          const { data: newReferences, error: referencesInsertError } = await supabase
            .from("homepage_features")
            .insert(defaultReferences)
            .select();
            
          if (referencesInsertError) throw referencesInsertError;
          if (newReferences) {
            setFeatures(prev => [...prev, ...newReferences]);
            console.log("Created default references:", newReferences);
          }
        } catch (error) {
          console.error("Failed to create default references:", error);
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch homepage content");
      toast.error("İçerik yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Add a new section
  const addSection = async () => {
    setSaving(true);
    
    try {
      const newSectionKey = `section_${Date.now()}`;
      const displayOrder = sections.length > 0 
        ? Math.max(...sections.map(s => s.display_order)) + 1 
        : 0;
      
      const newSection = {
        section_key: newSectionKey,
        title_tr: "Yeni Bölüm",
        title_en: "New Section",
        description_tr: "Bölüm açıklaması buraya gelecek",
        description_en: "Section description goes here",
        image_url: null,
        display_order: displayOrder,
        is_active: true
      };
      
      const { data, error } = await supabase
        .from("homepage_sections")
        .insert(newSection)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Yeni bölüm eklendi");
      setSections(prev => [...prev, data]);
    } catch (error: any) {
      toast.error(error.message || "Bölüm eklenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Update a section
  const updateSection = async (section: HomepageSection) => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("homepage_sections")
        .update({
          title_tr: section.title_tr,
          title_en: section.title_en,
          description_tr: section.description_tr,
          description_en: section.description_en,
          image_url: section.image_url,
          is_active: section.is_active,
          display_order: section.display_order,
          updated_at: new Date().toISOString()
        })
        .eq("id", section.id);
      
      if (error) throw error;
      
      toast.success("Bölüm güncellendi");
      setSections(prev => prev.map(s => s.id === section.id ? section : s));
    } catch (error: any) {
      toast.error(error.message || "Bölüm güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Delete a section
  const deleteSection = async (sectionId: string, sectionKey: string) => {
    setSaving(true);
    
    try {
      // First delete associated features
      const { error: featuresError } = await supabase
        .from("homepage_features")
        .delete()
        .eq("section_key", sectionKey);
        
      if (featuresError) throw featuresError;
      
      // Then delete the section
      const { error: sectionError } = await supabase
        .from("homepage_sections")
        .delete()
        .eq("id", sectionId);
      
      if (sectionError) throw sectionError;
      
      toast.success("Bölüm silindi");
      setSections(prev => prev.filter(s => s.id !== sectionId));
      setFeatures(prev => prev.filter(f => f.section_key !== sectionKey));
    } catch (error: any) {
      toast.error(error.message || "Bölüm silinirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Add a feature to a section
  const addFeature = async (sectionKey: string) => {
    setSaving(true);
    
    try {
      const sectionFeatures = features.filter(f => f.section_key === sectionKey);
      const displayOrder = sectionFeatures.length > 0
        ? Math.max(...sectionFeatures.map(f => f.display_order)) + 1
        : 0;
      
      const newFeature = {
        section_key: sectionKey,
        title_tr: "Yeni Özellik",
        title_en: "New Feature",
        description_tr: "Özellik açıklaması buraya gelecek",
        description_en: "Feature description goes here",
        image_url: null,
        link: null,
        display_order: displayOrder,
        is_active: true
      };
      
      const { data, error } = await supabase
        .from("homepage_features")
        .insert(newFeature)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Yeni özellik eklendi");
      setFeatures(prev => [...prev, data]);
    } catch (error: any) {
      toast.error(error.message || "Özellik eklenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Update a feature
  const updateFeature = async (feature: HomepageFeature) => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("homepage_features")
        .update({
          title_tr: feature.title_tr,
          title_en: feature.title_en,
          description_tr: feature.description_tr,
          description_en: feature.description_en,
          image_url: feature.image_url,
          link: feature.link,
          is_active: feature.is_active,
          display_order: feature.display_order,
          updated_at: new Date().toISOString()
        })
        .eq("id", feature.id);
      
      if (error) throw error;
      
      toast.success("Özellik güncellendi");
      setFeatures(prev => prev.map(f => f.id === feature.id ? feature : f));
    } catch (error: any) {
      toast.error(error.message || "Özellik güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Delete a feature
  const deleteFeature = async (featureId: string) => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("homepage_features")
        .delete()
        .eq("id", featureId);
      
      if (error) throw error;
      
      toast.success("Özellik silindi");
      setFeatures(prev => prev.filter(f => f.id !== featureId));
    } catch (error: any) {
      toast.error(error.message || "Özellik silinirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchHomepageContent();
  }, []);

  return {
    sections,
    features,
    loading,
    saving,
    error,
    language,
    setSections,
    setFeatures,
    fetchHomepageContent,
    addSection,
    updateSection,
    deleteSection,
    addFeature,
    updateFeature,
    deleteFeature
  };
};
