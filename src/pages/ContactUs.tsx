
import React from "react";
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactImage from "@/components/ContactImage";

const ContactUs: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <Helmet>
        <title>{t("contact_us")} | FormaYaptirma</title>
        <meta name="description" content={t("contact_us_description")} />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {t("contact_us")}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t("contact_information")}</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 mr-3 mt-1 text-primary" />
                <div>
                  <h3 className="font-medium">{t("email")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">info@formayaptirma.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-1 text-primary" />
                <div>
                  <h3 className="font-medium">{t("phone")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">+90 532 290 08 38</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-primary" />
                <div>
                  <h3 className="font-medium">{t("address")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    BOSB, 2.Bulvar 8. Caddesi Mermerciler Sanayi Sitesi No:18/4<br />
                    34524 Beylikdüzü/İstanbul, Türkiye
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">{t("working_hours")}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-medium">{t("weekdays")}:</span> 09:00 - 19:00
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">{t("weekend")}:</span> 09:00 - 19:00
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
              <ContactImage 
                alt={t("contact_image")}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 max-w-5xl mx-auto h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg">
          <iframe 
            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyB2NIWI3Tv9iDPrlnowr_0ZqZWoAQydKJU&q=BOSB%2C%202.Bulvar%208.%20Caddesi%20Mermerciler%20Sanayi%20Sitesi%20No%3A18%2F4%2C%2034524%20Beylikd%C3%BCz%C3%BC%2F%C4%B0stanbul%2C%20T%C3%BCrkiye&maptype=satellite" 
            width="100%" 
            height="100%" 
            style={{ border: 0, borderRadius: '0.5rem' }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;
