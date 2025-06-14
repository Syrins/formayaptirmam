
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface ContactImageProps {
  fallbackImage?: string;
  className?: string;
  alt?: string;
}

const ContactImage: React.FC<ContactImageProps> = ({ 
  fallbackImage = "https://static.wixstatic.com/media/abc862_cd0c5e510518448bbf8bbcd4eeccd577~mv2.jpg/v1/fill/w_950,h_701,al_c,q_85,usm_1.20_1.00_0.01,enc_avif,quality_auto/abc862_cd0c5e510518448bbf8bbcd4eeccd577~mv2.jpg",
  className = "w-full h-auto object-cover",
  alt = "Contact Image"
}) => {
  const [imageUrl, setImageUrl] = useState<string>(fallbackImage);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchContactImage = async () => {
      try {
        // Fetch contact page settings
        const { data, error } = await supabase
          .from("page_contents")
          .select("contact_image_url")
          .eq("page_type", "contact")
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching contact image:", error);
          return;
        }
        
        if (data?.contact_image_url) {
          setImageUrl(data.contact_image_url);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactImage();
  }, [fallbackImage]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg`}></div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={className}
      onError={() => setImageUrl(fallbackImage)}
    />
  );
};

export default ContactImage;
