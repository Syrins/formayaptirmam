import React, { useState, useEffect, useRef, memo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";

// Memoize the Story interface to prevent unnecessary re-renders
export interface Story {
  id: string;
  title: string;
  title_tr?: string;
  title_en?: string;
  image_url: string;
  images?: string[];
  content?: string;
  content_tr?: string;
  content_en?: string;
  ring_color?: string;
  shape?: string;
  created_at: string;
  is_viewed?: boolean;
  display_order?: number;
  is_active?: boolean;
  jersey_type_id?: string | null;
}

export interface StoryRingProps {
  stories: Story[];
}

// Memoize the StoryItem component
const StoryItem = memo(({ 
  story, 
  language, 
  isHovered, 
  onHover, 
  onClick 
}: { 
  story: Story; 
  language: string; 
  isHovered: boolean; 
  onHover: (id: string | null) => void; 
  onClick: (story: Story) => void;
}) => {
  const defaultTitle = language === 'tr' 
    ? "2025-2026 YENİ SEZON FORMALAR İÇİN TIKLA" 
    : "CLICK FOR 2025-2026 NEW SEASON JERSEYS";

  return (
    <div 
      className="flex flex-col items-center cursor-pointer"
      style={{ 
        transition: 'all 0.3s ease-out', 
        minWidth: window.innerWidth <= 768 ? '96px' : '112px' 
      }}
      onClick={() => onClick(story)}
      onMouseEnter={() => onHover(story.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div 
        className={`
          relative w-24 h-24 sm:w-28 sm:h-28
          ${isHovered ? 'scale-125 z-50' : 'scale-100'} 
          transition-all duration-500 ease-out
        `}
      >
        <img 
          src={story.image_url} 
          alt={language === 'tr' ? (story.title_tr || story.title) : (story.title_en || story.title)}
          className="w-full h-full object-contain"
          loading="lazy"
          width={112}
          height={112}
        />
      </div>
      <span className={`
        text-xs mt-2 max-w-32 truncate text-center font-semibold
        transition-all duration-300 
        ${isHovered ? 'text-foreground' : 'text-gray-800 dark:text-gray-200'}
      `}>
        {language === 'tr' 
          ? (story.title_tr || defaultTitle) 
          : (story.title_en || defaultTitle)}
      </span>
    </div>
  );
});

StoryItem.displayName = 'StoryItem';

const StoryRing: React.FC<StoryRingProps> = ({ stories }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoveredStoryId, setHoveredStoryId] = useState<string | null>(null);
  const [animationActive, setAnimationActive] = useState(true);
  const [position, setPosition] = useState(0);
  const lastTimestampRef = useRef<number>(0);
  const scrollSpeedRef = useRef<number>(0.015);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startPositionRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort stories by display_order
  const sortedStories = React.useMemo(() => 
    [...stories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [stories]
  );

  // Mobile detection and speed adjustment
  useEffect(() => {
    const updateScrollSpeed = () => {
      if (window.innerWidth <= 768) {
        scrollSpeedRef.current = 0.30;
      } else {
        scrollSpeedRef.current = 0.015;
      }
    };

    updateScrollSpeed();
    window.addEventListener("resize", updateScrollSpeed);
    return () => window.removeEventListener("resize", updateScrollSpeed);
  }, []);

  const getStoryWidth = React.useCallback(() => {
    return window.innerWidth <= 768 ? 112 : 128;
  }, []);

  const getSingleLoopWidth = React.useCallback(() => {
    return sortedStories.length * getStoryWidth();
  }, [sortedStories.length, getStoryWidth]);

  const getContainerWidth = React.useCallback(() => {
    return getSingleLoopWidth() * 3;
  }, [getSingleLoopWidth]);

  // Infinite scroll animation
  useEffect(() => {
    if (!animationActive || isDraggingRef.current) return;

    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const delta = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      setPosition(prev => {
        const singleLoopWidth = getSingleLoopWidth();
        const newPos = prev + scrollSpeedRef.current * (delta / 16);

        if (newPos >= (2 * singleLoopWidth / window.innerWidth * 100)) {
          return newPos - (singleLoopWidth / window.innerWidth * 100);
        }
        return newPos;
      });

      if (animationActive && !isDraggingRef.current) {
        requestAnimationFrame(animate);
      }
    };

    const frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      lastTimestampRef.current = 0;
    };
  }, [animationActive, getSingleLoopWidth]);

  // Pause animation on hover
  useEffect(() => {
    if (hoveredStoryId) {
      setAnimationActive(false);
    } else {
      const timer = setTimeout(() => setAnimationActive(true), 300);
      return () => clearTimeout(timer);
    }
  }, [hoveredStoryId]);

  const handleDragStart = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    setAnimationActive(false);
    startXRef.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startPositionRef.current = position;
  }, [position]);

  const handleDragMove = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diffX = currentX - startXRef.current;
    const sensitivity = window.innerWidth <= 768 ? 0.7 : 0.5;
    const singleLoopWidth = getSingleLoopWidth();
    const newPosition = startPositionRef.current - (diffX * sensitivity) / window.innerWidth * 100;

    setPosition(prev => {
      const loopPosition = singleLoopWidth / window.innerWidth * 100;
      if (newPosition >= 2 * loopPosition) {
        return newPosition - loopPosition;
      } else if (newPosition < loopPosition) {
        return newPosition + loopPosition;
      }
      return newPosition;
    });
  }, [getSingleLoopWidth]);

  const handleDragEnd = React.useCallback(() => {
    isDraggingRef.current = false;
    const timer = setTimeout(() => setAnimationActive(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleStoryClick = React.useCallback((story: Story) => {
    if (isDraggingRef.current) return;

    if (story.jersey_type_id) {
      navigate(`/gallery?jerseyType=${story.jersey_type_id}`);
      return;
    }

    setSelectedStory(story);
    setIsDialogOpen(true);

    if (!story.is_viewed) {
      story.is_viewed = true;
    }
  }, [navigate]);

  return (
    <div className="w-full py-6 overflow-hidden">
      <div
        ref={containerRef}
        className="flex items-center h-36 relative"
        style={{ 
          transform: `translateX(-${position}%)`,
          transition: isDraggingRef.current ? "none" : "transform 0.5s ease-out"
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => {
          handleDragEnd();
          setHoveredStoryId(null);
        }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div 
          className="flex absolute left-0 top-1/2 -translate-y-1/2"
          style={{ 
            gap: window.innerWidth <= 768 ? '1rem' : '4rem',
            width: `${getContainerWidth()}px`
          }}
        >
          {[...sortedStories, ...sortedStories, ...sortedStories].map((story, index) => (
            <StoryItem
              key={`${story.id}-${index}`}
              story={story}
              language={language}
              isHovered={hoveredStoryId === story.id}
              onHover={setHoveredStoryId}
              onClick={handleStoryClick}
            />
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-0">
          {selectedStory && (
            <>
              <div className="relative">
                {selectedStory.images && selectedStory.images.length > 0 ? (
                  <Carousel>
                    <CarouselContent>
                      <CarouselItem>
                        <img 
                          src={selectedStory.image_url} 
                          alt={language === 'tr' ? (selectedStory.title_tr || selectedStory.title) : (selectedStory.title_en || selectedStory.title)}
                          className="w-full object-contain bg-transparent" 
                          style={{ maxHeight: '70vh', width: '100%' }}
                          loading="lazy"
                          width={800}
                          height={600}
                        />
                      </CarouselItem>
                      {selectedStory.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <img 
                            src={image} 
                            alt={`${language === 'tr' ? (selectedStory.title_tr || selectedStory.title) : (selectedStory.title_en || selectedStory.title)} ${index + 1}`}
                            className="w-full object-contain bg-transparent" 
                            style={{ maxHeight: '70vh', width: '100%' }}
                            loading="lazy"
                            width={800}
                            height={600}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                ) : (
                  <img 
                    src={selectedStory.image_url} 
                    alt={language === 'tr' ? (selectedStory.title_tr || selectedStory.title) : (selectedStory.title_en || selectedStory.title)}
                    className="w-full object-contain bg-transparent" 
                    style={{ maxHeight: '70vh', width: '100%' }}
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                )}
                <DialogHeader className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <DialogTitle className="text-white">
                    {language === 'tr' ? (selectedStory.title_tr || selectedStory.title) : (selectedStory.title_en || selectedStory.title)}
                  </DialogTitle>
                </DialogHeader>
              </div>
              <div className="p-4">
                <DialogDescription>
                  {language === 'tr' ? (selectedStory.content_tr || selectedStory.content || '') : (selectedStory.content_en || selectedStory.content || '')}
                </DialogDescription>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(StoryRing);