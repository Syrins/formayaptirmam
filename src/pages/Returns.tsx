
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ReturnContent {
  id: string;
  title_tr: string;
  title_en: string;
  content_tr: string;
  content_en: string;
  is_active: boolean;
}

const Returns: React.FC = () => {
  const [returnContent, setReturnContent] = useState<ReturnContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchReturnContent = async () => {
      try {
        const { data, error } = await supabase
          .from("page_contents")
          .select("*")
          .eq("page_type", "returns")
          .eq("is_active", true)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        setReturnContent(data);
      } catch (error) {
        console.error("Error fetching return policy content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReturnContent();
  }, []);

  const title = returnContent 
    ? (language === "tr" ? returnContent.title_tr : returnContent.title_en) 
    : t("return_policy");

  const content = returnContent
    ? (language === "tr" ? returnContent.content_tr : returnContent.content_en)
    : "";

  return (
    <Layout>
      <Helmet>
        <title>{t("return_policy")} | FormaYaptirma</title>
        <meta name="description" content={t("returns_description")} />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {title}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : returnContent ? (
          <div className="max-w-3xl mx-auto prose dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            {t("no_return_policy_found")}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Returns;
