import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Translation } from '@/types/blog';
import { toast } from 'sonner';

type Language = 'tr' | 'en';

type Translations = {
  [key: string]: {
    tr: string;
    en: string;
  };
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isLoaded: boolean;
  translateAndSave: (key: string, textTr: string, textEn?: string) => Promise<boolean>;
  bulkTranslateAndSave: (items: {key: string, textTr: string, textEn?: string}[]) => Promise<number>;
  refreshTranslations: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check if a language preference is stored in localStorage
    const storedLanguage = localStorage.getItem('language') as Language;
    return storedLanguage || 'tr'; // Default to Turkish
  });
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch translations from the database
  const fetchTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*');
      
      if (error) {
        console.error("Error fetching translations:", error);
        return;
      }
      
      const translationsMap: Translations = {};
      (data as Translation[])?.forEach(item => {
        translationsMap[item.key] = {
          tr: item.tr || item.key,
          en: item.en || item.key
        };
      });
      
      setTranslations(translationsMap);
    } catch (error) {
      console.error("Failed to fetch translations:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  // Refresh translations from the database
  const refreshTranslations = async () => {
    setIsLoaded(false);
    await fetchTranslations();
    toast.success(language === 'tr' ? 'Çeviriler güncellendi' : 'Translations updated');
  };

  // Translate text and save to database
  const translateAndSave = async (key: string, textTr: string, textEn?: string): Promise<boolean> => {
    try {
      // If translation already exists, update it
      if (translations[key]) {
        const { error } = await supabase
          .from('translations')
          .update({
            tr: textTr,
            en: textEn || await autoTranslate(textTr, 'tr', 'en')
          })
          .eq('key', key);
          
        if (error) throw error;
      } else {
        // Otherwise, insert a new translation
        const { error } = await supabase
          .from('translations')
          .insert({
            key,
            tr: textTr,
            en: textEn || await autoTranslate(textTr, 'tr', 'en')
          });
          
        if (error) throw error;
      }
      
      // Refresh translations after saving
      await fetchTranslations();
      return true;
    } catch (error) {
      console.error("Error saving translation:", error);
      toast.error(language === 'tr' ? 'Çeviri kaydedilirken hata oluştu' : 'Error saving translation');
      return false;
    }
  };
  
  // Bulk translate and save
  const bulkTranslateAndSave = async (items: {key: string, textTr: string, textEn?: string}[]): Promise<number> => {
    let successCount = 0;
    
    try {
      for (const item of items) {
        // For items without English translation, automatically translate
        if (!item.textEn) {
          item.textEn = await autoTranslate(item.textTr, 'tr', 'en');
        }
      }
      
      // Use upsert to insert or update in bulk
      const { error, data } = await supabase
        .from('translations')
        .upsert(
          items.map(item => ({
            key: item.key,
            tr: item.textTr,
            en: item.textEn
          })),
          { onConflict: 'key' }
        );
        
      if (error) throw error;
      
      successCount = items.length;
      // Refresh translations after saving
      await fetchTranslations();
      
      toast.success(
        language === 'tr' 
          ? `${successCount} çeviri başarıyla kaydedildi` 
          : `${successCount} translations successfully saved`
      );
    } catch (error) {
      console.error("Error bulk saving translations:", error);
      toast.error(
        language === 'tr' 
          ? 'Çeviriler kaydedilirken hata oluştu' 
          : 'Error saving translations'
      );
    }
    
    return successCount;
  };

  // Auto-translate function using simple dictionary
  // In a production app, you might want to use a translation API
  const autoTranslate = async (text: string, from: Language, to: Language): Promise<string> => {
    if (!text) return '';
    
    // Simple dictionary for common translations
    const dictionary: Record<string, Record<string, string>> = {
      tr: {
        // Navigation
        'Anasayfa': 'Home',
        'Galeri': 'Gallery',
        'Tasarla': 'Design',
        'Blog': 'Blog',
        'Hakkımızda': 'About Us',
        'İletişim': 'Contact',
        
        // Common UI elements
        'Yükleniyor': 'Loading',
        'Gönder': 'Submit',
        'İptal': 'Cancel',
        'Kaydet': 'Save',
        'Sil': 'Delete',
        'Düzenle': 'Edit',
        'Ekle': 'Add',
        
        // Product related
        'Formalar': 'Jerseys',
        'En Popüler Formalar': 'Most Popular Jerseys',
        'Yeni Formalar': 'New Jerseys',
        'Öne Çıkan Formalar': 'Featured Jerseys',
        'Tümünü Gör': 'View All',
        'Hemen Satın Al': 'Buy Now',
        'Min. Sipariş': 'Min. Order',
        'Adet': 'Pieces',
        'Renk': 'Color',
        'Renkler': 'Colors',
        'Parça Başına': 'Per Piece',
        
        // Filter related
        'Filtreler': 'Filters',
        'Filtreleri Sıfırla': 'Reset Filters',
        'Forma Tipi': 'Jersey Type',
        'Fiyat Aralığı': 'Price Range',
        'Minimum Sipariş': 'Minimum Order',
        'Yeni Gelenler': 'New Arrivals',
        'Popüler Ürünler': 'Popular Items',
        'Tüm Tipler': 'All Types',
        'Tümü': 'Any',
        
        // Call to action
        'Özel Formanızı Tasarlayın': 'Design Your Custom Jersey',
        'Tasarlamaya Başla': 'Start Designing',
        'Bizimle İletişime Geç': 'Contact Us',
        
        // Common sections
        'Neden Bizi Tercih Etmelisiniz': 'Why Choose Us',
        'Özel Tasarım': 'Custom Design',
        'Hızlı Teslimat': 'Fast Delivery',
        'Premium Kalite': 'Premium Quality',
        'Takım Siparişleri': 'Team Orders',
        
        // Errors
        'Hata': 'Error',
        'Ürünler yüklenirken hata oluştu': 'Error loading products',
        'Hiç ürün bulunamadı': 'No products found',
        'Sayfa bulunamadı': 'Page not found',
        
        // Footer
        'Tüm Hakları Saklıdır': 'All Rights Reserved',
        'Gizlilik Politikası': 'Privacy Policy',
        'Kullanım Koşulları': 'Terms of Use',
      }
    };
    
    // For English to Turkish, we swap key-value
    const enToTrDictionary: Record<string, string> = {};
    Object.entries(dictionary.tr).forEach(([tr, en]) => {
      enToTrDictionary[en] = tr;
    });
    
    if (from === 'tr' && to === 'en') {
      // Translating Turkish to English
      return dictionary.tr[text] || text;
    } else if (from === 'en' && to === 'tr') {
      // Translating English to Turkish
      return enToTrDictionary[text] || text;
    }
    
    return text;
  };

  const t = (key: string, params?: Record<string, any>): string => {
    // If translations are not loaded yet or the key doesn't exist, return the key
    if (!translations[key]) return key;
    
    // Get the base translation for the current language
    let translated = translations[key][language] || key;
    
    // If params are provided, replace placeholders in the translation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translated = translated.replace(`{{${paramKey}}}`, String(paramValue));
      });
    }
    
    return translated;
  };

  // Store language preference in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      isLoaded, 
      translateAndSave,
      bulkTranslateAndSave,
      refreshTranslations 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
