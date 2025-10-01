import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://pejtkofyaluozogtakzp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlanRrb2Z5YWx1b3pvZ3Rha3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyODM2NDUsImV4cCI6MjA3NDg1OTY0NX0.W1wKSJmBb3Xzlx1E79y7NcoqTeATR6GX4WF4CMIP39E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});