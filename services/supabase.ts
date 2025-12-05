import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjazybbggkhukwwwyxiz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqYXp5YmJnZ2todWt3d3d5eGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTIzNzcsImV4cCI6MjA4MDUyODM3N30.tZJTKYDlaW-lQWmJY9WJCEZoqG4KPaO5DteFW1QNE1M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);