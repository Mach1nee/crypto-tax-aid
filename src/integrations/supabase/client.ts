// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pejtkofyaluozogtakzp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlanRrb2Z5YWx1b3pvZ3Rha3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyODM2NDUsImV4cCI6MjA3NDg1OTY0NX0.W1wKSJmBb3Xzlx1E79y7NcoqTeATR6GX4WF4CMIP39E";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});