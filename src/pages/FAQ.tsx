
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";

interface FAQItem {
  id: string;
  question_tr: string;
  question_en: string;
  answer_tr: string;
  answer_en: string;
  display_order: number;
  is_active: boolean;
}

const FAQ: React.FC = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchFAQItems = async () => {
      try {
        const { data, error } = await supabase
          .from("faq_items")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setFaqItems(data || []);
      } catch (error) {
        console.error("Error fetching FAQ items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQItems();
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>{t("faq")} | FormaYaptirma</title>
        <meta name="description" content={t("faq_description")} />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {t("frequently_asked_questions")}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : faqItems.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-lg font-medium">
                    {language === "tr" ? item.question_tr : item.question_en}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-300">
                    {language === "tr" ? item.answer_tr : item.answer_en}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            {t("no_faq_items_found")}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FAQ;
