import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ydvwwzmddodhkwtdvru.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6OvlwqZptEzAr4PgXu69qw_lr_4mEDF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
