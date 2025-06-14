import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { SiteSettings } from "@/components/admin/AdminLogoSettings";
import { Json } from "@/integrations/supabase/types";

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);

  // Helper function to safely transform letter_colors
  const transformLetterColors = (jsonData: Json | null): Record<number, string> => {
    if (!jsonData || typeof jsonData !== 'object') return {};
    
    try {
      // Handle case where jsonData might be a stringified JSON
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      const result: Record<number, string> = {};
      Object.entries(parsedData).forEach(([key, value]) => {
        const numKey = parseInt(key, 10);
        if (!isNaN(numKey) && typeof value === 'string') {
          result[numKey] = value;
        }
      });
      return result;
    } catch (error) {
      console.error("Error transforming letter colors:", error);
      return {};
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", "default")
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setSettings({
            ...data,
            letter_colors: transformLetterColors(data.letter_colors)
          });
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
    
    // Subscribe to settings changes
    const channel = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'site_settings',
        filter: 'id=eq.default'
      }, (payload) => {
        const newData = payload.new as any;
        setSettings({
          ...newData,
          letter_colors: transformLetterColors(newData.letter_colors)
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-between min-w-0 gap-4">
          <div className="flex-1 min-w-0">
            <Link to="/" className="text-2xl font-bold whitespace-nowrap inline-block">
              {loading ? (
                "FormaYaptırma.com"
              ) : settings?.logo_type === "image" && settings?.logo_image_url ? (
                <img 
                  src={settings.logo_image_url} 
                  alt="Logo" 
                  className="h-10 max-w-[200px] object-contain" 
                />
              ) : (
                renderLogoText()
              )}
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-center space-x-6 flex-1 min-w-0">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors whitespace-nowrap">
              {t("home") || "Anasayfa"}
            </Link>
            <Link to="/gallery" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors whitespace-nowrap">
              {t("gallery") || "Galeri"}
            </Link>
            <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors whitespace-nowrap">
              {t("about_us") || "Hakkımızda"}
            </Link>
            <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors whitespace-nowrap">
              {t("blog") || "Blog"}
            </Link>
            <div className="relative group">
              <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors whitespace-nowrap focus:outline-none flex items-center gap-1">
                {t("contact") || "İletişim"}
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-3 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out scale-95 group-hover:scale-100 z-50">
                <div className="py-3">
                  <Link
                    to="/contact-us"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 group/item"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{t("contact") || "Bize Ulaşın"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Sorularınız için</div>
                    </div>
                  </Link>
                  <Link
                    to="/returns"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 group/item"
                  >
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">İade Politikası</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">İade koşulları</div>
                    </div>
                  </Link>
                  <Link
                    to="/faq"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 group/item"
                  >
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Sıkça Sorulan Sorular</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Hızlı cevaplar</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end flex-1 min-w-0 gap-4">
            <button
              onClick={toggleTheme}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            <Sheet>
              <SheetTrigger className="md:hidden ml-4">
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </SheetTrigger>
              <SheetContent side="right" className="sm:w-2/3 md:w-1/2">
                <SheetHeader className="space-y-2 text-left">
                  <SheetTitle>Menü</SheetTitle>
                  <SheetDescription>
                    {t("explore_our_site") || "Sitemizi keşfedin"}
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors block py-2">
                    {t("home") || "Anasayfa"}
                  </Link>
                  <Link to="/gallery" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors block py-2">
                    {t("gallery") || "Galeri"}
                  </Link>
                  <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors block py-2">
                    {t("about_us") || "Hakkımızda"}
                  </Link>
                  <Link to="/blog" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors block py-2">
                    {t("blog") || "Blog"}
                  </Link>
                  
                  {/* Mobile Contact Dropdown */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setMobileContactOpen(!mobileContactOpen)}
                      className="flex items-center justify-between w-full text-gray-600 dark:text-gray-300 hover:text-primary transition-colors py-2"
                    >
                      <span>{t("contact") || "İletişim"}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${mobileContactOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {mobileContactOpen && (
                      <div className="pl-4 space-y-2 border-l-2 border-gray-200 dark:border-gray-700">
                        <Link 
                          to="/contact-us" 
                          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors py-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {t("contact") || "Bize Ulaşın"}
                        </Link>
                        <Link 
                          to="/returns" 
                          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors py-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          İade Politikası
                        </Link>
                        <Link 
                          to="/faq" 
                          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors py-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Sıkça Sorulan Sorular
                        </Link>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors self-start"
                    aria-label="Toggle theme"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;