
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { HomepageSection, HomepageFeature } from "@/hooks/use-homepage-content";

interface CustomerReferencesProps {
  section?: HomepageSection | null;
  features?: HomepageFeature[];
}

const CustomerReferences: React.FC<CustomerReferencesProps> = ({ 
  section, 
  features = [] 
}) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Just to simulate loading for a moment
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Get title and description based on language
  const title = section 
    ? (language === 'tr' ? section.title_tr : section.title_en) 
    : t("customer_references") || "Sizden Gelenler";
    
  const description = section
    ? (language === 'tr' ? section.description_tr : section.description_en)
    : t("customer_references_description") || "Müşterilerimizin memnuniyetleri ve geri bildirimleri bizim için çok değerli.";

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-galaxy-blue via-galaxy-purple to-galaxy-neon">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.length > 0 ? (
            features.map((feature) => (
              <div 
                key={feature.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="p-1 bg-gradient-to-r from-galaxy-blue to-galaxy-purple">
                  {feature.image_url ? (
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img 
                        src={feature.image_url} 
                        alt={language === 'tr' ? feature.title_tr : feature.title_en}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      <span className="text-4xl text-gray-300 dark:text-gray-600">📷</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-galaxy-blue dark:text-galaxy-purple">
                    {language === 'tr' ? feature.title_tr : feature.title_en}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {language === 'tr' ? feature.description_tr : feature.description_en}
                  </p>

                  {feature.link && (
                    <div className="mt-4">
                      <a 
                        href={feature.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
                      >
                        {language === 'tr' ? 'Daha Fazla' : 'Learn More'}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 dark:text-gray-400 italic">
                {t("no_references_yet") || "Henüz referans eklenmemiş."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CustomerReferences;
