
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ShippingContent {
  id: string;
  title_tr: string;
  title_en: string;
  content_tr: string;
  content_en: string;
  is_active: boolean;
}

const Shipping: React.FC = () => {
  const [shippingContent, setShippingContent] = useState<ShippingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchShippingContent = async () => {
      try {
        const { data, error } = await supabase
          .from("page_contents")
          .select("*")
          .eq("page_type", "shipping")
          .eq("is_active", true)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        setShippingContent(data);
      } catch (error) {
        console.error("Error fetching shipping content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingContent();
  }, []);

  const title = shippingContent 
    ? (language === "tr" ? shippingContent.title_tr : shippingContent.title_en) 
    : t("shipping_information");

  const content = shippingContent
    ? (language === "tr" ? shippingContent.content_tr : shippingContent.content_en)
    : "";

  return (
    <Layout>
      <Helmet>
        <title>{t("shipping_information")} | FormaYaptirma</title>
        <meta name="description" content={t("shipping_description")} />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {title}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : shippingContent ? (
          <div className="max-w-3xl mx-auto prose dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            {t("no_shipping_information_found")}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shipping;
