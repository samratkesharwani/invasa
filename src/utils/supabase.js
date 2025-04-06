import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Add console logging for debugging
console.log('Supabase URL available:', !!supabaseUrl);
console.log('Supabase Key available:', !!supabaseKey);

export const supabase = createClient(supabaseUrl, supabaseKey);

// Add error handler for Supabase
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
});
        