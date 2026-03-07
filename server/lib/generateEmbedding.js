import axios from 'axios';

export const generateEmbedding = async (text) => {
  try {
    const response = await axios.post(
      'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction',
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data; 
  } catch (error) {
    console.error("Error generating embedding:", error?.response?.data || error.message);
    return null;
  }
};