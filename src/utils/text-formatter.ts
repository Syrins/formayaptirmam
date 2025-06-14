
/**
 * Format text content to properly handle line breaks in the content
 * This utility helps to properly render text that contains line breaks (entered with Shift+Enter)
 * in content editing forms
 * 
 * @param text The text content with potential line breaks
 * @returns An array of React elements representing paragraphs
 */
export const formatTextWithLineBreaks = (text: string) => {
  if (!text) return [];
  
  const paragraphs = text.split('\n').filter(line => line.trim() !== '');
  
  return paragraphs.map((paragraph, i) => ({
    key: `p-${i}`,
    content: paragraph
  }));
};

/**
 * Format text for display in HTML, preserving line breaks
 * 
 * @param text The text content with potential line breaks
 * @returns String with line breaks converted to <br> tags
 */
export const formatTextForHtml = (text: string) => {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
};

/**
 * Safely truncate text while preserving whole words
 * 
 * @param text The text to truncate
 * @param maxLength The maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space within the limit
  const lastSpace = text.substring(0, maxLength).lastIndexOf(' ');
  
  // If no space is found, just cut at maxLength
  const truncated = lastSpace > 0 ? text.substring(0, lastSpace) : text.substring(0, maxLength);
  
  return `${truncated}...`;
};
