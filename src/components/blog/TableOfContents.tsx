
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { BookOpenText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface TableOfContentsProps {
  headings: Heading[];
  title?: string;
}

// Function to extract headings from HTML content
const extractHeadings = (content: string): Heading[] => {
  const headingRegex = /<h([1-6])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  const headings: Heading[] = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    // Strip HTML tags to get clean text
    const text = match[3].replace(/<[^>]*>/g, '');
    headings.push({ id, text, level });
  }
  
  return headings;
};

const TableOfContents: React.FC<{ content: string } | TableOfContentsProps> = (props) => {
  const [activeId, setActiveId] = useState<string>('');
  const { language } = useLanguage();
  const defaultTitle = language === 'tr' ? 'İçindekiler' : 'Table of Contents';
  
  // Handle both new and old props format
  let headings: Heading[] = [];
  let title = defaultTitle;
  
  if ('content' in props) {
    // Old format with content string
    headings = extractHeadings(props.content);
  } else {
    // New format with headings array
    headings = props.headings;
    title = props.title || defaultTitle;
  }
  
  useEffect(() => {
    if (headings.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      // Adjust the root margin for better accuracy
      { rootMargin: '0px 0px -70% 0px', threshold: [0.1, 0.5, 1] }
    );
    
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });
    
    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);
  
  if (headings.length === 0) return null;
  
  return (
    <nav 
      className="glass-card rounded-xl p-5 shadow-md" 
      aria-labelledby="toc-heading"
    >
      <h2 id="toc-heading" className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
        <BookOpenText className="h-5 w-5 mr-2 text-primary" aria-hidden="true" />
        <span>{title}</span>
      </h2>
      <div className="toc">
        <ol className="space-y-1 max-h-[50vh] overflow-y-auto pr-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                "transition-colors text-sm",
                heading.level === 1 && "pl-0",
                heading.level === 2 && "pl-2",
                heading.level === 3 && "pl-4",
                heading.level === 4 && "pl-6",
                heading.level === 5 && "pl-8",
                heading.level === 6 && "pl-10",
                activeId === heading.id
                  ? "text-primary font-medium border-l-2 border-primary pl-[calc(0.25rem+var(--indent,0rem))]"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-l-2 border-transparent pl-[calc(0.25rem+var(--indent,0rem))]"
              )}
              style={{ '--indent': `${(heading.level - 1) * 0.5}rem` } as React.CSSProperties}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    // Smooth scroll with offset for fixed header
                    const yOffset = -80; 
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({
                      top: y,
                      behavior: "smooth"
                    });
                    
                    // Update URL hash without jumping
                    window.history.pushState(null, '', `#${heading.id}`);
                    
                    // Set active ID
                    setActiveId(heading.id);
                  }
                }}
                className="block py-1"
                aria-current={activeId === heading.id ? "location" : undefined}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default TableOfContents;
