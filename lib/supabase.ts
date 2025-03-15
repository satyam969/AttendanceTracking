import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'employee' | 'admin';
  created_at: string;
  updated_at: string;
};

export type AttendanceRecord = {
  id: string;
  user_id: string;
  timestamp: string;
  status: 'check_in' | 'check_out';
  screenshot_url: string | null;
  created_at: string;
};