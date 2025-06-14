
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";

interface BlogHeaderProps {
  title: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  date?: string;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({
  title,
  excerpt,
  coverImage,
  category,
  date
}) => {
  const formattedDate = date ? format(new Date(date), "MMMM dd, yyyy") : "";

  return (
    <div className="bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {coverImage && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              {category && (
                <Badge variant="outline" className="text-primary border-primary">
                  {category}
                </Badge>
              )}
              
              {date && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {formattedDate}
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
            
            {excerpt && (
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {excerpt}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogHeader;
