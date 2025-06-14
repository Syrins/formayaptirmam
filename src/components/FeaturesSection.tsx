
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Palette, Truck, Award, Users, Zap, BadgeCheck } from "lucide-react";
import { HomepageSection, HomepageFeature } from "@/hooks/use-homepage-content";
import { supabase } from "@/integrations/supabase/client";

interface FeatureWithIcon {
  feature: HomepageFeature;
  icon: React.ReactNode;
}

const FeaturesSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [section, setSection] = useState<HomepageSection | null>(null);
  const [features, setFeatures] = useState<FeatureWithIcon[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Fetch section data
        const { data: sectionData, error: sectionError } = await supabase
          .from('homepage_sections')
          .select('*')
          .eq('section_key', 'features')
          .single();
          
        if (sectionError && sectionError.code !== 'PGRST116') {
          console.error("Error fetching features section:", sectionError);
        } else if (sectionData) {
          setSection(sectionData);
        }
        
        // Fetch features
        const { data: featuresData, error: featuresError } = await supabase
          .from('homepage_features')
          .select('*')
          .eq('section_key', 'features')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (featuresError) {
          console.error("Error fetching features:", featuresError);
        } else {
          // Map features to include icons and ensure they have the link property
          const featuresWithIcons = (featuresData || []).map(feature => {
            // Ensure feature has the link property
            const processedFeature = {
              ...feature,
              link: (feature as any).link || null
            } as HomepageFeature;
            
            let icon;
            
            // Determine icon based on some logic (e.g., feature title or a specific field)
            const featureId = processedFeature.id.toLowerCase();
            
            if (featureId.includes("custom_design") || processedFeature.title_en.toLowerCase().includes("custom design")) {
              icon = <Palette className="h-10 w-10 text-primary" />;
            } else if (featureId.includes("delivery") || processedFeature.title_en.toLowerCase().includes("delivery")) {
              icon = <Truck className="h-10 w-10 text-primary" />;
            } else if (featureId.includes("quality") || processedFeature.title_en.toLowerCase().includes("quality")) {
              icon = <Award className="h-10 w-10 text-primary" />;
            } else if (featureId.includes("team") || processedFeature.title_en.toLowerCase().includes("team")) {
              icon = <Users className="h-10 w-10 text-primary" />;
            } else if (featureId.includes("setup") || processedFeature.title_en.toLowerCase().includes("setup")) {
              icon = <Zap className="h-10 w-10 text-primary" />;
            } else if (featureId.includes("wholesale") || processedFeature.title_en.toLowerCase().includes("wholesale")) {
              icon = <BadgeCheck className="h-10 w-10 text-primary" />;
            } else {
              // Default icon
              icon = <Award className="h-10 w-10 text-primary" />;
            }
            
            return {
              feature: processedFeature,
              icon
            };
          });
          
          setFeatures(featuresWithIcons);
        }
      } catch (error) {
        console.error("Error in features section data fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Get title and description based on current language
  const title = section 
    ? (language === 'tr' ? section.title_tr : section.title_en) 
    : t("features_title") || "Neden Bizi Tercih Etmelisiniz";
    
  const description = section 
    ? (language === 'tr' ? section.description_tr : section.description_en) 
    : t("features_description") || "Toptancılar için özel olarak tasarlanmış premium hizmetlerimiz ve avantajlarımız.";

  // Fallback features if none are found in the database
  const fallbackFeatures = [
    {
      feature: {
        id: "custom_design",
        title_tr: t("custom_design") || "Özel Tasarım",
        title_en: "Custom Design",
        description_tr: t("custom_design_description") || "Kendi özel tasarımınızı oluşturun veya profesyonel tasarımcılarımızla çalışın.",
        description_en: "Create your own custom design or work with our professional designers.",
        section_key: "features",
        image_url: null,
        link: null,
        display_order: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      icon: <Palette className="h-10 w-10 text-primary" />
    },
    {
      feature: {
        id: "fast_delivery",
        title_tr: t("fast_delivery") || "Hızlı Teslimat",
        title_en: "Fast Delivery",
        description_tr: t("fast_delivery_description") || "Siparişlerinizi en hızlı şekilde hazırlayıp kapınıza kadar gönderiyoruz.",
        description_en: "We prepare your orders as quickly as possible and deliver them to your door.",
        section_key: "features",
        image_url: null,
        link: null,
        display_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      icon: <Truck className="h-10 w-10 text-primary" />
    },
    {
      feature: {
        id: "premium_quality",
        title_tr: t("premium_quality") || "Premium Kalite",
        title_en: "Premium Quality",
        description_tr: t("premium_quality_description") || "En kaliteli kumaşları ve baskı tekniklerini kullanıyoruz.",
        description_en: "We use the highest quality fabrics and printing techniques.",
        section_key: "features",
        image_url: null,
        link: null,
        display_order: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      icon: <Award className="h-10 w-10 text-primary" />
    },
    {
      feature: {
        id: "team_orders",
        title_tr: t("team_orders") || "Takım Siparişleri",
        title_en: "Team Orders",
        description_tr: t("team_orders_description") || "Tüm takım üyeleriniz için özelleştirilmiş formalar.",
        description_en: "Customized jerseys for all your team members.",
        section_key: "features",
        image_url: null,
        link: null,
        display_order: 3,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      icon: <Users className="h-10 w-10 text-primary" />
    },
    {
      feature: {
        id: "quick_setup",
        title_tr: t("quick_setup") || "Hızlı Kurulum",
        title_en: "Quick Setup",
        description_tr: t("quick_setup_description") || "Kolay ve hızlı tasarım süreci ile vakit kaybetmeyin.",
        description_en: "Don't waste time with our easy and fast design process.",
        section_key: "features",
        image_url: null,
        link: null,
        display_order: 4,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      icon: <Zap className="h-10 w-10 text-primary" />
    },
    {
      feature: {
        id: "wholesale_pricing",
        title_tr: t("wholesale_pricing") || "Toptan Fiyatlandırma",
        title_en: "Wholesale Pricing",
        description_tr: t("wholesale_pricing_description") || "Toptancılar için özel indirimli fiyatlar sunuyoruz.",
        description_en: "We offer special discounted prices for wholesalers.",
        section_key: "features",
        image_url: null,
        link: null,
        display_order: 5,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      icon: <BadgeCheck className="h-10 w-10 text-primary" />
    }
  ];
  
  // Use features from database or fallback if none found
  const displayFeatures = features.length > 0 ? features : fallbackFeatures;

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {loading ? (
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mx-auto w-1/2"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mx-auto w-3/4"></div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {description}
              </p>
            </>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFeatures.map((item, index) => {
            const featureTitle = language === 'tr' ? item.feature.title_tr : item.feature.title_en;
            const featureDescription = language === 'tr' ? item.feature.description_tr : item.feature.description_en;
            
            return (
              <div 
                key={item.feature.id || index}
                className="p-6 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{featureTitle}</h3>
                <p className="text-gray-600 dark:text-gray-300">{featureDescription}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
