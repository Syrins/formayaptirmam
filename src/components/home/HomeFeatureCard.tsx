
import React from "react";
import { HomepageFeature } from "@/hooks/use-homepage-content";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight } from "lucide-react";
import FormattedText from "@/components/ui/formatted-text";

interface HomeFeatureCardProps {
  feature: HomepageFeature;
}

const HomeFeatureCard: React.FC<HomeFeatureCardProps> = ({ feature }) => {
  const { language } = useLanguage();
  
  const title = language === 'tr' ? feature.title_tr : feature.title_en;
  const description = language === 'tr' ? feature.description_tr : feature.description_en;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      {/* Gradient hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-galaxy-blue/5 via-galaxy-purple/5 to-galaxy-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Card content */}
      <div className="p-6">
        {feature.image_url && (
          <div className="mb-4 overflow-hidden rounded-lg h-48">
            <img
              src={feature.image_url}
              alt={title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-left">
            <FormattedText text={title} />
          </h3>
          <div className="text-gray-600 dark:text-gray-300 text-left">
            <FormattedText text={description} />
          </div>
          
          {feature.link && (
            <div className="pt-2 text-left">
              <a
                href={feature.link}
                className="inline-flex items-center text-galaxy-blue hover:text-galaxy-purple transition-colors group/link"
              >
                <span className="mr-2">{language === 'tr' ? 'Daha Fazla' : 'Learn More'}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Subtle accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-galaxy-blue via-galaxy-purple to-galaxy-neon transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </div>
  );
};

export default HomeFeatureCard;
