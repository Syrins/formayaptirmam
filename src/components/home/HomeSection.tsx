
import React from "react";
import { HomepageSection, HomepageFeature } from "@/hooks/use-homepage-content";
import { useLanguage } from "@/context/LanguageContext";
import HomeFeatureCard from "./HomeFeatureCard";
import FormattedText from "@/components/ui/formatted-text";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HomeSectionProps {
  section: HomepageSection;
  features: HomepageFeature[];
}

const HomeSection: React.FC<HomeSectionProps> = ({ section, features }) => {
  const { language } = useLanguage();
  
  const title = language === 'tr' ? section.title_tr : section.title_en;
  const description = language === 'tr' ? section.description_tr : section.description_en;
  
  // Generate unique section ID from title for anchor linking
  const sectionId = section.section_key.replace(/\s+/g, '-').toLowerCase();

  // Function to open WhatsApp chat
  const openWhatsAppChat = () => {
    const phoneNumber = "905543428442"; // Phone number without the + sign
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  return (
    <section id={sectionId} className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-gray-900/50 -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-left max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-galaxy-blue to-galaxy-purple">
            <FormattedText text={title} />
          </h2>
          <div className="text-lg text-gray-600 dark:text-gray-300">
            <FormattedText text={description} />
          </div>
        </div>

        {section.image_url && (
          <div className="mb-16 flex justify-center">
            <div className="relative rounded-xl overflow-hidden shadow-xl bg-white dark:bg-gray-800 p-2 max-w-3xl w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-galaxy-blue/10 to-galaxy-purple/10 opacity-30 rounded-xl" />
              <img 
                src={section.image_url} 
                alt={title}
                className="rounded-lg w-full object-cover h-auto shadow-inner relative z-10" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none rounded-xl" />
            </div>
          </div>
        )}

        {features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <HomeFeatureCard 
                key={feature.id} 
                feature={feature} 
              />
            ))}
          </div>
        )}
        
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={openWhatsAppChat}
            size="lg"
            className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            {language === 'tr' ? 'Özel Tasarım Forma Yaptırmak İçin Bilgi Al' : 'Get Information To Customize Your Jersey Design'}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
