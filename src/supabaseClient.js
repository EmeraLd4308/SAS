import { createClient } from '@supabase/supabase-js';

// Отримання змінних середовища через імпорт.meta.env
// (Стандартний механізм для Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ініціалізація клієнта Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
