
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import JerseyCard, { JerseyProps } from './JerseyCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useInView } from 'react-intersection-observer';

// Memorize component to prevent unnecessary re-renders
const LatestJerseys: React.FC = memo(() => {
  const [jerseys, setJerseys] = useState<JerseyProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  
  // Improve intersection observer threshold and rootMargin for better performance
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '300px 0px' // Increased rootMargin for earlier loading
  });
  
  // Optimized data fetching with useCallback
  const fetchLatestProducts = useCallback(async () => {
    if (!inView) return;
    
    try {
      setLoading(true);
      
      // Optimize query to fetch only necessary fields
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, min_order, price, colors, is_popular, is_new, display_id, slug")
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(4); // Reduced from 8 to 4 for initial load performance

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
      console.error("Error fetching latest products:", error);
      toast.error(t("error_fetching_products") || "Ürünler yüklenirken hata oluştu");
      setJerseys([]);
    } finally {
      setLoading(false);
    }
  }, [t, inView]);

  useEffect(() => {
    // Only fetch data when component is visible
    if (inView) {
      fetchLatestProducts();
    }
  }, [fetchLatestProducts, inView]);

  return (
    <section ref={ref} className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-galaxy-neon to-galaxy-blue">
              {t("latest_jerseys") || "En Yeni Formalar"}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              {t("latest_jerseys_description") || "En yeni üretilen formalarımızı buradan takip edebilirsiniz."}
            </p>
          </div>
          <Link to="/gallery?showNew=true" className="mt-4 md:mt-0">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              {t("view_all") || "Tümünü Gör"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              {t("no_new_jerseys_found") || "Yeni ürün bulunamadı"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

export default LatestJerseys;
