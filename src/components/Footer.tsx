
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from "next-themes";
import { supabase } from '@/integrations/supabase/client';

interface FooterSection {
  id: string;
  section: string;
  title_tr: string;
  title_en: string;
  is_active: boolean;
}

interface FooterLink {
  id: string;
  section: string;
  title_tr: string;
  title_en: string;
  url: string;
  is_active: boolean;
}

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFooterContent = async () => {
      try {
        // Fetch active sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from("footer_content")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });
          
        if (sectionsError) throw sectionsError;
        setSections(sectionsData || []);
        
        // Fetch active links
        const { data: linksData, error: linksError } = await supabase
          .from("footer_links")
          .select("*")
          .eq("is_active", true)
          .order("section", { ascending: true })
          .order("display_order", { ascending: true });
          
        if (linksError) throw linksError;
        setLinks(linksData || []);
      } catch (error) {
        console.error("Error fetching footer content:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFooterContent();
  }, []);
  
  // Group links by section
  const linksBySection: Record<string, FooterLink[]> = {};
  links.forEach(link => {
    if (!linksBySection[link.section]) {
      linksBySection[link.section] = [];
    }
    linksBySection[link.section].push(link);
  });
  
  // Hardcoded logo rendering function (same as Navbar)
  const renderLogoText = () => {
    return (
      <>
        <span
          style={{
            background: 'linear-gradient(to right, #007bff, #8A2BE2)', // Blue to Purple gradient
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          FormaYaptırma
        </span>
        <span style={{ color: theme === "dark" ? "#FFFFFF" : "#000000", fontFamily: "'Poppins', sans-serif" }}>.com</span>
      </>
    );
  };
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 w-full">
      <div className="w-full px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section - Always show this one */}
          <div>
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              {renderLogoText()}
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {language === 'tr' 
                ? 'Premium toptan formalar ile gelişmiş özelleştirme seçenekleri ve toptan satış dostu politikalar.'
                : 'Premium wholesale jerseys with advanced customization options and wholesale-friendly policies.'}
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://www.facebook.com/acunsport" className="btn-icon">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/acunsport" className="btn-icon">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/acunsport" className="btn-icon">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Dynamic Sections from Database */}
          {sections
            .filter(section => section.section !== 'brand') // Brand is already handled above
            .map((section) => {
              const sectionLinks = linksBySection[section.section] || [];
              const sectionTitle = language === 'tr' ? section.title_tr : section.title_en;
              
              return (
                <div key={section.id}>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{sectionTitle}</h3>
                  {sectionLinks.length > 0 && (
                    <ul className="space-y-2">
                      {sectionLinks.map((link) => {
                        const linkTitle = language === 'tr' ? link.title_tr : link.title_en;
                        // Check if it's an external link
                        const isExternal = link.url.startsWith('http');
                        
                        return (
                          <li key={link.id}>
                            {isExternal ? (
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                              >
                                {linkTitle}
                              </a>
                            ) : (
                              <Link 
                                to={link.url}
                                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                              >
                                {linkTitle}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })
          }
          
          {/* Customer Support Links - always visible */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {language === 'tr' ? 'Müşteri Hizmetleri' : 'Customer Support'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/faq"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {language === 'tr' ? 'Sık Sorulan Sorular' : 'FAQ'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {language === 'tr' ? 'Kargo Bilgileri' : 'Shipping'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {language === 'tr' ? 'İade Koşulları' : 'Returns'}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact-us"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {language === 'tr' ? 'İletişim' : 'Contact Us'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Information - always visible */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {language === 'tr' ? 'Firma Bilgileri' : 'Company Info'}
            </h3>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-2 text-xs">
                    {language === 'tr' ? 'Çalışma Saatlerimiz' : 'Working Hours'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-xs">
                    {language === 'tr' ? 'Hafta İçi: 09:00 - 19:00' : 'Weekdays: 09:00 - 19:00'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-xs">
                    {language === 'tr' ? 'Hafta Sonu: 09:00 - 19:00' : 'Weekend: 09:00 - 19:00'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium text-gray-900 dark:text-white mb-2 text-xs">
                    {language === 'tr' ? 'Adresimiz' : 'Our Address'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs">
                    {language === 'tr' 
                      ? 'Beylikdüzü OSB Mahallesi Mermerciler Sanayi Sitesi, 9. Cd. No:1, 34524 Beylikdüzü/İstanbul'
                      : 'Beylikdüzü OSB District Mermerciler Industrial Site, 9th St. No:1, 34524 Beylikdüzü/Istanbul'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} FormaYaptirma.com {t("all_rights_reserved")}
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4 text-sm">
              <Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                {t("privacy_policy")}
              </Link>
              <Link to="/returns" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                {t("terms_of_use")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
