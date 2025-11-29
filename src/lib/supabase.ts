import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const mockMode = import.meta.env.VITE_MOCK_MODE === 'true';

let supabase;

if (mockMode) {
  console.warn('⚠️ Running in MOCK MODE - Using simulated data');
  supabase = mockSupabase;
} else {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required. Please check your environment variables.');
  }
  
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
export default supabase;