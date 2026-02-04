
// Configuração do Supabase
// VOCÊ PRECISA SUBSTITUIR ESSAS CHAVES PELAS SUAS DO SUPABASE DASHBOARD
const SUPABASE_URL = 'SUPABASE_URL_PLACEHOLDER';
const SUPABASE_KEY = 'SUPABASE_ANON_KEY_PLACEHOLDER';

// Inicializa o cliente apenas se a biblioteca estiver carregada
let supabaseClient;
if (typeof createClient !== 'undefined') {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
} else if (window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Garante que esteja acessível globalmente
window.supabaseClient = supabaseClient;
