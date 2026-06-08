const fs = require('fs')
const path = require('path')

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Erro: SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias.')
  process.exit(1)
}

const content = `
// Gerado automaticamente — não editar manualmente
const SUPABASE_URL = '${url}';
const SUPABASE_KEY = '${key}';

let supabaseClient;
if (typeof createClient !== 'undefined') {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
} else if (window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

window.supabaseClient = supabaseClient;
`

const outPath = path.join(__dirname, '..', 'supabase-config.js')
fs.writeFileSync(outPath, content)
console.log('supabase-config.js gerado com sucesso.')
