import React, { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import SafeImage from "@/components/SafeImage";

// Lazy load the 3D model component to improve initial load
const DeferredModel = lazy(() => import("./DeferredModel"));

interface HeroContent {
  title_tr?: string;
  title_en?: string;
  description_tr?: string;
  description_en?: string;
  customer_count?: number;
  rating_value?: number;
  rating_count?: number;
  show_ratings?: boolean;
}

// Fallback content to prevent layout shift
const FALLBACK_CONTENT: HeroContent = {
  title_tr: "Takımına Özel Forma Yaptırma",
  title_en: "Custom Team Jersey Creation",
  description_tr: "Siz istediğiniz formayı hayal edin, biz sizler için özel olarak üretelim. Kaliteli kumaş, profesyonel tasarım.",
  description_en: "Design your dream jersey, we'll create it specially for you. Quality fabric, professional design.",
  customer_count: 2000,
  rating_value: 4.9,
  rating_count: 5,
  show_ratings: true
};

const HeroSectionOptimized: React.FC = () => {
  const { t, language } = useLanguage();
  const [content, setContent] = useState<HeroContent>(FALLBACK_CONTENT);
  const [showModel, setShowModel] = useState(false);
  
  // Use intersection observer to load 3D model only when needed
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModel(true);
    }, 2000); // Delay 3D model loading by 2 seconds to improve LCP
    
    return () => clearTimeout(timer);
  }, []);
  
  // Load hero content asynchronously without blocking render
  useEffect(() => {
    const loadContent = async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase
          .from("homepage_content")
          .select("*")
          .eq("section", "hero")
          .single();
        
        if (data) {
          setContent(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Error loading hero content:", error);
        // Keep fallback content on error
      }
    };
    
    // Load content after a small delay to prioritize initial render
    const timer = setTimeout(loadContent, 100);
    return () => clearTimeout(timer);
  }, []);

  const title = language === "tr" ? content.title_tr : content.title_en;
  const description = language === "tr" ? content.description_tr : content.description_en;
  const whatsappLink = "https://wa.me/905543428442";

  const profileImages = [
    "https://lh3.googleusercontent.com/a-/ALV-UjUJZI0913EvwBZLcBpzt-5n3SuVOeguBY3dJRsxMXOmIE2pXISu=s120-c-rp-mo-br100",
    "https://lh3.googleusercontent.com/a-/ALV-UjXg4zWa0wCnfcFDMFRRnfqtJ2X_uwPc4MZCeIrtRU4Ygv3kThcl=s120-c-rp-mo-br100",
    "https://lh3.googleusercontent.com/a-/ALV-UjU7MqiQMJWbikumzamS4RzKy85rjebBObphBrMwYT872sP97ow=s120-c-rp-mo-br100",
    "https://lh3.googleusercontent.com/a-/ALV-UjWgiePys3809FuU_zTDtfxBjf871PIN7jPhScN4P2l-hhW913E7=s120-c-rp-mo-ba2-br100",
  ];

  return (
    <section className="hero-container relative pt-16 md:pt-28 pb-12 md:pb-20 overflow-hidden">
      {/* Simplified background without expensive animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">
          {/* Text content - prioritized for LCP */}
          <div className="order-2 lg:order-1 text-left space-y-6">
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 leading-tight"
              style={{ viewTransitionName: "hero-title" }}
            >
              {title}
            </h1>
            
            <div 
              className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl leading-relaxed"
              style={{ viewTransitionName: "hero-description" }}
            >
              {description}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/gallery">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity duration-300 w-full sm:w-auto"
                >
                  {t("explore_gallery") || "Galeriyi Keşfet"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none hover:opacity-90 transition-opacity duration-300 w-full sm:w-auto"
                >
                  {language === "tr"
                    ? "Özel Tasarım Forma İçin Bilgi Al"
                    : "Get Info for Custom Jersey Design"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            {/* Social proof */}
            {content.show_ratings && (
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">                <div className="flex -space-x-3">
                  {profileImages.map((image, i) => (
                    <Avatar
                      key={i}
                      className="w-10 h-10 border-2 border-white dark:border-gray-900 shadow-md"
                    >
                      <SafeImage 
                        src={image} 
                        alt={`Customer ${i + 1}`}
                        className="aspect-square h-full w-full object-cover"
                        fallbackSrc="/placeholder.svg"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                
                <div>
                  <p className="text-sm font-medium flex items-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/250px-Google_Favicon_2025.svg.png"
                      alt="Google"
                      className="mr-2 h-5 w-5"
                      width="20"
                      height="20"
                      loading="lazy"
                    />
                    <span className="text-blue-600 font-semibold">{content.customer_count}+</span>
                    <span className="ml-1">{t("trusted_wholesalers") || "toptancı tarafından tercih edildi"}</span>
                  </p>
                  
                  <div className="flex items-center mt-1">
                    {[...Array(content.rating_count || 5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm ml-1 font-medium">{content.rating_value}/5</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3D Model Container */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="model-container">
              {showModel ? (
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      3D Model yükleniyor...
                    </p>
                  </div>
                }>
                  <DeferredModel />
                </Suspense>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    3D Model hazırlanıyor...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionOptimized;
