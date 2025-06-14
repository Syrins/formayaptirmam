
import React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const BlogNewsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: t("error"),
        description: t("please_enter_email"),
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement newsletter signup logic
    toast({
      title: t("success"),
      description: t("newsletter_success"),
    });
    
    setEmail("");
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t("newsletter_title")}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{t("newsletter_description")}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          <Input
            type="email"
            placeholder={t("email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          <Button type="submit" className="w-full">{t("subscribe")}</Button>
        </div>
      </form>
    </div>
  );
};

export default BlogNewsletter;
