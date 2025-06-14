
import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";

export interface JerseyProps {
  id: string;
  name: string;
  image: string;
  price: number;
  minOrder?: number;
  colors?: number;
  isPopular?: boolean;
  isNew?: boolean;
  jerseyType?: string;
  slug?: string;
  display_id?: number;
  stock?: number;
  deliveryTime?: string;
  displayOrder?: number;
}

interface JerseyCardProps {
  jersey: JerseyProps;
  showPrice?: boolean;
  showMinOrder?: boolean;
  showStockStatus?: boolean;
  showDeliveryTime?: boolean;
  layout?: string;
}

// Use memo with custom comparison function to prevent unnecessary re-renders
const JerseyCard: React.FC<JerseyCardProps> = memo(({ 
  jersey, 
  showPrice = true,
  showMinOrder = true,
  showStockStatus = true,
  showDeliveryTime = true,
  layout = 'grid'
}) => {
  const { t, language } = useLanguage();
  
  // Use intersection observer for lazy loading
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Preload images 200px before they come into view
    threshold: 0.1
  });
  
  const isListLayout = layout === 'list';
  const productUrl = `/product/${jersey.display_id || jersey.id}/${jersey.slug || jersey.name.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Generate optimized image sizes based on layout
  const imgSizes = isListLayout ? '(max-width: 640px) 33vw, 200px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';
  
  return (
    <Card ref={ref} className={`
      overflow-hidden group relative transition-all hover:shadow-md
      ${isListLayout ? 'flex flex-row' : 'h-full flex flex-col'}
    `}>
      <Link
        to={productUrl}
        className={`block ${isListLayout ? 'w-1/3 flex-shrink-0' : 'w-full'}`}
      >
        <div className="relative pb-[100%]">
          {inView ? (
            <img
              src={jersey.image}
              alt={jersey.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              width="400"
              height="400"
              loading="lazy"
              decoding="async"
              sizes={imgSizes}
              style={{ aspectRatio: '1 / 1' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" 
                 style={{ aspectRatio: '1 / 1' }} />
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {jersey.isNew && (
              <Badge className="bg-blue-500 hover:bg-blue-600">
                {t("new") || "Yeni"}
              </Badge>
            )}
            {jersey.isPopular && (
              <Badge className="bg-red-600 hover:bg-red-900">
                {t("popular") || "Popüler"}
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className={`
        p-4 flex flex-col justify-between gap-2 
        ${isListLayout ? 'flex-1' : ''}
      `}>
        <div>
          <Link
            to={productUrl}
            className="block"
          >
            <h3 className="font-medium text-lg mb-1 line-clamp-2">{jersey.name}</h3>
          </Link>
          
          <div className="space-y-2">
            {showMinOrder && jersey.minOrder && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("min_order") || "Minimum Sipariş"}: {jersey.minOrder}
              </p>
            )}
            
            {showStockStatus && (
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {jersey.stock && jersey.stock > 0 
                  ? t("in_stock") || "Stoklu Ürün" 
                  : t("out_of_stock") || "Stokta Yok"}
              </p>
            )}
            
            {showDeliveryTime && jersey.deliveryTime && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("delivery_time") || "Teslimat Süresi"}: {jersey.deliveryTime}
              </p>
            )}
          </div>
        </div>
        
        {showPrice && (
          <div className="mt-2">
            <p className="font-bold text-xl text-primary">{jersey.price.toFixed(2)} ₺</p>
          </div>
        )}
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.jersey.id === nextProps.jersey.id &&
    prevProps.layout === nextProps.layout &&
    prevProps.showPrice === nextProps.showPrice &&
    prevProps.showMinOrder === nextProps.showMinOrder &&
    prevProps.showStockStatus === nextProps.showStockStatus &&
    prevProps.showDeliveryTime === nextProps.showDeliveryTime
  );
});

JerseyCard.displayName = 'JerseyCard';

export default JerseyCard;
