
import { supabase } from "./client";
import { toast } from "sonner";

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
    
    // Look for the 'story_images' bucket
    const storyImagesBucketExists = buckets?.some(bucket => bucket.name === 'story_images');
    
    if (!storyImagesBucketExists) {
      console.error("Required bucket 'story_images' does not exist. Please create it in the Supabase dashboard.");
      toast.error("Required storage bucket not found. Please contact the administrator.");
    } else {
      console.log("Storage bucket 'story_images' found and will be used for uploads.");
    }
    
    return { data: { buckets }, error: null };
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
    
    // Always check for 'story_images' as the fallback
    return buckets.some(bucket => bucket.name === bucketName || bucket.name === 'story_images');
  } catch (error) {
    console.error("Error checking bucket:", error);
    return false;
  }
};
