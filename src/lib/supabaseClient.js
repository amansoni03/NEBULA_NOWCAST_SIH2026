import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://frtcdfzpnlgqixxdbash.supabase.co';
const supabaseClientKey = import.meta.env.VITE_SUPABASE_CLIENT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydGNkZnpwbmxncWl4eGRiYXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDc3OTcsImV4cCI6MjEwMjM4Mzc5N30.ZU292jnz7-r_NHJ5Z-6QQL9HIki-kalFamuOf2brBBU';

export const supabase = createClient(supabaseUrl, supabaseClientKey);
