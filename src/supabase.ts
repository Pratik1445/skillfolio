import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gppvgxomaviiezxsaasu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcHZneG9tYXZpaWV6eHNhYXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NDQ4NDcsImV4cCI6MjA1MjUyMDg0N30.xceU3reGBywt4OM8jmDV_EeiAOxPiEoY1805m944Kvw';

export const supabase = createClient(supabaseUrl, supabaseKey); 