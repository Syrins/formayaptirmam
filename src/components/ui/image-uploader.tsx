import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Lazy load non-critical functions
const lazyEnsureBucketsExist = () => import('@/integrations/supabase/ensureBuckets').then(module => module.ensureBucketsExist);
const lazyCheckBucketExists = () => import('@/integrations/supabase/ensureBuckets').then(module => module.checkBucketExists);

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  bucketName?: string;
  folderPath?: string;
  disabled?: boolean;
}

export function ImageUploader({
  currentImageUrl,
  onImageUploaded,
  bucketName = 'story-images',
  folderPath = 'images',
  disabled = false
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [bucketsChecked, setBucketsChecked] = useState(false);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Only check buckets when component is visible and user intends to upload
    const checkBuckets = async () => {
      try {
        const ensureBucketsExist = await lazyEnsureBucketsExist();
        await ensureBucketsExist();
        
        // Verify bucket exists
        const checkBucketExists = await lazyCheckBucketExists();
        const exists = await checkBucketExists('story-images');
        if (!exists) {
          console.log(`Warning: 'story-images' bucket not found. Please create it in the Supabase dashboard.`);
          toast.error("Required storage bucket not found. Please contact the administrator.");
        } else {
          setBucketsChecked(true);
        }
      } catch (error) {
        console.error("Error checking buckets:", error);
        toast.error("Failed to initialize storage. Please try again later.");
      }
    };
    
    // Only run bucket check when user interacts with uploader
    const handleUserInteraction = () => {
      if (!bucketsChecked) {
        checkBuckets();
      }
    };

    const uploader = document.getElementById('image-upload');
    if (uploader) {
      uploader.addEventListener('focus', handleUserInteraction);
      return () => {
        uploader.removeEventListener('focus', handleUserInteraction);
      };
    }
  }, [bucketsChecked]);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      // Always use the 'story-images' bucket
      const actualBucketName = 'story-images';
      
      const file = event.target.files[0];
      
      // Compress image before uploading if it's a JPEG or PNG
      let compressedFile = file;
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        // We'll use browser's built-in canvas for basic compression
        const img = new Image();
        const canvas = document.createElement('canvas');
        
        // Create a promise to handle the image loading
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Calculate new dimensions (max 1200px width)
            let width = img.width;
            let height = img.height;
            const maxWidth = 1200;
            
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error("Could not get canvas context"));
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with compression
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error("Could not compress image"));
                return;
              }
              compressedFile = new File([blob], file.name, { 
                type: file.type,
                lastModified: Date.now()
              });
              resolve();
            }, file.type, 0.8); // 80% quality
          };
          
          img.onerror = () => {
            reject(new Error("Could not load image"));
          };
          
          img.src = URL.createObjectURL(file);
        }).catch(error => {
          console.error("Image compression failed:", error);
          // If compression fails, use the original file
          compressedFile = file;
        });
      }
      
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;
      
      // Upload the compressed file
      const { error: uploadError, data } = await supabase
        .storage
        .from(actualBucketName)
        .upload(filePath, compressedFile);
        
      if (uploadError) {
        console.error('Error uploading image: ', uploadError);
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase
        .storage
        .from(actualBucketName)
        .getPublicUrl(filePath);
        
      const publicUrl = publicUrlData.publicUrl;
      
      // Update preview
      setPreview(publicUrl);
      
      // Pass the URL back to the parent component
      onImageUploaded(publicUrl);
      
      toast.success('Resim başarıyla yüklendi');
    } catch (error) {
      console.error('Error uploading image: ', error);
      toast.error('Resim yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl || !imageUrl.trim()) {
      toast.error('Geçerli bir URL girin');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch (e) {
      toast.error('Geçerli bir URL girin');
      return;
    }

    // Update preview
    setPreview(imageUrl);
    
    // Pass the URL back to the parent component
    onImageUploaded(imageUrl);
    
    // Close dialog
    setIsUrlDialogOpen(false);
    setImageUrl('');
    
    toast.success('Resim URL başarıyla eklendi');
  };

  const removeImage = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="w-full space-y-4">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-auto object-cover rounded-md max-h-[300px]" 
            loading="lazy"
            width="300"
            height="200"
            onError={() => {
              toast.error('Resim yüklenemedi. Lütfen geçerli bir resim URL\'si girin.');
              setPreview(null);
            }}
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={removeImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 flex flex-col items-center justify-center">
          <Upload className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-2" />
          <p className="text-sm text-gray-500">Resim Seçin veya Sürükleyin</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG veya WebP (max. 5MB)</p>
        </div>
      )}
      
      <div className="flex gap-2">
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading || disabled}
        />
        <Button
          type="button"
          variant={preview ? "outline" : "default"}
          className="flex-1"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={uploading || disabled}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Yükleniyor...
            </>
          ) : preview ? (
            'Resmi Değiştir'
          ) : (
            'Resim Yükle'
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsUrlDialogOpen(true)}
          disabled={uploading || disabled}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          URL Ekle
        </Button>
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
            <Button onClick={handleUrlSubmit} disabled={disabled}>
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
