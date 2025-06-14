import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const DeferredModel: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate model loading with a delay
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Forma Önizlemesi
          </p>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Model yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <iframe
        title="Siz tasarlayın biz üretelim"
        className="w-full h-full border-none rounded-2xl"
        src="https://sketchfab.com/models/27edb3cbc7274564ad2c12acc3f11653/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_animations=0&ui_inspector=0&ui_controls=0&ui_infos=0&ui_stop=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_hint=0&ui_ar=0&ui_fadeout=0"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
};

export default DeferredModel;
