import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import JerseyCard, { JerseyProps } from "../components/JerseyCard";
import JerseyFilters, { FilterOptions } from "../components/JerseyFilters";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, X, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface Product {
  id: string;
  name: string;
  image_url?: string;
  price: number;
  stock: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
  colors?: number;
  min_order?: number;
  is_popular?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  jersey_type?: string;
  slug?: string;
  display_id?: number;
  display_order?: number;
}

interface SeoSettings {
  site_title?: string;
  site_description?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
}

interface GallerySettings {
  id: string;
  title_en: string;
  title_tr: string;
  description_en: string;
  description_tr: string;
  items_per_page: number;
  show_search: boolean;
  show_filters: boolean;
  default_filter_view: string;
  show_price: boolean;
  show_min_order: boolean;
  show_stock_status: boolean;
  show_delivery_time: boolean;
  delivery_time_text_en: string;
  delivery_time_text_tr: string;
  layout_type: string;
  sort_order: string;
}

const defaultGallerySettings: GallerySettings = {
  id: '',
  title_en: 'All Products',
  title_tr: 'Tüm Ürünler',
  description_en: 'Browse our collection of high-quality custom jerseys for your team.',
  description_tr: 'Takımınız için yüksek kaliteli özel formaları keşfedin.',
  items_per_page: 12,
  show_search: true,
  show_filters: true,
  default_filter_view: 'expanded',
  show_price: true,
  show_min_order: true,
  show_stock_status: true,
  show_delivery_time: true,
  delivery_time_text_en: '2-3 business days delivery',
  delivery_time_text_tr: '2-3 iş gününde teslim',
  layout_type: 'grid',
  sort_order: 'newest'
};

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const { t, language } = useLanguage();
  
  const initialFilters: FilterOptions = {
    jerseyType: queryParams.get('jerseyType') || "all",
    colors: [], // Initialize with an empty array
    showNew: queryParams.get('showNew') === 'true',
    showPopular: queryParams.get('showPopular') === 'true'
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [jerseys, setJerseys] = useState<JerseyProps[]>([]);
  const [filteredJerseys, setFilteredJerseys] = useState<JerseyProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [jerseyTypeMap, setJerseyTypeMap] = useState<Record<string, string>>({});
  const [gallerySettings, setGallerySettings] = useState<GallerySettings>(defaultGallerySettings);

  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        const { data, error } = await supabase.from("seo_settings").select("*").single();
        if (error && error.code !== 'PGRST116') console.error("Error fetching SEO settings:", error);
        if (data) setSeoSettings(data);
      } catch (error) {
        console.error("Error in SEO settings fetch:", error);
      }
    };
    fetchSeoSettings();
  }, []);
  
  useEffect(() => {
    const fetchGallerySettings = async () => {
      try {
        const { data, error } = await (supabase as any).from("gallery_settings").select("*").single();
        if (error && error.code !== 'PGRST116') console.error("Error fetching gallery settings:", error);
        if (data) {
          setGallerySettings(data as GallerySettings);
          setIsFilterVisible(data.default_filter_view === 'expanded');
        }
      } catch (error) {
        console.error("Error in gallery settings fetch:", error);
      }
    };
    fetchGallerySettings();
  }, []);

  const transformJerseyData = (productsData: Product[]) => {
    if (!productsData || productsData.length === 0) return [];
    return productsData.map((product: Product) => {
      // Create slug with Turkish character support
      const createSlug = (text: string) => {
        return text
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-|-$/g, '');
      };
      
      const slug = product.slug || createSlug(product.name || '');
      const jerseyType = product.jersey_type ? product.jersey_type : "all";
      return {
        id: product.id,
        name: product.name || '',
        image: product.image_url || "/placeholder.svg",
        minOrder: product.min_order || 10,
        price: product.price || 0,
        colors: product.colors || 1,
        isPopular: product.is_popular || false,
        isNew: product.is_new || false,
        jerseyType: jerseyType,
        slug: slug,
        display_id: product.display_id,
        stock: product.stock || 0,
        deliveryTime: language === 'en' ? gallerySettings.delivery_time_text_en : gallerySettings.delivery_time_text_tr,
        displayOrder: product.display_id
      };
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data: jerseyTypesData, error: jerseyTypeError } = await supabase.from("jersey_types").select("id, name");
        const jerseyTypes = jerseyTypesData || [];
        const typeMap = jerseyTypes.reduce((acc: Record<string, string>, type: any) => {
          acc[type.id] = type.name;
          return acc;
        }, {});
        setJerseyTypeMap(typeMap);
        
        const { data: productsData, error: productsError } = await supabase.from("products").select("*");
        if (productsError) throw productsError;
        if (!productsData || productsData.length === 0) {
          setJerseys([]);
          setFilteredJerseys([]);
          setLoading(false);
          setInitialLoadDone(true);
          return;
        }

        let sortedProducts = [...productsData];
        switch (gallerySettings.sort_order) {
          case 'newest':
            sortedProducts.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
            break;
          case 'price_low':
            sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case 'price_high':
            sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
          case 'display_order':
            sortedProducts.sort((a, b) => (a.display_id || 999) - (b.display_id || 999));
            break;
          default:
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        }
        
        const jerseyData = transformJerseyData(sortedProducts);
        setJerseys(jerseyData);
        setFilteredJerseys(jerseyData);
        setInitialLoadDone(true);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error(t("error_fetching_products") || "Ürünler yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [t, gallerySettings]);

  const applyFilters = (products: JerseyProps[], currentFilters: FilterOptions, search: string) => {
    if (!products || products.length === 0) {
      setFilteredJerseys([]);
      return;
    }
    
    let result = [...products];
    if (search && search.trim() !== '') {
      result = result.filter(jersey => jersey.name.toLowerCase().includes(search.toLowerCase()));
    }
    
    if (currentFilters.jerseyType !== "all") {
      result = result.filter(jersey => jersey.jerseyType === currentFilters.jerseyType);
    }
    
    if (currentFilters.showPopular || currentFilters.showNew) {
      result.sort((a, b) => {
        if (currentFilters.showPopular && a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
        if (currentFilters.showNew && a.isNew !== b.isNew) return a.isNew ? -1 : 1;
        if (a.display_id && b.display_id) return a.display_id - b.display_id;
        return b.name.localeCompare(a.name);
      });
    } else {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    setFilteredJerseys(result);
  };

  useEffect(() => {
    if (initialLoadDone && jerseys.length > 0) applyFilters(jerseys, filters, searchTerm);
  }, [filters, searchTerm, jerseys, initialLoadDone]);

  useEffect(() => {
    if (!initialLoadDone) return;
    const jerseyType = queryParams.get('jerseyType') || 'all';
    const showNew = queryParams.get('showNew') === 'true';
    const showPopular = queryParams.get('showPopular') === 'true';
    setFilters(prev => ({ ...prev, jerseyType, showNew, showPopular }));
  }, [location.search, initialLoadDone]);

  const handleFilterChange = (newFilters: FilterOptions) => setFilters(newFilters);
  const resetFilters = () => {
    setFilters({ jerseyType: "all", colors: [], showNew: false, showPopular: false });
    setSearchTerm("");
  };
  
  const pageTitle = language === 'en' ? gallerySettings.title_en : gallerySettings.title_tr;
  const pageDescription = language === 'en' ? gallerySettings.description_en : gallerySettings.description_tr;

  return (
    <Layout>
      <div>
        <Helmet>
          <title>{seoSettings.meta_title || `${pageTitle} - ${seoSettings.site_title || 'Athletic Galaxy'}`}</title>
          <meta name="description" content={seoSettings.meta_description || pageDescription || ""} />
          {seoSettings.keywords && <meta name="keywords" content={seoSettings.keywords} />}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preload" href={jerseys.length > 0 ? jerseys[0].image : "/placeholder.svg"} as="image" />
        </Helmet>
        
        {/* Main container with increased top padding */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
          >
            <ArrowLeft className="h-4 w-4 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="text-base text-primary group-hover:text-primary/80 transition-colors">
              {t("back_to_home") || "Ana Sayfaya Dön"}
            </span>
          </Button>
        </div>

        <div className="mb-10 text-left">
          
          {(filters.showNew || filters.showPopular || filters.jerseyType !== "all") && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {filters.showPopular && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                  <span>{t("popular_jerseys") || "Popüler Ürünler"}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 -mr-1" onClick={() => setFilters(prev => ({...prev, showPopular: false}))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {filters.showNew && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                  <span>{t("new_jerseys") || "Yeni Ürünler"}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 -mr-1" onClick={() => setFilters(prev => ({...prev, showNew: false}))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {filters.jerseyType !== "all" && (
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                  <span>{jerseyTypeMap[filters.jerseyType] || filters.jerseyType}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 -mr-1" onClick={() => setFilters(prev => ({...prev, jerseyType: "all"}))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="sm" className="text-sm" onClick={resetFilters}>
                {t("clear_all") || "Tümünü Temizle"}
              </Button>
            </div>
          )}
        </div>
        
        {gallerySettings.show_search && (
          <div className="flex flex-col md:hidden gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input type="text" placeholder={t("search_placeholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            {gallerySettings.show_filters && (
              <Button variant="outline" className="w-full" onClick={() => setIsFilterVisible(!isFilterVisible)}>
                <Filter className="h-4 w-4 mr-2" />
                {isFilterVisible ? t("hide_filters") : t("show_filters")}
              </Button>
            )}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-8">
          {gallerySettings.show_filters && (
            <div className={`md:w-64 ${isFilterVisible || 'hidden md:block'}`}>
              <JerseyFilters filters={filters} onFilterChange={handleFilterChange} onReset={resetFilters} />
            </div>
          )}
          
          <div className="flex-1">
            {gallerySettings.show_search && (
              <div className="hidden md:flex mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input type="text" placeholder={t("search_placeholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full max-w-md" />
              </div>
            )}
            
            <div className="mb-6 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("loading") || "Yükleniyor..."}
                  </span>
                ) : (
                  `${t("showing")} ${filteredJerseys.length} ${filteredJerseys.length === 1 ? t("jersey_singular") : t("jersey_plural")}`
                )}
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : filteredJerseys.length > 0 ? (
              <div className={`${gallerySettings.layout_type === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : gallerySettings.layout_type === 'list' ? 'flex flex-col gap-4' : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6'}`}>
                {filteredJerseys.map((jersey) => (
                  <JerseyCard 
                    key={jersey.id} 
                    jersey={jersey} 
                    showPrice={gallerySettings.show_price}
                    showMinOrder={gallerySettings.show_min_order}
                    showStockStatus={gallerySettings.show_stock_status}
                    showDeliveryTime={gallerySettings.show_delivery_time}
                    layout={gallerySettings.layout_type}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">{t("no_jerseys_found")}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t("adjust_filters")}</p>
                <Button onClick={resetFilters}>{t("reset_filters")}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
