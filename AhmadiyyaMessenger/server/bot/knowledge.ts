import { KnowledgeBase } from "@shared/schema";
import { storage } from "../storage";

// Utility function to calculate similarity score between two strings
// This is a simple implementation of cosine similarity using term frequency
function calculateSimilarity(str1: string, str2: string): number {
  // Convert strings to lowercase and split into words
  const words1 = str1.toLowerCase().split(/\W+/);
  const words2 = str2.toLowerCase().split(/\W+/);
  
  // Count word frequencies
  const freqMap1: Record<string, number> = {};
  const freqMap2: Record<string, number> = {};
  
  words1.forEach(word => {
    if (word) freqMap1[word] = (freqMap1[word] || 0) + 1;
  });
  
  words2.forEach(word => {
    if (word) freqMap2[word] = (freqMap2[word] || 0) + 1;
  });
  
  // Find unique words from both strings
  const uniqueWords = new Set([...Object.keys(freqMap1), ...Object.keys(freqMap2)]);
  
  // Calculate dot product
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  uniqueWords.forEach(word => {
    const freq1 = freqMap1[word] || 0;
    const freq2 = freqMap2[word] || 0;
    
    dotProduct += freq1 * freq2;
    magnitude1 += freq1 * freq1;
    magnitude2 += freq2 * freq2;
  });
  
  // Calculate cosine similarity
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

// Function to find the most relevant knowledge base entry for a given query
export async function findRelevantKnowledge(query: string, threshold = 0.3): Promise<KnowledgeBase | null> {
  // Get all knowledge base entries
  const entries = await storage.getKnowledgeBaseEntries();
  
  // Check for exact matches first (direct hits on important keywords)
  const directMatch = entries.find(entry => {
    const keywordMatch = entry.tags?.some(tag => 
      query.toLowerCase().includes(tag.toLowerCase())
    );
    
    const topicMatch = query.toLowerCase().includes(entry.topic.toLowerCase());
    
    return keywordMatch || topicMatch;
  });
  
  if (directMatch) return directMatch;
  
  // Calculate similarity scores between query and questions in knowledge base
  const scoredEntries = entries.map(entry => {
    const similarity = calculateSimilarity(query, entry.question);
    return { entry, similarity };
  });
  
  // Sort entries by similarity score (descending)
  scoredEntries.sort((a, b) => b.similarity - a.similarity);
  
  // Return the most similar entry if it exceeds the threshold
  if (scoredEntries.length > 0 && scoredEntries[0].similarity >= threshold) {
    return scoredEntries[0].entry;
  }
  
  return null;
}

// Function to get entries by category
export async function getEntriesByCategory(category: string): Promise<KnowledgeBase[]> {
  return storage.getKnowledgeBaseEntriesByCategory(category);
}

// Function to get entries by topic
export async function getEntriesByTopic(topic: string): Promise<KnowledgeBase[]> {
  return storage.getKnowledgeBaseEntriesByTopic(topic);
}

// Function to search the knowledge base
export async function searchKnowledge(query: string): Promise<KnowledgeBase[]> {
  return storage.searchKnowledgeBase(query);
}

// Function to get random entry from a category
export async function getRandomEntry(category?: string): Promise<KnowledgeBase | null> {
  let entries: KnowledgeBase[];
  
  if (category) {
    entries = await storage.getKnowledgeBaseEntriesByCategory(category);
  } else {
    entries = await storage.getKnowledgeBaseEntries();
  }
  
  if (entries.length === 0) return null;
  
  // Pick a random entry
  const randomIndex = Math.floor(Math.random() * entries.length);
  return entries[randomIndex];
}
