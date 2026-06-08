
// Gerado automaticamente — não editar manualmente
const SUPABASE_URL = 'https://ojpybmecisnksdemcyiz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcHlibWVjaXNua3NkZW1jeWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MDE5NTcsImV4cCI6MjA5NjM3Nzk1N30.l4K29O_HvxWOasVMhjV29t5ospMKpqEecIDIMn7-HsA';

let supabaseClient;
if (typeof createClient !== 'undefined') {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
} else if (window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

window.supabaseClient = supabaseClient;
