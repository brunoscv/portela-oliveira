// Arquivo de exemplo — copie para supabase-config.js e preencha com suas credenciais
// O arquivo supabase-config.js está no .gitignore e NÃO deve ser commitado
//
// Em produção (Netlify), o arquivo é gerado automaticamente via:
//   node scripts/generate-supabase-config.js
// usando as env vars SUPABASE_URL e SUPABASE_ANON_KEY do painel do Netlify.

const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'
const SUPABASE_KEY = 'SUA-ANON-KEY-AQUI'

let supabaseClient;
if (typeof createClient !== 'undefined') {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
} else if (window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

window.supabaseClient = supabaseClient;
