
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import JerseyCard, { JerseyProps } from './JerseyCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useInView } from 'react-intersection-observer';

const PopularJerseys: React.FC = memo(() => {
  const [jerseys, setJerseys] = useState<JerseyProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  
  // Improved intersection observer configuration
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '300px 0px' // Increased for earlier loading
  });
  
  // Optimized data fetching
  const fetchPopularProducts = useCallback(async () => {
    if (!inView) return;
    
    try {
      setLoading(true);
      
      // Optimize query to fetch only necessary fields and limit to 4 items
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, min_order, price, colors, is_popular, is_new, display_id, slug")
        .eq("is_popular", true)
        .order("created_at", { ascending: false })
        .limit(4); // Reduced from 8 to 4 for initial performance

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setJerseys([]);
        return;
      }

      // Transform products data to match JerseyProps interface
      const jerseyData = data.map((product) => {
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
          display_id: product.display_id,
          slug: slug,
          deliveryTime: "2-3 İş Günü"
        };
      });

      setJerseys(jerseyData);
    } catch (error) {
      console.error("Error fetching popular products:", error);
      toast.error(t("error_fetching_products") || "Ürünler yüklenirken hata oluştu");
      setJerseys([]);
    } finally {
      setLoading(false);
    }
  }, [t, inView]);

  useEffect(() => {
    if (inView) {
      fetchPopularProducts();
    }
  }, [fetchPopularProducts, inView]);

  return (
    <section ref={ref} className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-galaxy-purple to-galaxy-neon">
              {t("popular_jerseys") || "Popüler Formalar"}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              {t("popular_jerseys_description") || "Şu an en popüler formalarımızı bu kısımdan görebilirsiniz."}
            </p>
          </div>
          <Link to="/gallery?showPopular=true" className="mt-4 md:mt-0">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              {t("view_all") || "Tümünü Gör"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        ) : jerseys.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {jerseys.map((jersey) => (
              <JerseyCard key={jersey.id} jersey={jersey} showDeliveryTime={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {t("no_popular_jerseys_found") || "Popüler ürün bulunamadı"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

export default memo(PopularJerseys);
