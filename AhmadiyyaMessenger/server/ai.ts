
import { storage } from './storage';
import { findRelevantKnowledge } from './bot/knowledge';
import fetch from 'node-fetch';

export async function getAIResponse(query: string): Promise<string> {
  // First check knowledge base for relevant info
  const knowledge = await findRelevantKnowledge(query);

  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error('Hugging Face API key is not configured');
    }

    const prompt = `You are a friendly Ahmadiyya Muslim AI assistant with a warm personality and occasional light humor. 
    ${knowledge ? `Here is some relevant context: ${knowledge.answer}` : ''}
    
    Question: ${query}
    
    Respond naturally as a knowledgeable and friendly Ahmadi, avoiding any scripted templates. Use your personality but stay respectful.
    Answer:`;

    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        },
        wait_for_model: true
      })
    });

    if (!response.ok) {
      console.error('Hugging Face API error:', await response.text());
      if (response.status === 404) {
        return "I apologize, but I'm currently having trouble accessing my knowledge. Please try asking your question again.";
      }
      if (response.status === 503) {
        return "The AI model is currently loading. Please try again in a few moments.";
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.generated_text || "I apologize, I wasn't able to generate a response.";

  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, I'm having temporary technical difficulties. Please try again shortly.";
  }
}
