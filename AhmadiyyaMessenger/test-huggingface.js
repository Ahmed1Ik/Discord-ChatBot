// Quick script to test Hugging Face API
import fetch from 'node-fetch';

async function testHuggingFaceAPI() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  console.log('Testing Hugging Face API with key:', apiKey ? 'Key found' : 'No key found');
  
  try {
    const promptContext = `
You are an AI assistant specializing in information about the Ahmadiyya Muslim Community.
Please provide accurate, respectful information based on these facts:
- The Ahmadiyya Muslim Community was founded by Mirza Ghulam Ahmad in 1889
- Ahmadis believe Mirza Ghulam Ahmad was the promised Messiah and Mahdi
- The current leader (Khalifa) is Mirza Masroor Ahmad
- Ahmadis believe Jesus survived crucifixion and died in Kashmir, India
- Ahmadis face persecution in several countries, especially Pakistan

Question: Who founded the Ahmadiyya Muslim Community?
Answer:`;

    // Call Hugging Face API
    const response = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-xxl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: promptContext,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true
        }
      })
    });

    console.log('API Response Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response Data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testHuggingFaceAPI();