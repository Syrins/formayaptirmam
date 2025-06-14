
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterX, Loader2 } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

export interface FilterOptions {
  jerseyType: string;
  colors: string[];
  showNew: boolean;
  showPopular: boolean;
}

interface JerseyFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

interface JerseyType {
  id: string;
  name: string;
  name_tr: string;
  is_active: boolean;
}

interface PriceRange {
  id: string;
  min: number;
  max: number;
  is_default: boolean;
}

interface OrderQuantity {
  id: string;
  value: number;
  is_default: boolean;
}

interface JerseyColor {
  id: string;
  name: string;
  name_tr: string;
  hex_code: string;
  is_active: boolean;
}

const JerseyFilters: React.FC<JerseyFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const { t, language } = useLanguage();
  
  const [jerseyTypes, setJerseyTypes] = useState<JerseyType[]>([]);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [orderQuantities, setOrderQuantities] = useState<OrderQuantity[]>([]);
  const [colors, setColors] = useState<JerseyColor[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch all filter data from Supabase
  useEffect(() => {
    const fetchFilterData = async () => {
      setLoading(true);
      try {
        // Fetch jersey types
        const { data: typesData, error: typesError } = await supabase
          .from('jersey_types')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: false }); // Changed to descending order (Z-A)
          
        if (typesError) throw typesError;
        setJerseyTypes(typesData || []);
        
        // Fetch price ranges
        const { data: priceData, error: priceError } = await supabase
          .from('price_ranges')
          .select('*')
          .order('min', { ascending: true });
          
        if (priceError) throw priceError;
        setPriceRanges(priceData || []);
        
        // Set default price range if available
        const defaultPriceRange = priceData?.find(range => range.is_default);
        
        // Fetch order quantities
        const { data: quantityData, error: quantityError } = await supabase
          .from('order_quantities')
          .select('*')
          .order('value', { ascending: true });
          
        if (quantityError) throw quantityError;
        setOrderQuantities(quantityData || []);
        
        // Set default order quantity if available
        const defaultQuantity = quantityData?.find(qty => qty.is_default);
        
        // Fetch colors
        const { data: colorData, error: colorError } = await supabase
          .from('jersey_colors')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });
          
        if (colorError) throw colorError;
        setColors(colorData || []);
        
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilterData();
  }, []);

  const handleJerseyTypeChange = (typeId: string) => {
    onFilterChange({ ...filters, jerseyType: typeId });
  };

  const handleColorChange = (colorHex: string) => {
    const updatedColors = filters.colors.includes(colorHex)
      ? filters.colors.filter(c => c !== colorHex)
      : [...filters.colors, colorHex];
    
    onFilterChange({ ...filters, colors: updatedColors });
  };

  const handleCheckboxChange = (field: 'showNew' | 'showPopular', checked: boolean) => {
    onFilterChange({ ...filters, [field]: checked });
  };

  // Format prices for display based on language
  const formatPrice = (value: number) => {
    if (language === 'tr') {
      return `${value.toFixed(0)} ₺`;
    } else {
      // For English users, convert from TL to USD
      const exchangeRate = 32;
      const priceInUSD = value / exchangeRate;
      return `$${priceInUSD.toFixed(0)}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>{t("Urun_Yukleniyor") || "Ürünler yükleniyor..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={onReset}>
          <FilterX className="h-4 w-4 mr-1" /> {t("reset_filters")}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Jersey Type - Now as radio buttons instead of dropdown */}
        <div>
          <Label className="block mb-2 font-medium">{t("jersey_type")}</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="all-types"
                name="jersey-type"
                checked={filters.jerseyType === "all"}
                onChange={() => handleJerseyTypeChange("all")}
                className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="all-types" className="cursor-pointer">{t("all_types")}</Label>
            </div>
            {jerseyTypes.map(type => (
              <div key={type.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`type-${type.id}`}
                  name="jersey-type"
                  checked={filters.jerseyType === type.id}
                  onChange={() => handleJerseyTypeChange(type.id)}
                  className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor={`type-${type.id}`} className="cursor-pointer">
                  {language === 'tr' ? type.name_tr : type.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Other Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-new" 
              checked={filters.showNew}
              onCheckedChange={(checked) => handleCheckboxChange('showNew', checked as boolean)}
            />
            <Label htmlFor="show-new" className="cursor-pointer">{t("new_arrivals")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-popular" 
              checked={filters.showPopular}
              onCheckedChange={(checked) => handleCheckboxChange('showPopular', checked as boolean)}
            />
            <Label htmlFor="show-popular" className="cursor-pointer">{t("popular_items")}</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JerseyFilters;
