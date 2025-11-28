import { GoogleGenAI, Type } from "@google/genai";
import { Pet, Language, TrainingGuide } from "../types";

// Initialize the client using process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyPetFromImage = async (base64Image: string): Promise<{ species: string; breed: string }> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this image. Identify if it is a dog or a cat and the specific breed. Return ONLY valid JSON with keys: 'species' (values: 'Dog' or 'Cat') and 'breed' (string). If it's not a cat or dog, return species 'Other'.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                species: { type: Type.STRING },
                breed: { type: Type.STRING }
            }
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error identifying pet:", error);
    return { species: "Dog", breed: "Unknown Mix" };
  }
};

export const generatePetContent = async (pet: Pet, topic: string, lang: Language): Promise<string> => {
  try {
    const prompt = `
      You are an expert veterinarian and pet trainer assistant for "PetCare Hub".
      
      Pet Profile:
      - Name: ${pet.name}
      - Species: ${pet.species}
      - Breed: ${pet.breed}
      - Age: ${pet.age} years old
      - Gender: ${pet.gender}

      Topic: ${topic}
      Language: ${lang === 'el' ? 'Greek (Ελληνικά)' : 'English'}

      Please provide detailed, personalized, friendly, and scientifically accurate advice regarding the Topic for this specific pet. 
      Use Markdown formatting. Use emojis to make it fun. 
      Structure the response with clear headings.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Could not generate content.";
  } catch (error) {
    console.error("Error generating content:", error);
    return lang === 'el' ? "Σφάλμα σύνδεσης." : "Connection error.";
  }
};

export const generateTrainingGuide = async (pet: Pet, command: string, lang: Language): Promise<TrainingGuide> => {
  try {
    const prompt = `
      Create a step-by-step training guide for the command: "${command}".
      Pet: ${pet.species}, ${pet.breed}, ${pet.age}yo.
      Language: ${lang === 'el' ? 'Greek' : 'English'}
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            goal: { type: Type.STRING },
            requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as TrainingGuide;

  } catch (error) {
    return {
      title: command,
      goal: "Error loading guide.",
      requirements: [],
      steps: ["Please check connection."],
      tips: []
    };
  }
}

export const validateImageSafety = async (base64Image: string): Promise<boolean> => {
  try {
     const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "Is this image safe (no nudity/violence)? Return JSON boolean 'safe'." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { safe: { type: Type.BOOLEAN } }
        }
      }
     });
     const result = JSON.parse(response.text || "{}");
     return result.safe === true;
  } catch (error) {
    return true; 
  }
}

export const chatWithAI = async (pet: Pet, message: string, lang: Language, image?: string | null): Promise<string> => {
  try {
    const systemInstruction = `
      You are a vet expert for "PetCare Hub".
      Pet: ${pet.name}, ${pet.species}, ${pet.breed}, ${pet.age}yo.
      Lang: ${lang === 'el' ? 'Greek' : 'English'}.
      Be concise, helpful, friendly.
    `;

    const contentParts: any[] = [{ text: message }];
    if (image) {
      const cleanBase64 = image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
      contentParts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64 } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contentParts },
      config: { systemInstruction }
    });

    return response.text || "Error.";
  } catch (error) {
    return lang === 'el' ? "Σφάλμα σύνδεσης." : "Connection error.";
  }
}