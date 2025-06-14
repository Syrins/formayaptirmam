
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JerseyCard, { JerseyProps } from './JerseyCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { HomepageContent } from '@/types/blog';

const FeaturedJerseys: React.FC = () => {
  const [jerseys, setJerseys] = useState<JerseyProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<HomepageContent | null>(null);
  const { t, language } = useLanguage();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products without verbose logging
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("is_featured", true)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(4);

        if (productsError) {
          throw productsError;
        }

        if (!productsData || productsData.length === 0) {
          setJerseys([]);
          return;
        }

        // Fetch section content
        // We need to cast the type here because the Supabase client doesn't know about our new table yet
        const { data: contentData } = await supabase
          .from('homepage_content')
          .select('*')
          .eq("section", "featured")
          .single();
          
        // Transform products data to match JerseyProps interface
        const jerseyData = productsData.map((product: any) => {
          // Create a slug from product name if one doesn't exist - with Turkish character support
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
          
          const slug = product.slug || createSlug(product.name);
          
          return {
            id: product.id,
            name: product.name,
            image: product.image_url || "/placeholder.svg",
            minOrder: product.min_order || 10,
            price: product.price,
            colors: product.colors || 1,
            isPopular: Boolean(product.is_popular),
            isNew: Boolean(product.is_new),
            displayOrder: product.display_order || 999,
            display_id: product.display_id,
            slug: slug,
            deliveryTime: "2-3 İş Günü"
          };
        });

        setJerseys(jerseyData);
        
        if (contentData) {
          setContent(contentData as HomepageContent);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        toast.error(t("error_fetching_products") || "Ürünler yüklenirken hata oluştu");
        setJerseys([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  // Get title and description based on current language and content
  const title = content 
    ? (language === 'tr' ? content.title_tr : content.title_en) 
    : t("featured_jerseys") || "Öne Çıkan Formalar";
    
  const description = content 
    ? (language === 'tr' ? content.description_tr : content.description_en) 
    : t("featured_jerseys_description") || "En Çok Tercih Edilen Forma Modellerimiz";

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-galaxy-blue to-galaxy-purple">
              {title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
          <Link to="/gallery" className="mt-4 md:mt-0">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              {t("view_all")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : jerseys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jerseys.map((jersey) => (
              <JerseyCard key={jersey.id} jersey={jersey} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {t("no_products_found") || "Hiç ürün bulunamadı"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedJerseys;
