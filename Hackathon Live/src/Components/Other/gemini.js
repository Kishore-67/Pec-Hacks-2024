import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variable or use the direct key as fallback
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyAJPYEF9UY2M50gCr785k-KVVzqRS7CVBg";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const generateContent = async (prompt, type) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Construct safer, more specific prompts
    let systemPrompt = '';
    switch (type) {
      case 'description':
        systemPrompt = `Create a professional and friendly product description for social media marketing. Focus on positive features and benefits. Topic: ${prompt}\n\nGuidelines:\n- Keep it professional and positive\n- Focus on features and benefits\n- Avoid controversial topics\n- Maximum 3 sentences`;
        break;
      case 'caption':
        systemPrompt = `Write a brief, engaging social media caption that's friendly and professional. Topic: ${prompt}\n\nGuidelines:\n- Keep it brief and friendly\n- Use positive language\n- Avoid controversial topics\n- Maximum 2 sentences`;
        break;
      case 'slogan':
        systemPrompt = `Create a short, memorable business slogan that's positive and professional. Topic: ${prompt}\n\nGuidelines:\n- Keep it short and memorable\n- Use positive language\n- Be professional\n- Maximum 1 sentence`;
        break;
      default:
        systemPrompt = `Create professional social media content that's positive and engaging. Topic: ${prompt}\n\nGuidelines:\n- Keep it professional\n- Use positive language\n- Be concise\n- Maximum 2 sentences`;
    }

    // Add safety parameters
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.8,
      maxOutputTokens: 200,
    };

    // Generate content
    console.log('Sending prompt to Gemini:', systemPrompt);
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig,
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    
    // Enhanced error handling
    if (error.message?.includes('SAFETY')) {
      throw new Error('Unable to generate content. Please try different wording or topic.');
    } else if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid API key. Please check your API key configuration.');
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      throw new Error('API access denied. Please check your API key permissions.');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('API quota exceeded. Please try again later.');
    }
    
    // Generic error message as fallback
    throw new Error('Failed to generate content. Please try again.');
  }
};
