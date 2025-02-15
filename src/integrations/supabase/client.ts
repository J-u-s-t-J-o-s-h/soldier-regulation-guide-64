
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://itpxmeubngbujagmyakc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cHhtZXVibmdidWphZ215YWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NzcyMjgsImV4cCI6MjA1NTE1MzIyOH0.A7eNA-K_B4ohOB3laDPuhVunvq_rlDOgcIhZ4aOmCyI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
