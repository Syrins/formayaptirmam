import React, { useState, useCallback } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = 'https://www.pngall.com/wp-content/uploads/10/Member-Silhouette-Transparent.png',
  onError,
  onLoad 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    console.warn(`Failed to load image: ${imageSrc}`);
    setHasError(true);
    setIsLoading(false);
    
    // Try fallback image if not already using it
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
    }
    
    onError?.();
  }, [imageSrc, fallbackSrc, onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // For Google profile images, add specific handling
  const processGoogleImageSrc = (originalSrc: string) => {
    if (originalSrc.includes('googleusercontent.com')) {
      // Remove problematic parameters that might cause 400 errors
      const url = new URL(originalSrc);
      // Keep only essential parameters
      const cleanUrl = `${url.origin}${url.pathname}`;
      // Add basic size parameter
      return `${cleanUrl}=s120`;
    }
    return originalSrc;
  };

  const processedSrc = processGoogleImageSrc(imageSrc);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={processedSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        crossOrigin="anonymous"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
      
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-500 text-xs">⚠️</span>
        </div>
      )}
    </div>
  );
};

export default SafeImage;
