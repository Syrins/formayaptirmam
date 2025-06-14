
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Plus, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageUploader } from './image-uploader';
import { ensureBucketsExist, checkBucketExists } from '@/integrations/supabase/ensureBuckets';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface MultiImageUploaderProps {
  currentImages: string[];
  onImagesUpdated: (urls: string[]) => void;
  bucketName?: string;
  folderPath?: string;
  maxImages?: number;
}

export function MultiImageUploader({
  currentImages = [],
  onImagesUpdated,
  bucketName = 'story-images', // Always use 'story-images' as the default
  folderPath = 'images',
  maxImages = 10
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    // Check buckets on component mount
    const checkBuckets = async () => {
      await ensureBucketsExist();
      
      // Verify bucket exists
      const exists = await checkBucketExists('story-images');
      if (!exists) {
        console.log(`Warning: 'story-images' bucket not found. Please create it in the Supabase dashboard.`);
        toast.error("Required storage bucket not found. Please contact the administrator.");
      }
    };
    
    checkBuckets();
  }, []);

  const handleImageUploaded = (url: string) => {
    if (url) {
      if (currentImages.length >= maxImages) {
        toast.error(`En fazla ${maxImages} resim yükleyebilirsiniz`);
        return;
      }
      
      const newImages = [...currentImages, url];
      onImagesUpdated(newImages);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
    onImagesUpdated(updatedImages);
  };
  
  const handleUrlSubmit = () => {
    if (!imageUrl || !imageUrl.trim()) {
      toast.error('Geçerli bir URL girin');
      return;
    }

    if (currentImages.length >= maxImages) {
      toast.error(`En fazla ${maxImages} resim yükleyebilirsiniz`);
      setIsUrlDialogOpen(false);
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch (e) {
      toast.error('Geçerli bir URL girin');
      return;
    }

    // Add URL to images array
    const newImages = [...currentImages, imageUrl];
    onImagesUpdated(newImages);
    
    // Close dialog and reset
    setIsUrlDialogOpen(false);
    setImageUrl('');
    
    toast.success('Resim URL başarıyla eklendi');
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentImages.map((imageUrl, index) => (
          <div key={index} className="relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <img 
              src={imageUrl} 
              alt={`Image ${index + 1}`} 
              className="w-full h-auto object-cover aspect-square" 
              onError={(e) => {
                // Handle image loading errors
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300?text=Image+Error';
                toast.error(`Resim yüklenemedi: ${imageUrl}`);
              }}
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-7 w-7 rounded-full"
              onClick={() => removeImage(index)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            {index === 0 && (
              <Badge className="absolute bottom-2 left-2 bg-primary">Ana Görsel</Badge>
            )}
          </div>
        ))}
        
        {currentImages.length < maxImages && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md aspect-square flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center justify-center h-full w-full">
              <Upload className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500">Görsel Ekle</p>
              <div className="flex gap-2 mt-4">
                <ImageUploader
                  currentImageUrl=""
                  onImageUploaded={handleImageUploaded}
                  bucketName={bucketName}
                  folderPath={folderPath}
                />
                <Button
                  variant="outline" 
                  onClick={() => setIsUrlDialogOpen(true)}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  URL
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
        {currentImages.length} / {maxImages} resim yüklendi. İlk resim ana görsel olarak kullanılacaktır.
      </div>
      
      {/* URL Input Dialog */}
      <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resim URL'si Girin</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUrlDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUrlSubmit}>
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
