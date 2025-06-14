import { supabase } from "./client";
import { toast } from "sonner";

const BUCKET_CONFIGS = {
  story_images: {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    fileSizeLimit: 5242880, // 5MB
    cacheControl: 'public, max-age=31536000', // 1 year
    upsert: true,
  },
  homepage_images: {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    fileSizeLimit: 5242880, // 5MB
    cacheControl: 'public, max-age=31536000', // 1 year
    upsert: true,
  },
};

type BucketName = keyof typeof BUCKET_CONFIGS;

export const ensureBucketsExist = async () => {
  try {
    console.log("Checking if storage buckets exist...");
    
    // Check if buckets exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      toast.error("Failed to check storage buckets. Please try again later.");
      return { data: null, error: listError };
    }
    
    // Create or update buckets
    const results = await Promise.all(
      Object.entries(BUCKET_CONFIGS).map(async ([bucketName, config]) => {
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        
        if (!bucketExists) {
          console.log(`Creating '${bucketName}' bucket...`);
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: config.public,
            allowedMimeTypes: config.allowedMimeTypes,
            fileSizeLimit: config.fileSizeLimit,
          });
          
          if (createError) {
            console.error(`Error creating '${bucketName}' bucket:`, createError);
            return { bucketName, success: false, error: createError };
          }
          
          console.log(`Successfully created '${bucketName}' bucket`);
          return { bucketName, success: true };
        } else {
          console.log(`Storage bucket '${bucketName}' found.`);
          return { bucketName, success: true };
        }
      })
    );
    
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      console.error("Some buckets failed to initialize:", errors);
      toast.error("Some storage buckets failed to initialize. Please contact the administrator.");
    }
    
    return { data: { buckets, results }, error: null };
  } catch (error) {
    console.error("Error checking buckets:", error);
    toast.error("Failed to initialize storage. Please try again later.");
    return { data: null, error };
  }
};

// Function to check if a bucket exists
export const checkBucketExists = async (bucketName: string) => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error("Error checking bucket:", error);
      return false;
    }
    
    return buckets.some(bucket => bucket.name === bucketName);
  } catch (error) {
    console.error("Error checking bucket:", error);
    return false;
  }
};

// Function to get bucket configuration
export const getBucketConfig = (bucketName: BucketName) => {
  return BUCKET_CONFIGS[bucketName];
};
