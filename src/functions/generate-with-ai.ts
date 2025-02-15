
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export async function generateWithAI(prompt: string, userId: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.functions.invoke('generate-with-ai', {
      body: { prompt, userId }
    });

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Error in generate-with-ai function:', error);
    throw error;
  }
}
