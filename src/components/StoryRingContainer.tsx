
import React, { useEffect, useState } from "react";
import StoryRing, { Story } from "./StoryRing";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";

const StoryRingContainer: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("story_rings")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) {
          console.error("Error fetching stories:", error);
        } else {
          // Transform the data to match our Story interface
          const formattedStories = data?.map(item => ({
            id: item.id,
            title: item.title,
            title_tr: item.title_tr,
            title_en: item.title_en,
            content: item.content,
            content_tr: item.content_tr,
            content_en: item.content_en,
            image_url: item.image_url,
            images: item.images || [],
            ring_color: item.ring_color,
            shape: item.shape,
            jersey_type_id: item.jersey_type_id, // Include jersey_type_id
            created_at: item.created_at,
            is_viewed: false
          })) || [];
          
          setStories(formattedStories);
        }
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="w-full overflow-hidden py-2">
        <div className="flex items-center gap-12 px-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-2 w-12 mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="w-full">
        <StoryRing stories={stories} />
      </div>
    </div>
  );
};

export default StoryRingContainer;
