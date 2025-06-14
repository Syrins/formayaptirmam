
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full flex items-center gap-1"
      onClick={toggleLanguage}
      title={language === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-semibold">{language.toUpperCase()}</span>
    </Button>
  );
};

export default LanguageSwitcher;
