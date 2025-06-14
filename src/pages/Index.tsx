import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "../components/Layout";
import HeroSectionOptimized from "../components/HeroSectionOptimized";
import StoryRingContainer from "../components/StoryRingContainer";
import FeaturedJerseys from "../components/FeaturedJerseys";
import PopularJerseys from "../components/PopularJerseys";
import LatestJerseys from "../components/LatestJerseys";
import FeaturesSection from "../components/FeaturesSection";
import CallToInfo from "../components/CallToInfo";
import HomeSection from "../components/home/HomeSection";
import CustomerReferences from "../components/CustomerReferences";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { HomepageSection, HomepageFeature } from "@/hooks/use-homepage-content";

interface SEOSettings {
  id: string;
  site_title?: string;
  site_description?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
}

const Index: React.FC = () => {
  const { t, language } = useLanguage();
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [features, setFeatures] = useState<HomepageFeature[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch SEO settings
        const { data: seoData, error: seoError } = await supabase
          .from("seo_settings")
          .select("*")
          .eq("id", "homepage")
          .single();
          
        if (seoError && seoError.code !== 'PGRST116') {
          console.error("Error fetching SEO settings:", seoError);
        } else if (seoData) {
          setSeoSettings(seoData);
        }
        
        // Fetch homepage sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from("homepage_sections")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });
          
        if (sectionsError) {
          console.error("Error fetching homepage sections:", sectionsError);
        } else {
          setSections(sectionsData || []);
          
          // Check if features section exists in the database
          const featuresSection = (sectionsData || []).find(section => section.section_key === 'features');
          
          // If features section doesn't exist, create it
          if (!featuresSection) {
            try {
              const { data: newSection, error: insertError } = await supabase
                .from("homepage_sections")
                .insert({
                  section_key: "features",
                  title_tr: "Neden Bizi Tercih Etmelisiniz",
                  title_en: "Why Choose Us",
                  description_tr: "Toptancılar için özel olarak tasarlanmış premium hizmetlerimiz ve avantajlarımız.",
                  description_en: "Our premium services and advantages specially designed for wholesalers.",
                  display_order: 30,
                  is_active: true
                })
                .select()
                .single();
                
              if (insertError) {
                console.error("Error creating features section:", insertError);
              } else if (newSection) {
                setSections(prev => [...prev, newSection]);
                console.log("Created features section:", newSection);
              }
            } catch (error) {
              console.error("Failed to create features section:", error);
            }
          }
          
          // Check if customer references section exists in the database
          const referencesSection = (sectionsData || []).find(section => section.section_key === 'references');
          
          // If references section doesn't exist, create it
          if (!referencesSection) {
            try {
              const { data: newSection, error: insertError } = await supabase
                .from("homepage_sections")
                .insert({
                  section_key: "references",
                  title_tr: "Sizden Gelenler",
                  title_en: "Customer References",
                  description_tr: "Müşterilerimizin memnuniyetleri ve geri bildirimleri bizim için çok değerli.",
                  description_en: "Our customers' satisfaction and feedback are valuable to us.",
                  display_order: 35,
                  is_active: true
                })
                .select()
                .single();
                
              if (insertError) {
                console.error("Error creating references section:", insertError);
              } else if (newSection) {
                setSections(prev => [...prev, newSection]);
                console.log("Created references section:", newSection);
              }
            } catch (error) {
              console.error("Failed to create references section:", error);
            }
          }
        }
        
        // Fetch homepage features
        const { data: featuresData, error: featuresError } = await supabase
          .from("homepage_features")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });
          
        if (featuresError) {
          console.error("Error fetching homepage features:", featuresError);
        } else {
          setFeatures(featuresData || []);
          
          // Check if we need to create default features
          const defaultFeatures = [
            {
              section_key: "features",
              title_tr: "Özel Tasarım",
              title_en: "Custom Design",
              description_tr: "Kendi özel tasarımınızı oluşturun veya profesyonel tasarımcılarımızla çalışın.",
              description_en: "Create your own custom design or work with our professional designers.",
              display_order: 0,
              is_active: true,
              link: null
            },
            {
              section_key: "features",
              title_tr: "Hızlı Teslimat",
              title_en: "Fast Delivery",
              description_tr: "Siparişlerinizi en hızlı şekilde hazırlayıp kapınıza kadar gönderiyoruz.",
              description_en: "We prepare your orders as quickly as possible and deliver them to your door.",
              display_order: 1,
              is_active: true,
              link: null
            },
            {
              section_key: "features",
              title_tr: "Premium Kalite",
              title_en: "Premium Quality",
              description_tr: "En kaliteli kumaşları ve baskı tekniklerini kullanıyoruz.",
              description_en: "We use the highest quality fabrics and printing techniques.",
              display_order: 2,
              is_active: true,
              link: null
            },
            {
              section_key: "features",
              title_tr: "Takım Siparişleri",
              title_en: "Team Orders",
              description_tr: "Tüm takım üyeleriniz için özelleştirilmiş formalar.",
              description_en: "Customized jerseys for all your team members.",
              display_order: 3,
              is_active: true,
              link: null
            },
            {
              section_key: "features",
              title_tr: "Hızlı Kurulum",
              title_en: "Quick Setup",
              description_tr: "Kolay ve hızlı tasarım süreci ile vakit kaybetmeyin.",
              description_en: "Don't waste time with our easy and fast design process.",
              display_order: 4,
              is_active: true,
              link: null
            },
            {
              section_key: "features",
              title_tr: "Toptan Fiyatlandırma",
              title_en: "Wholesale Pricing",
              description_tr: "Toptancılar için özel indirimli fiyatlar sunuyoruz.",
              description_en: "We offer special discounted prices for wholesalers.",
              display_order: 5,
              is_active: true,
              link: null
            }
          ];
          
          // If no features for the features section exist, create them
          const featuresForFeaturesSection = featuresData?.filter(f => f.section_key === 'features') || [];
          if (featuresForFeaturesSection.length === 0) {
            try {
              const { data: newFeatures, error: featuresInsertError } = await supabase
                .from("homepage_features")
                .insert(defaultFeatures)
                .select();
                
              if (featuresInsertError) {
                console.error("Error creating default features:", featuresInsertError);
              } else if (newFeatures) {
                setFeatures(prev => [...prev, ...newFeatures]);
                console.log("Created default features:", newFeatures);
              }
            } catch (error) {
              console.error("Failed to create default features:", error);
            }
          }
          
          // Check if we need to create default customer references
          const referencesForSection = featuresData?.filter(f => f.section_key === 'references') || [];
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
                
              if (referencesInsertError) {
                console.error("Error creating default references:", referencesInsertError);
              } else if (newReferences) {
                setFeatures(prev => [...prev, ...newReferences]);
                console.log("Created default references:", newReferences);
              }
            } catch (error) {
              console.error("Failed to create default references:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error in homepage data fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Use SEO settings from database if available, otherwise fallback to defaults
  const metaTitle = seoSettings?.meta_title || (language === 'tr' 
    ? "FormaYaptırma | Özel Forma Tasarımı ve Üretimi" 
    : "FormaYaptırma | Custom Jersey Design and Production");
  
  const metaDescription = seoSettings?.meta_description || (language === 'tr'
    ? "Spor takımları için özel tasarım formalar. Futbol, basketbol ve diğer spor dalları için profesyonel formalar tasarlayın ve ürettirin."
    : "Custom designed jerseys for sports teams. Design and order professional jerseys for football, basketball and other sports.");
  
  const metaKeywords = seoSettings?.keywords || (language === 'tr'
    ? "özel forma, forma tasarımı, takım forması, spor forması, futbol forması, basketbol forması, forma üretimi"
    : "custom jersey, jersey design, team jersey, sports jersey, football jersey, basketball jersey, jersey production");
  
  const canonicalUrl = language === 'tr' 
    ? "https://formayaptirma.com/" 
    : "https://formayaptirma.com/en/";

  // Find the references section and features for the CustomerReferences component
  const referencesSection = sections.find(section => section.section_key === 'references');
  const referencesFeatures = features.filter(feature => feature.section_key === 'references');

  return (
    <Layout>
      <Helmet>
        <html lang={language === 'tr' ? 'tr' : 'en'} />
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://formayaptirma.com/images/og-home-image.jpg" />
        <meta property="og:image:alt" content={language === 'tr' ? "FormaYaptırma Özel Formalar" : "FormaYaptırma Custom Jerseys"} />
        <meta property="og:site_name" content="FormaYaptırma" />
        <meta property="og:locale" content={language === 'tr' ? 'tr_TR' : 'en_US'} />
        <meta property="og:locale:alternate" content={language === 'tr' ? 'en_US' : 'tr_TR'} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://formayaptirma.com/images/twitter-home-image.jpg" />
        <meta name="twitter:site" content="@formayaptirma" />
        
        {/* Structured Data for Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "FormaYaptırma",
            "url": "https://formayaptirma.com",
            "logo": "https://formayaptirma.com/images/logo.png",
            "sameAs": [
              "https://facebook.com/formayaptirma",
              "https://twitter.com/formayaptirma",
              "https://instagram.com/formayaptirma"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+90-555-123-4567",
              "contactType": "customer service",
              "availableLanguage": ["Turkish", "English"]
            }
          })}
        </script>
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="FormaYaptırma" />
      </Helmet>

      <HeroSectionOptimized />
      <StoryRingContainer />
      
      {!loading && sections.map((section) => {
        // Skip rendering the features and references sections here, they have their own dedicated components
        if (section.section_key === 'features' || section.section_key === 'references') return null;
        
        const sectionFeatures = features.filter(f => f.section_key === section.section_key);
        return (
          <HomeSection 
            key={section.id}
            section={section}
            features={sectionFeatures}
          />
        );
      })}
      
      <FeaturedJerseys />
      <PopularJerseys />
      <LatestJerseys />
      <CustomerReferences section={referencesSection} features={referencesFeatures} />
      <FeaturesSection />
      <CallToInfo />
    </Layout>
  );
};

export default Index;
