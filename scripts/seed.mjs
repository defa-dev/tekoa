/**
 * Seed de demonstração do Tekoa.
 *
 * Cria alguns vizinhos e popula serviços (trocas), produtos (feira) e avisos
 * (mural) de uma comunidade fictícia — o Jardim das Acácias.
 *
 * Idempotente: re-executar limpa o conteúdo dos usuários-semente e recria.
 * Usa a chave secreta (service role) para inserir ignorando RLS.
 *
 * Uso:  node scripts/seed.mjs
 */

import { readFileSync } from 'node:fs'

// --- carrega .env.local ---
const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2]
}
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const SECRET = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !SECRET) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const authHeaders = {
  apikey: SECRET,
  Authorization: `Bearer ${SECRET}`,
  'Content-Type': 'application/json',
}

async function rest(path, init = {}) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    ...init,
    headers: { ...authHeaders, Prefer: 'return=representation', ...(init.headers || {}) },
  })
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  if (!res.ok) {
    throw new Error(`${init.method || 'GET'} ${path} → ${res.status}: ${text}`)
  }
  return body
}

/** Cria (ou recupera) um usuário confirmado e devolve o id. */
async function ensureUser(email, password, fullName, location) {
  // tenta criar
  const res = await fetch(`${URL_}/auth/v1/admin/users`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  })
  let id
  if (res.ok) {
    id = (await res.json()).id
  } else {
    // já existe: busca na lista
    const list = await fetch(`${URL_}/auth/v1/admin/users?per_page=200`, { headers: authHeaders })
    const data = await list.json()
    const found = (data.users || []).find((u) => u.email === email)
    if (!found) throw new Error(`Não consegui criar nem encontrar ${email}`)
    id = found.id
  }
  // garante perfil com bairro
  await rest(`users?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ full_name: fullName, location }),
  })
  return id
}

async function main() {
  const BAIRRO = 'Jardim das Acácias'
  console.log('→ criando vizinhos...')
  const maria = await ensureUser('maria@tekoa.test', 'tekoa123', 'Maria Silva', BAIRRO)
  const joao = await ensureUser('joao@tekoa.test', 'tekoa123', 'João Pereira', BAIRRO)
  const cida = await ensureUser('cida@tekoa.test', 'tekoa123', 'Dona Cida', BAIRRO)
  const seedUsers = [maria, joao, cida]

  console.log('→ limpando conteúdo anterior dos vizinhos-semente...')
  const inList = `(${seedUsers.join(',')})`
  await rest(`mural_posts?user_id=in.${inList}`, { method: 'DELETE' })
  await rest(`products?user_id=in.${inList}`, { method: 'DELETE' })
  // chats/messages referenciam services; apaga primeiro chats desses usuários
  await rest(`chats?or=(participant_1.in.${inList},participant_2.in.${inList})`, { method: 'DELETE' })
  await rest(`services?user_id=in.${inList}`, { method: 'DELETE' })

  console.log('→ inserindo serviços (trocas)...')
  await rest('services', {
    method: 'POST',
    body: JSON.stringify([
      {
        user_id: maria, type: 'request', category: 'aulas', proximity: 5,
        title: 'Procuro aulas de violão',
        description: 'Quero aprender violão do zero, de preferência aos fins de semana aqui no bairro.',
      },
      {
        user_id: maria, type: 'offer', category: 'cozinha', proximity: 5,
        title: 'Faço bolos e salgados por encomenda',
        description: 'Bolos caseiros, coxinhas e empadas para festas e encontros. Encomende com 2 dias.',
      },
      {
        user_id: joao, type: 'offer', category: 'aulas', proximity: 10,
        title: 'Dou aulas de violão e teoria musical',
        description: 'Músico há 15 anos, ensino violão para iniciantes com paciência e repertório popular.',
      },
      {
        user_id: joao, type: 'request', category: 'cozinha', proximity: 5,
        title: 'Quem faz doces para festa de aniversário?',
        description: 'Preciso de brigadeiros e um bolo para a festa da minha filha no próximo mês.',
      },
      {
        user_id: cida, type: 'offer', category: 'reparos', proximity: 5,
        title: 'Conserto elétrico residencial',
        description: 'Tomadas, chuveiros, disjuntores e fiação. Atendo a vizinhança com preço justo.',
      },
      {
        user_id: cida, type: 'request', category: 'transporte', proximity: 10,
        title: 'Preciso de frete pequeno no sábado',
        description: 'Mudança de poucos móveis dentro do bairro, alguém com carrinho ou van?',
      },
    ]),
  })

  console.log('→ inserindo produtos (feira)...')
  await rest('products', {
    method: 'POST',
    body: JSON.stringify([
      {
        user_id: cida, category: 'moveis', condition: 'good', price: 150, status: 'available', location: BAIRRO,
        title: 'Sofá 2 lugares', description: 'Sofá de tecido marrom, bem conservado, marca pouca de uso. Retirar no local.',
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
      },
      {
        user_id: joao, category: 'eletronicos', condition: 'like_new', price: 80, status: 'available', location: BAIRRO,
        title: 'Caixa de som bluetooth', description: 'Caixa portátil, bateria boa, acompanha cabo. Usei poucas vezes, está como nova.',
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
      },
      {
        user_id: maria, category: 'vestuario', condition: 'good', price: 35, status: 'available', location: BAIRRO,
        title: 'Jaqueta jeans tamanho M', description: 'Jaqueta jeans feminina, tamanho M, pouco usada. Serve para o friozinho da noite.',
        images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800'],
      },
      {
        user_id: maria, category: 'alimentos', condition: 'new', price: 20, status: 'available', location: BAIRRO,
        title: 'Geleia caseira de morango', description: 'Pote de 300g de geleia caseira sem conservantes, feita com morango da feira. Lote novo.',
        images: ['https://images.unsplash.com/photo-1564093497595-593b96d80180?w=800'],
      },
    ]),
  })

  console.log('→ inserindo avisos (mural)...')
  await rest('mural_posts', {
    method: 'POST',
    body: JSON.stringify([
      {
        user_id: cida, type: 'event',
        title: 'Mutirão de limpeza na praça',
        content: 'Sábado, 8h, na praça central. Traga luvas e disposição! Depois tem café coletivo. Vamos cuidar do nosso território juntos.',
        images: [],
      },
      {
        user_id: joao, type: 'announcement',
        title: 'Roda de samba no fim de semana',
        content: 'Domingo à tarde teremos roda de samba aberta no salão da associação. Quem toca, traz o instrumento. Quem canta, traz a voz!',
        images: [],
      },
      {
        user_id: maria, type: 'general',
        title: 'Doação de roupas de criança',
        content: 'Estou separando roupas de criança de 2 a 5 anos para doar. Quem precisar, me chame por aqui que combino a entrega.',
        images: [],
      },
    ]),
  })

  console.log('\n✓ Seed concluído!')
  console.log('  Vizinhos (senha: tekoa123):')
  console.log('   - maria@tekoa.test  (Maria Silva)')
  console.log('   - joao@tekoa.test   (João Pereira)')
  console.log('   - cida@tekoa.test   (Dona Cida)')
}

main().catch((err) => {
  console.error('\n✗ Erro no seed:', err.message)
  process.exit(1)
})
