
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { JerseyProps } from "../components/JerseyCard";
import { 
  Package, 
  ShoppingBag, 
  ArrowLeft, 
  Check,
  Truck,
  Calendar,
  Info,
  Loader2,
  Heart,
  Share
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProductImage {
  url: string;
  isMain: boolean;
}

const ProductDetail: React.FC = () => {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const [jersey, setJersey] = useState<JerseyProps | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [activeView, setActiveView] = useState<"2D" | "">("2D");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Extract the actual ID from the URL
        const productId = id.split('/')[0];
        
        // Try to fetch by display_id if it's a number
        let data;
        let error;
        
        if (!isNaN(Number(productId))) {
          // Fetch by display_id
          const result = await supabase
            .from("products")
            .select("*")
            .eq("display_id", Number(productId))
            .single();
            
          data = result.data;
          error = result.error;
        }
        
        // If not found by display_id or it's not a number, try by UUID as fallback
        if (!data && error) {
          console.log("Product not found by display_id, trying UUID as fallback");
          const result = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();
            
          data = result.data;
          error = result.error;
          
          // If found by UUID, redirect to the canonical URL with display_id/slug format
          if (data && data.display_id) {
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
            
            const generatedSlug = data.slug || createSlug(data.name || '') || '';
            const canonicalUrl = `/product/${data.display_id}/${generatedSlug}`;
            navigate(canonicalUrl, { replace: true });
            return;
          }
        }
        
        if (error) {
          console.error("Error fetching product:", error);
          setLoading(false);
          return;
        }
        
        if (data) {
          // Create slug from product name with Turkish character support
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
          
          const generatedSlug = data.slug || createSlug(data.name || '') || '';
          
          // Check if current URL matches the canonical format
          const expectedUrl = `/product/${data.display_id}/${generatedSlug}`;
          const currentUrl = `/product/${id}${slug ? `/${slug}` : ''}`;
          
          // If URL doesn't match expected format, redirect to canonical URL
          if (currentUrl !== expectedUrl) {
            navigate(expectedUrl, { replace: true });
            return;
          }
          
          const product: JerseyProps = {
            id: data.id,
            display_id: data.display_id,
            name: data.name,
            image: data.image_url || "/placeholder.svg",
            minOrder: data.min_order || 10,
            price: data.price,
            colors: data.colors || 1,
            isNew: data.is_new || false,
            isPopular: data.is_popular || false,
            jerseyType: data.jersey_type || "all",
            displayOrder: data.display_id,
            slug: generatedSlug
          };
          
          setJersey(product);
          setQuantity(product.minOrder || 10);
          
          // Set up product images
          const images: ProductImage[] = [];
          if (data.image_url) {
            images.push({ url: data.image_url, isMain: true });
            setActiveImage(data.image_url);
          }
          
          // Add additional images if they exist
          if (data.additional_images && Array.isArray(data.additional_images)) {
            data.additional_images.forEach(url => {
              if (url && url.trim() !== '') {
                images.push({ url, isMain: false });
              }
            });
          }
          
          setProductImages(images);
        }
      } catch (error) {
        console.error("Error in product fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate]);

  // Format price in Turkish Lira
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ₺`;
  };

  const handleBuyNowClick = () => {
    if (!jersey) return;
    
    const message = encodeURIComponent(
      language === 'tr' 
        ? `Merhaba, ${jersey.name} için toptan sipariş hakkında bilgi almak istiyorum. Detaylar için bilgi verebilir misiniz?`
        : `Hello, I'd like to inquire about a wholesale order for ${jersey.name}. I'm interested in ordering ${quantity} pieces. Could you please provide more details?`
    );
    
    // Open WhatsApp with the pre-filled message and updated number
    window.open(`https://wa.me/905322900838?text=${message}`, '_blank');

    toast.success(
      language === 'tr' 
        ? 'WhatsApp siparişi oluşturuluyor...' 
        : 'Creating WhatsApp order...',
      {
        description: language === 'tr' 
          ? 'WhatsApp uygulamasına yönlendiriliyorsunuz.' 
          : 'You are being redirected to WhatsApp.'
      }
    );
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 5);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(jersey?.minOrder || 0, prev - 5));
  };

  if (loading) {
    return (
      <Layout>
        <Helmet>
          <title>{language === 'tr' ? 'Ürün Yükleniyor... | Athletic Galaxy' : 'Loading Product... | Athletic Galaxy'}</title>
          <meta name="description" content={language === 'tr' ? 'Ürün detayları yükleniyor...' : 'Loading product details...'} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Helmet>
        <div className="container mx-auto px-4 pt-20 pb-20">
          <div className="text-center py-20">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h2 className="text-xl mt-4">{t("loading_product") || "Ürün yükleniyor..."}</h2>
          </div>
        </div>
      </Layout>
    );
  }

  if (!jersey) {
    return (
      <Layout>
        <Helmet>
          <title>{language === 'tr' ? 'Ürün Bulunamadı | Athletic Galaxy' : 'Product Not Found | Athletic Galaxy'}</title>
          <meta name="description" content={language === 'tr' ? 'İstediğiniz ürün bulunamadı.' : 'The requested product could not be found.'} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Helmet>
        <div className="container mx-auto px-4 pt-20 pb-20">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">{t("jersey_not_found")}</h2>
            <Link to="/gallery">
              <Button>{t("return_to_gallery")}</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{`${jersey.name} | Athletic Galaxy`}</title>
        <meta name="description" content={`${jersey.name} - ${jersey.price.toFixed(2)} ₺ - ${language === 'tr' ? 'Minimum sipariş: ' : 'Minimum order: '}${jersey.minOrder}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preload" as="image" href={jersey.image} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 pt-20 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb - with reduced spacing */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{language === 'tr' ? 'Ana Sayfa' : 'Home'}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/gallery">{language === 'tr' ? 'Tüm Ürünler' : 'All Products'}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate">{jersey.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Section */}
            <div className="space-y-6">
              {/* View Toggle */}
              <Tabs value={activeView} className="w-full max-w-md mx-auto mb-6">
                <TabsList className="grid grid-cols-2 w-64 mx-auto">
                  <TabsTrigger value="2D" onClick={() => setActiveView("2D")}>
                    {t("view_2d")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Jersey Display */}
              <Card className="overflow-hidden border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    {activeView === "2D" ? (
                      <img 
                        src={activeImage || jersey.image || "/placeholder.svg"} 
                        alt={jersey.name}
                        className="w-full h-full object-contain p-6"
                        width="600"
                        height="600"
                        loading="eager"
                        fetchPriority="high"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-800">
                        <div className="animate-pulse rounded-full h-24 w-24 bg-gray-200 dark:bg-gray-700 mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">{t("coming_soon")}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          {t("feature_development")}
                        </p>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {jersey.isNew && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          {language === 'tr' ? 'Yeni' : 'New'}
                        </Badge>
                      )}
                      {jersey.isPopular && (
                        <Badge className="bg-amber-500 hover:bg-amber-600">
                          {language === 'tr' ? 'Popüler' : 'Popular'}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Button size="icon" variant="secondary" className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <Heart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </Button>
                      <Button size="icon" variant="secondary" className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <Share className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
            </div>
            
            {/* Product Details Section */}
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                  {jersey.name}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-primary">{formatPrice(jersey.price)}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t("per_piece")}</span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'tr' 
                    ? 'Nefes alabilen malzemelerle yapılmış, konfor ve dayanıklılık için tasarlanmış yüksek kaliteli premium forma. Profesyonel takımlar, okullar ve toptan forma çözümleri arayan spor kulüpleri için mükemmel.'
                    : 'High-quality premium jersey made with breathable materials designed for comfort and durability. Perfect for professional teams, schools, and sports clubs looking for wholesale jersey solutions.'}
                </p>
              </div>
              
              <Separator />
              
              {/* Wholesale Info Card */}
              <Card className="bg-violet-50 dark:bg-gray-800/50 border-0">
                <CardContent className="p-4 flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{t("wholesale_info")}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {t("minimum_order")}: <strong>{jersey.minOrder} {t("pieces")}</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Product Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t("delivery_estimate")}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t("bulk_discounts")}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Info className="h-5 w-5 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t("custom_printing")}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t("bulk_shipping")}</span>
                </div>
              </div>
                {/* Add to Cart Button */}
                <Button 
                className="w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white hover:opacity-95 transition-all duration-300 shadow-md"
                onClick={handleBuyNowClick}
                >
                <ShoppingBag className="h-5 w-5 mr-2" /> 
                {language === 'tr' ? 'WhatsApp ile Satın Al' : 'Buy Now via WhatsApp'}
                </Button>
              
              {/* Wholesale Benefits */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t("wholesaler_benefits")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    t("benefits1"), 
                    t("benefits2"),
                    t("benefits3"),
                    t("benefits4"),
                    t("benefits5"),
                    t("benefits6")
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-1">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
