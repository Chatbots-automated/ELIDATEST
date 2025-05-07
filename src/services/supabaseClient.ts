import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://zanwanuojruywxdyxavv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbndhbnVvanJ1eXd4ZHl4YXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjk5MTIsImV4cCI6MjA2MTk0NTkxMn0.XbiFOgQGw-6KjaWtcHa-l1gAIMWRFtWXycBG7Y4EDOY'
);