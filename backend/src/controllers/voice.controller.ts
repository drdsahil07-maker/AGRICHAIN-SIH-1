import { Request, Response } from 'express';
import { getGeminiClient } from '../utils/gemini';

export const processVoice = async (req: Request, res: Response) => {
  const { transcript = '' } = req.body;
  const client = getGeminiClient();

  if (client && transcript) {
    try {
      const prompt = `You are AgriMitra, an Indian agricultural AI assistant. Extract structured harvest declaration data from this farmer's voice transcript: "${transcript}".
Respond with strict JSON only:
{
  "crop": "English name of crop (e.g., Tomato, Onion, Potato, Garlic)",
  "quantityKg": number,
  "sellingWindow": "short phrase like 'Today', 'Tomorrow morning', '3 days'",
  "minAcceptablePrice": number (in INR/kg),
  "farmerIntent": "confirmed" | "needs_clarification",
  "hindiReply": "Friendly reply in polite Hindi/Hinglish acknowledging details"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({ success: true, extracted: parsed });
      }
    } catch (err) {
      console.warn("Gemini transcript processing error, using robust Hinglish extractor:", err);
    }
  }

  // Heuristic Hinglish extractor
  const lower = transcript.toLowerCase();
  let crop = 'Tomato';
  if (lower.includes('pyaz') || lower.includes('onion')) crop = 'Onion';
  else if (lower.includes('aloo') || lower.includes('potato')) crop = 'Potato';
  else if (lower.includes('lahsun') || lower.includes('garlic')) crop = 'Garlic';

  const qtyMatch = lower.match(/(\d+)\s*(kg|kilo|kilos|quintal|kunte|quental)?/);
  let quantityKg = qtyMatch ? parseInt(qtyMatch[1], 10) : 100;
  if (lower.includes('quintal') || lower.includes('quental')) quantityKg *= 100;

  const priceMatch = lower.match(/(\d+)\s*(rupaye|rs|rupees|\/kg|bhav)/) || lower.match(/bhav\s*(\d+)/);
  const minAcceptablePrice = priceMatch ? parseInt(priceMatch[1], 10) : 12;

  res.json({
    success: true,
    extracted: {
      crop,
      quantityKg,
      sellingWindow: lower.includes('kal') ? 'Tomorrow Morning' : 'Today Afternoon',
      minAcceptablePrice,
      farmerIntent: 'confirmed',
      hindiReply: `Ram-ram ji! Aapke ${quantityKg} kg ${crop} ka entry taiyyar hai, minimum bhav ₹${minAcceptablePrice}/kg.`
    }
  });
};

export const simulateCall = (req: Request, res: Response) => {
  const { farmerName = 'Ramesh Patel', crop = 'Tomato', quantityKg = 100, step = 1 } = req.body;

  const callScript = [
    {
      speaker: 'AI Assistant (AgriMitra)',
      text: `Namaste ${farmerName} ji! Main AgriChain se aapka AI Calling Assistant AgriMitra bol raha hoon.`,
      audioPrompt: 'Greeting'
    },
    {
      speaker: 'AI Assistant (AgriMitra)',
      text: `Ramesh ji, aaj aapke khet mein kaun sa crop (fasal) taiyyar hai bechne ke liye?`,
      audioPrompt: 'Ask Crop'
    },
    {
      speaker: farmerName,
      text: `Bhaiya hamare paas ${crop} (Tamatar) taiyyar hai.`,
      isFarmer: true
    },
    {
      speaker: 'AI Assistant (AgriMitra)',
      text: `Bahut achha! Aur ${crop} ka kitna amount (quantity / wazan) hai aapke paas bechne ke liye?`,
      audioPrompt: 'Ask Quantity'
    },
    {
      speaker: farmerName,
      text: `Lagbhag ${quantityKg} kilo hai, kal subah tak harvest ho jayega.`,
      isFarmer: true
    },
    {
      speaker: 'AI Assistant (AgriMitra)',
      text: `Theek hai. Ramesh ji, aapka minimum price (kam se kam bhav) kya hona chahiye prati kilo taaki aapko pura munafa mile?`,
      audioPrompt: 'Ask Minimum Price'
    },
    {
      speaker: farmerName,
      text: `Kam se kam 14 rupaye kilo bhav milna chahiye. Mandi mein vyapari kam bol raha hai.`,
      isFarmer: true
    },
    {
      speaker: 'AI Assistant (AgriMitra)',
      text: `Bilkul Ramesh ji! Main turant aapke ${quantityKg} kg ${crop} ke liye Indore ke direct buyers, shared return-trucks aur transparent aggregators compile kar raha hoon.`,
      audioPrompt: 'Confirmation & Compile'
    }
  ];

  res.json({
    success: true,
    callId: `CALL-${Date.now()}`,
    farmerName,
    status: 'completed',
    durationSeconds: 28,
    script: callScript,
    extractedHarvest: {
      crop,
      quantityKg,
      minAcceptablePrice: 14,
      sellingWindow: 'Tomorrow Morning',
      location: 'Sanwer (Cluster A), Indore'
    }
  });
};
