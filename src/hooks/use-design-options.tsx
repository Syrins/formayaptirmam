
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

export type DesignOption = {
  id: string;
  type: string;
  name: string;
  name_tr: string;
  value: string;
  is_active: boolean;
  display_order: number;
  displayName?: string; // Add the displayName property
};

export type DesignTemplate = {
  id: string;
  name: string;
  name_tr: string;
  type: string;
  model_url?: string;
  texture_url?: string;
  preview_url: string;
  is_active: boolean;
  display_order: number;
};

export const useDesignOptions = (type: string) => {
  const [options, setOptions] = useState<DesignOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('design_options')
          .select('*')
          .eq('type', type)
          .eq('is_active', true)
          .order('display_order');

        if (error) throw new Error(error.message);
        
        setOptions(data || []);
      } catch (error) {
        console.error(`Error fetching ${type} options:`, error);
        setError(error instanceof Error ? error : new Error(String(error)));
        
        toast({
          title: t("error") || "Error",
          description: t("error_fetching_options") || `Error fetching ${type} options`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [type, toast, t]);

  // Format options for display based on current language
  const formattedOptions = options.map(option => ({
    ...option,
    displayName: language === 'tr' ? option.name_tr : option.name
  }));

  return {
    options: formattedOptions,
    loading,
    error
  };
};

export const useDesignTemplates = () => {
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('design_templates')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw new Error(error.message);
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching design templates:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      
      toast({
        title: t("error") || "Error",
        description: t("error_fetching_templates") || `Error fetching design templates`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [t]);

  return {
    templates,
    loading,
    error,
    refreshTemplates: fetchTemplates
  };
};
