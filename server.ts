import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON bodies (up to 50mb for image base64 payloads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side initialization of Gemini Client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Text / Concept Generation & Prompt Enhancement
app.post('/api/ai/generate-text', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction
        ? { systemInstruction }
        : undefined,
    });

    return res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Error generating text:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate text content',
    });
  }
});

// 2. Multimodal Image Analysis & Color Grade / Auto-Enhance Recommendations
app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', task = 'auto-enhance' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const ai = getGeminiClient();

    let promptText = '';
    if (task === 'auto-enhance') {
      promptText = `You are a world-class colorist and professional photo studio engineer. Analyze this image and recommend ideal adjustments to make it look stunning.
Return ONLY valid JSON with this exact schema (no markdown, no backticks):
{
  "brightness": <number between -50 and 50>,
  "contrast": <number between -50 and 50>,
  "saturation": <number between -50 and 50>,
  "temperature": <number between -50 and 50>,
  "highlights": <number between -50 and 50>,
  "shadows": <number between -50 and 50>,
  "sharpness": <number between 0 and 50>,
  "vignette": <number between 0 and 40>,
  "title": "<Short 2-3 word vibe name>",
  "explanation": "<2 sentence explanation of what changes will enhance this photo best>"
}`;
    } else if (task === 'critique') {
      promptText = `You are an expert photography critic and creative director.
Critique this image. Provide:
1. Composition analysis (rule of thirds, leading lines, framing)
2. Lighting & tonal evaluation
3. Color balance review
4. 3 actionable tips for taking a better shot next time.
Keep your response concise, encouraging, and highly professional.`;
    } else if (task === 'caption') {
      promptText = `You are an expert social media and editorial curator. Provide 4 catchy, creative social media captions with relevant hashtags for this photo. One aesthetic/minimalist, one poetic, one witty, and one story-driven.`;
    } else {
      promptText = 'Analyze this image and describe its key visual elements, aesthetic mood, and dominant color palette.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
    });

    const responseText = response.text || '';
    if (task === 'auto-enhance') {
      try {
        // Parse JSON output
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        return res.json({
          result: parsed,
          rawText: responseText,
        });
      } catch {
        return res.json({
          result: null,
          rawText: responseText,
        });
      }
    }

    return res.json({ text: responseText });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze image with Gemini AI',
    });
  }
});

// 3. AI Smart Visual Asset & Image Generation Proxy
app.post('/api/ai/generate-visual', async (req, res) => {
  try {
    const { prompt, style = 'photorealistic' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();

    // Use Gemini 3.8 Flash to synthesize high quality svg / canvas visual composition or descriptive blueprint
    const expandedPrompt = `You are an elite creative design director.
Generate a complete, vibrant SVG illustration for the prompt: "${prompt}".
Style: ${style}.
Guidelines:
- Return ONLY valid XML SVG code starting with <svg and ending with </svg>.
- Ensure width="800" height="600" viewBox="0 0 800 600".
- Use rich modern gradients, layered shapes, crisp vectors, and harmonious colors.
- Do NOT wrap in markdown backticks. Return raw SVG only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: expandedPrompt,
    });

    const svgText = (response.text || '')
      .replace(/^```(xml|svg)?/i, '')
      .replace(/```$/i, '')
      .trim();

    return res.json({ svg: svgText });
  } catch (error: any) {
    console.error('Error generating visual:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate visual asset',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev, attach Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zoro Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
