
import React from "react";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { DesignOption } from "@/hooks/use-design-options";

interface ColorSelectorProps {
  colorOptions: DesignOption[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  colorOptions,
  selectedColor,
  setSelectedColor,
}) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="mb-6">
      <Label className="block mb-3">{t("primary_color")}</Label>
      <div className="flex flex-wrap gap-3">
        {colorOptions.map((color) => (
          <button
            key={color.id}
            className={`
              w-8 h-8 rounded-full transition-all duration-200 relative
              ${selectedColor === color.value ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-gray-300 dark:ring-gray-600'}
            `}
            style={{ backgroundColor: color.value }}
            onClick={() => setSelectedColor(color.value)}
            aria-label={`${language === 'tr' ? 'Seç' : 'Select'} ${color.displayName} ${language === 'tr' ? 'rengi' : 'color'}`}
          >
            {selectedColor === color.value && (
              <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        {t("selected")}: {colorOptions.find(c => c.value === selectedColor)?.displayName}
      </p>
    </div>
  );
};

export default ColorSelector;
