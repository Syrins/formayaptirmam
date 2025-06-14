import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import React from 'react';

export interface AboutSection {
  id: string;
  section_key: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string;
  features?: AboutFeature[];
}

export interface AboutFeature {
  id: string;
  section_key: string;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

export const useAboutContent = () => {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const mountedRef = React.useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchAboutContent = async (): Promise<void> => {
      try {
        if (!mountedRef.current) return;
        setLoading(true);
        
        // Fetch sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('about_sections')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (sectionsError) throw sectionsError;
        
        if (!sectionsData || sectionsData.length === 0) {
          if (mountedRef.current) {
            setLoading(false);
          }
          return;
        }
        
        // Fetch features for all sections
        const { data: featuresData, error: featuresError } = await supabase
          .from('about_features')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
          
        if (featuresError) throw featuresError;

        if (mountedRef.current) {
          // Map features to their respective sections
          const sectionsWithFeatures = sectionsData.map(section => ({
            ...section,
            features: featuresData?.filter(feature => feature.section_key === section.section_key) || []
          }));

          setSections(sectionsWithFeatures);
          setLoading(false);
        }
      } catch (error) {
        if (mountedRef.current) {
          console.error('Error fetching about content:', error);
          toast({
            title: language === 'tr' ? 'Hata' : 'Error',
            description: language === 'tr' 
              ? 'İçerik yüklenirken bir hata oluştu'
              : 'Error loading content',
            variant: 'destructive'
          });
          setLoading(false);
        }
      }
    };

    fetchAboutContent();

    return () => {
      mountedRef.current = false;
    };
  }, [toast, language]);

  return {
    sections,
    loading
  };
};
