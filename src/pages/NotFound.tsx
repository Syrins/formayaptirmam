import React, { useEffect, memo } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Helmet } from "react-helmet-async";

// Error tracking service (replace with your actual error tracking service)
const trackError = async (error: Error, context: Record<string, any>): Promise<void> => {
  try {
    // Example: await analytics.track('error', { error, context });
    console.error('Error tracked:', error, context);
  } catch (e) {
    // Silent fail for error tracking
  }
};

const NotFound: React.FC = memo(() => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const log404Error = async (): Promise<void> => {
      try {
        await trackError(new Error('404 Not Found'), {
          path: location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      } catch (error) {
        // Silent fail - don't show error to user
      }
    };

    log404Error();
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>{t("page_not_found") || "404 - Page Not Found"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t("page_not_found") || "Oops! Page not found"}
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            {t("return_to_home") || "Return to Home"}
          </a>
        </div>
      </div>
    </>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
