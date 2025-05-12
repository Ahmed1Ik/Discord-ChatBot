// Simple NLP utilities for processing and understanding user queries

// Extract key topic from a query
export function extractTopic(query: string): string | null {
  // Remove common question phrases and punctuation
  const cleanQuery = query
    .toLowerCase()
    .replace(/what is|who is|tell me about|can you explain|how|why|when|where|what do ahmadis believe about|what does ahmadiyya say about/g, '')
    .replace(/\?|\.|,|!|'|"|;|:|\/|\\/g, '')
    .trim();
    
  // Split into words
  const words = cleanQuery.split(/\s+/);
  
  // Filter out common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'about', 'of', 'by', 'from', 'as', 'into', 'through', 'during', 'after',
    'before', 'above', 'below', 'since', 'yes', 'no', 'not'
  ]);
  
  const filteredWords = words.filter(word => !stopWords.has(word) && word.length > 2);
  
  // If no significant words remain, return null
  if (filteredWords.length === 0) return null;
  
  // Return the longest remaining word (often a key topic)
  return filteredWords.sort((a, b) => b.length - a.length)[0];
}

// Determine query type (e.g., who, what, when, where, why, how)
export function getQueryType(query: string): string {
  const lowerQuery = query.toLowerCase().trim();
  
  if (lowerQuery.startsWith('who')) return 'who';
  if (lowerQuery.startsWith('what')) return 'what';
  if (lowerQuery.startsWith('when')) return 'when';
  if (lowerQuery.startsWith('where')) return 'where';
  if (lowerQuery.startsWith('why')) return 'why';
  if (lowerQuery.startsWith('how')) return 'how';
  
  // Default to 'what' if the query type cannot be determined
  return 'what';
}

// Check if a query is related to Ahmadiyya
export function isAhmadiyyaRelated(query: string): boolean {
  const keywords = [
    'ahmadiyya', 'ahmadi', 'ahmadis', 'mirza ghulam ahmad', 'qadian', 'khalifa',
    'khilafat', 'promised messiah', 'mahdi', 'jamaat', 'community', 'rabwah',
    'muslim television ahmadiyya', 'mta', 'review of religions', 'promised reformer',
    'mirza tahir ahmad', 'mirza masroor ahmad'
  ];
  
  const lowerQuery = query.toLowerCase();
  
  // Check if any keyword is present in the query
  return keywords.some(keyword => lowerQuery.includes(keyword));
}

// Format the response based on the config
export function formatResponse(
  answer: string, 
  source?: string | null, // Accept null or undefined
  includeCitation: boolean = true
): string {
  let response = answer;
  
  // Add citation if provided and enabled
  if (source && includeCitation) {
    response += `\n\nSource: ${source}`;
  }
  
  return response;
}

// Get the most relevant terms for knowledge search
export function getSearchTerms(query: string): string[] {
  // Remove common question words and punctuation
  const cleanQuery = query
    .toLowerCase()
    .replace(/what is|who is|tell me about|can you explain|how|why|when|where/g, '')
    .replace(/\?|\.|,|!|'|"|;|:|\/|\\/g, '')
    .trim();
    
  // Split into words
  const words = cleanQuery.split(/\s+/);
  
  // Filter out common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'about', 'of', 'by', 'from', 'as', 'into', 'through', 'during', 'after',
    'before', 'above', 'below', 'since', 'yes', 'no', 'not', 'please', 'tell',
    'me', 'i', 'we', 'you', 'they', 'he', 'she', 'it', 'this', 'that', 'these',
    'those', 'am', 'is', 'are', 'was', 'were', 'be', 'being', 'been', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
    'may', 'might', 'must', 'can', 'could'
  ]);
  
  return words
    .filter(word => !stopWords.has(word) && word.length > 2)
    .slice(0, 5); // Return top 5 most relevant terms
}
