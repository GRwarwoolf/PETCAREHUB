
import { createClient } from '@supabase/supabase-js';

// Configuration from user input
const supabaseUrl = 'https://qlikajepzxtnxiehoaio.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaWthamVwenh0bnhpZWhvYWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDY3OTcsImV4cCI6MjA3OTQ4Mjc5N30.H3nGW5cSv2iTiVHGTux6zlrgZFC-TZcPpl41urCqjMM';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a Base64 image to Supabase Storage and returns the Public URL.
 * @param folder The folder path (e.g. 'profiles' or 'posts')
 * @param base64Data The image data in base64 format
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (folder: string, base64Data: string): Promise<string | null> => {
  try {
    // 1. Convert Base64 to Blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    
    // 2. Generate a unique filename
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    // 3. Upload to 'pet-photos' bucket
    const { data, error } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, blob, { 
          contentType: 'image/jpeg',
          upsert: true
        });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};
