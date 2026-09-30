import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Route: AI OCR Analysis via Gemini 3.8 Flash
  app.post('/api/ocr', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', pageIndex = 0 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(200).json({
          success: false,
          fallback: true,
          message: 'GEMINI_API_KEY not configured. Falling back to local OCR engine.',
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Strip data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `Analyze this scanned document page and extract ALL visible text blocks along with their spatial layout and typography formatting.
Return ONLY valid JSON matching this exact schema:
{
  "blocks": [
    {
      "text": "Extracted text content here",
      "x": 45, // percentage from left (0 to 100)
      "y": 12, // percentage from top (0 to 100)
      "width": 60, // percentage width (0 to 100)
      "height": 4, // percentage height (0 to 100)
      "fontSize": 14, // approximate font size in px (e.g. 10 to 32)
      "fontFamily": "Segoe UI", // best match: Segoe UI, Arial, Times New Roman, Courier New, Georgia
      "fontWeight": "normal", // "bold" or "normal"
      "fontStyle": "normal", // "italic" or "normal"
      "textAlign": "left", // "left", "center", or "right"
      "color": "#1e293b" // hex color code
    }
  ],
  "fullText": "Full reconstructed plain text with line breaks",
  "documentType": "contract | invoice | article | letter | medical | form | general",
  "language": "en",
  "confidence": 0.98
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType.includes('png') ? 'image/png' : 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (err) {
        // In case there is markdown wrapper
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response into JSON');
        }
      }

      return res.json({
        success: true,
        data: parsedData,
        pageIndex,
      });
    } catch (error: any) {
      console.error('OCR Processing error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error during OCR',
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    });
  });

  // Mount Vite middleware for dev or serve dist in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
