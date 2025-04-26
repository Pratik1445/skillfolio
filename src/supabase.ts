import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbhyhuqwdnaedwxitwmn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaHlodXF3ZG5hZWR3eGl0d21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODUyNTMsImV4cCI6MjA2MTI2MTI1M30.21NSz3J7yoUX35CnTtCTU6wx2o2yfMCbcSWOkxquKX8';

export const supabase = createClient(supabaseUrl, supabaseKey); 
