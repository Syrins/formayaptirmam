import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const FloatingContactButtons: React.FC = () => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const phoneNumber = "+905322900838";
  
  // Show buttons after a short delay for a nice entry effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const buttonSize = isMobile ? 45 : 50;
  
  return (
    <>
      {/* Phone button - bottom left */}
      <a 
        href={`tel:${phoneNumber}`}
        className={`fixed bottom-6 left-6 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300 ease-in-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
        aria-label="Call us"
      >
        <Phone size={buttonSize} />
      </a>
      
      {/* WhatsApp button - bottom right with pulse animation */}
      <a 
        href={`https://wa.me/${phoneNumber.replace('+', '')}`}
        target="_blank" 
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300 ease-in-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
        aria-label="Contact us on WhatsApp"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" 
          alt="WhatsApp" 
          width={buttonSize}
          height={buttonSize}
          className="animate-pulse" 
        />
      </a>
    </>
  );
};

export default FloatingContactButtons;