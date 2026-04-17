// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 반드시 앞에 'export'가 붙어있어야 합니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);