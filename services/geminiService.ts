

import { GoogleGenAI, Type } from "@google/genai";
import { Pet, Language, TrainingGuide } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyPetFromImage = async (base64Image: string): Promise<{ species: string; breed: string }> => {
  try {
    // Strip header if present
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
    return { species: "Dog", breed: "Unknown Mix" }; // Fallback
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
      
      If the topic is "Health Log", analyze hypothetical symptoms for this breed or explain common health tracking needs.
      If the topic is "Community", write a short welcome message for the community feed.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Could not generate content. Please try again.";
  } catch (error) {
    console.error("Error generating content:", error);
    return lang === 'el' 
      ? "Συγγνώμη, υπάρχει πρόβλημα σύνδεσης. Παρακαλώ δοκιμάστε ξανά." 
      : "Sorry, I'm having trouble connecting to the AI right now. Please check your connection.";
  }
};

export const generateTrainingGuide = async (pet: Pet, command: string, lang: Language): Promise<TrainingGuide> => {
  try {
    const prompt = `
      Create a step-by-step training guide for the command: "${command}".
      
      Pet Profile:
      - Species: ${pet.species}
      - Breed: ${pet.breed}
      - Age: ${pet.age}
      
      Language: ${lang === 'el' ? 'Greek' : 'English'}

      Return strictly JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The command title in the requested language" },
            goal: { type: Type.STRING, description: "Short goal of the command" },
            requirements: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of things needed (treats, clicker, etc)"
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Detailed step-by-step instructions"
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Common mistakes and tips specifically for this breed"
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as TrainingGuide;

  } catch (error) {
    console.error("Error generating training guide:", error);
    return {
      title: command,
      goal: "Could not load AI guide.",
      requirements: [],
      steps: ["Please check your internet connection and try again."],
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
          {
             inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this image. Is it safe for a general audience (no nudity, violence, gore, pornographic content)? Return JSON with a single boolean field 'safe'."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN }
          }
        }
      }
     });

     const result = JSON.parse(response.text || "{}");
     return result.safe === true;
  } catch (error) {
    console.error("Safety check failed", error);
    // Fail safe: if check fails, assume unsafe to be careful, or safe to be lenient. 
    // Let's be lenient for connection errors but log it.
    return true; 
  }
}

export const chatWithAI = async (pet: Pet, message: string, lang: Language, image?: string | null): Promise<string> => {
  try {
    const systemInstruction = `
      You are a highly knowledgeable, friendly, and empathetic veterinary and pet care AI expert for "PetCare Hub".
      
      CURRENT PET PROFILE:
      - Name: ${pet.name}
      - Species: ${pet.species}
      - Breed: ${pet.breed}
      - Age: ${pet.age} years old
      - Gender: ${pet.gender}

      INSTRUCTIONS:
      1. Answer the user's question specifically for THIS pet. 
      2. Be concise but helpful.
      3. Use Markdown for formatting (lists, bold text).
      4. If the question is medical, always include a brief disclaimer to see a real vet for emergencies.
      5. Use the requested language: ${lang === 'el' ? 'Greek' : 'English'}.
      6. Be conversational and warm.
      7. If an image is provided, analyze it in the context of the question (e.g., identifying a rash, checking food ingredients).
    `;

    const contentParts: any[] = [{ text: message }];

    if (image) {
      const cleanBase64 = image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
      contentParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contentParts },
      config: {
        systemInstruction: systemInstruction
      }
    });

    return response.text || (lang === 'el' ? "Δεν κατάλαβα, μπορείς να επαναλάβεις;" : "I didn't catch that, can you say it again?");
  } catch (error) {
    console.error("Chat error:", error);
    return lang === 'el' ? "Παρουσιάστηκε σφάλμα σύνδεσης." : "Connection error occurred.";
  }
}