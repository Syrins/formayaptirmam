
import React, { useRef, useEffect, useState } from "react";
import { Undo, Redo, Save, Share, ChevronLeft, ChevronRight, Camera, RefreshCcw, Download, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import SketchfabEmbed from "./SketchfabEmbed";

interface DesignTemplate {
  id: string;
  name: string;
  name_tr: string;
  type: string;
  model_url?: string;
  texture_url?: string;
  preview_url: string;
  is_active: boolean;
  display_order: number;
}

interface DesignCanvasProps {
  activeView: "2D" | "3D";
  setActiveView: React.Dispatch<React.SetStateAction<"2D" | "3D">>;
  text: string;
  number: string;
  selectedColor: string;
  selectedFont: string;
  selectedTemplate: DesignTemplate | null;
  onPreviousTemplate: () => void;
  onNextTemplate: () => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  activeView,
  setActiveView,
  text,
  number,
  selectedColor,
  selectedFont,
  selectedTemplate,
  onPreviousTemplate,
  onNextTemplate
}) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        toast({
          title: "Hata",
          description: `Tam ekran etkinleştirilemedi: ${err.message}`,
          variant: "destructive"
        });
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle model rotation
  const toggleRotation = () => {
    setIsRotating(!isRotating);
    
    // Send message to iframe if it's a Sketchfab model
    try {
      const iframe = document.querySelector('.sketchfab-embed-wrapper iframe');
      if (iframe) {
        const api = (iframe as any).api;
        if (api) {
          isRotating ? api.stop() : api.start();
        }
      }
    } catch (error) {
      console.error("Could not control model rotation:", error);
    }
  };
  
  // Action handlers
  const captureScreenshot = () => {
    toast({
      title: "Ekran görüntüsü alındı",
      description: "Tasarımınızın ekran görüntüsü kaydedildi",
    });
  };

  const handleSaveDesign = () => {
    toast({
      title: "Kaydedildi",
      description: "Tasarımınız kaydedildi",
    });
  };

  const handleShareDesign = () => {
    toast({
      title: "Paylaşıldı",
      description: "Tasarımınız paylaşıldı",
    });
  };
  
  const handleDownloadDesign = () => {
    toast({
      title: "İndirildi",
      description: "Tasarımınız indirildi",
    });
  };

  // Extract Sketchfab model ID from URL
  const extractSketchfabId = (url?: string): string | null => {
    if (!url) return null;
    
    // Check if it's already just an ID (32-character hexadecimal string)
    if (/^[a-f0-9]{32}$/i.test(url)) return url;
    
    // Extract ID from standard Sketchfab URL
    const standardMatch = url.match(/sketchfab\.com\/models\/([a-f0-9]{32})/i);
    if (standardMatch) return standardMatch[1];
    
    // Extract ID from embed URL
    const embedMatch = url.match(/sketchfab\.com\/models\/([a-f0-9]{32})\/embed/i);
    if (embedMatch) return embedMatch[1];
    
    return null;
  };

  // Check if template has a valid 3D model
  const has3DModel = selectedTemplate?.type === '3d' && 
    selectedTemplate?.model_url && 
    extractSketchfabId(selectedTemplate.model_url);

  return (
    <div className="design-canvas-wrapper">
      {/* Jersey Canvas with Template Cycling */}
      <div className="relative">
        {/* Template Navigation Buttons */}
        {selectedTemplate && (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-background/80 hover:bg-background shadow-md"
              onClick={onPreviousTemplate}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 rounded-full bg-background/80 hover:bg-background shadow-md"
              onClick={onNextTemplate}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
        
        <div 
          ref={containerRef} 
          className={`glass-card rounded-2xl overflow-hidden aspect-[3/4] relative transition-all duration-300 ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none aspect-auto' : ''
          }`}
        >
          {activeView === "2D" ? (
            <div className="w-full h-full flex items-center justify-center relative">
              {selectedTemplate ? (
                <div className="w-full h-full relative">
                  {/* Base Template Image */}
                  <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
                    style={{ backgroundImage: `url(${selectedTemplate.preview_url})` }}>
                  </div>
                  
                  {/* Color Overlay */}
                  <div
                    className="absolute inset-0 opacity-60 mix-blend-multiply transition-colors duration-300"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                  
                  {/* Text Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Display added text */}
                    {text && (
                      <div
                        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center font-bold px-4 py-1 backdrop-blur-sm bg-black/10 rounded z-10"
                        style={{ fontFamily: selectedFont }}
                      >
                        <span className="text-2xl">{text}</span>
                      </div>
                    )}

                    {/* Display added number */}
                    {number && (
                      <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white z-10">
                        <span className="text-6xl font-bold" style={{ fontFamily: selectedFont }}>
                          {number}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-3/4 h-3/4 transition-colors duration-300 relative"
                  style={{ backgroundColor: selectedColor }}
                >
                  {/* Display added text */}
                  {text && (
                    <div
                      className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center"
                      style={{ fontFamily: selectedFont }}
                    >
                      <span className="text-2xl font-bold">{text}</span>
                    </div>
                  )}

                  {/* Display added number */}
                  {number && (
                    <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                      <span className="text-6xl font-bold" style={{ fontFamily: selectedFont }}>
                        {number}
                      </span>
                    </div>
                  )}

                  {/* Mockup overlay */}
                  <div
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-30"
                    style={{ backgroundImage: `url(/placeholder.svg)` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-gray-800 to-gray-900">
              {has3DModel ? (
                <div className="w-full h-full relative">
                  {/* 3D Model View - Sketchfab Embed */}
                  <SketchfabEmbed 
                    modelId={extractSketchfabId(selectedTemplate.model_url)!} 
                    title={language === 'tr' ? selectedTemplate.name_tr : selectedTemplate.name}
                    height="100%"
                  />
                  
                  {/* 3D Model Controls */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/20 backdrop-blur-md text-white hover:bg-black/40 rounded-full"
                      onClick={toggleRotation}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600">
                    <span className="text-6xl text-gray-400 font-bold">3D</span>
                  </div>
                  <p className="text-white text-xl font-medium">3D Model Bulunamadı</p>
                  <p className="text-sm text-gray-400 max-w-md">
                    Lütfen 3D modeli olan bir şablon seçin veya admin panelinden bu şablona bir Sketchfab URL'i ekleyin.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Fullscreen toggle button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/20 backdrop-blur-md text-white hover:bg-black/40 rounded-full"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-4 w-4" />
          </Button>
          
          {/* Canvas for possible future drawing functionality */}
          <canvas 
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0"
            width="800"
            height="1000"
          />
          
          {/* Template name label */}
          {selectedTemplate && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/30 backdrop-blur-sm text-white">
              <p className="text-center font-medium">
                {language === 'tr' ? selectedTemplate.name_tr : selectedTemplate.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex gap-1 items-center">
            <Undo className="h-4 w-4" />
            <span>Geri Al</span>
          </Button>
          <Button variant="outline" size="sm" className="flex gap-1 items-center">
            <Redo className="h-4 w-4" />
            <span>İleri Al</span>
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={captureScreenshot} className="flex gap-1 items-center">
            <Camera className="h-4 w-4" />
            <span>Ekran Görüntüsü</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadDesign} className="flex gap-1 items-center">
            <Download className="h-4 w-4" />
            <span>İndir</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareDesign} className="flex gap-1 items-center">
            <Share className="h-4 w-4" />
            <span>Paylaş</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DesignCanvas;
