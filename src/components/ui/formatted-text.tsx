
import React from "react";

interface FormattedTextProps {
  text: string;
  className?: string;
  truncate?: number;
}

/**
 * A component that correctly displays text with line breaks (entered with Shift+Enter)
 * and provides optional truncation
 */
const FormattedText: React.FC<FormattedTextProps> = ({ 
  text, 
  className = "", 
  truncate 
}) => {
  if (!text) return null;
  
  // Truncate text if needed
  const processedText = truncate && text.length > truncate
    ? text.substring(0, truncate).trim() + '...'
    : text;
  
  // Split by line breaks and render each paragraph
  const paragraphs = processedText.split('\n');
  
  return (
    <div className={className}>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={i < paragraphs.length - 1 ? "mb-2" : ""}>
          {paragraph}
        </p>
      ))}
    </div>
  );
};

export default FormattedText;
