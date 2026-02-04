
document.addEventListener('DOMContentLoaded', () => {
  const blogGrid = document.querySelector('.blog-grid');
  const isNewsPage = !!document.getElementById('noticia-titulo');
  
  // Se o Supabase não estiver configurado (arquivo config vazio), não faz nada
  if (!window.supabaseClient) {
    console.warn('Supabase client not initialized.');
    return;
  }

  // Função para carregar lista de posts (Home e Rodapé da Notícia)
  async function fetchPosts(excludeId = null) {
    if (!blogGrid) return;
    
    try {
      let query = supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data: posts, error } = await query;

      if (error) throw error;

      if (posts && posts.length > 0) {
        blogGrid.innerHTML = ''; // Limpa os posts mockados
        
        posts.forEach(post => {
          const date = new Date(post.created_at).toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'long', year: 'numeric'
          });

          const article = document.createElement('article');
          article.className = 'blog-card';
          article.style.cursor = 'pointer';
          article.onclick = () => window.location.href = `noticia.html?id=${post.id}`;
          
          article.innerHTML = `
            <div class="blog-thumb">
              <img src="${post.image_url}" alt="${post.title}" loading="lazy" style="object-fit: cover; width: 100%; height: 200px;">
            </div>
            <div class="blog-content">
              <h3>${post.title}</h3>
              <div class="blog-meta">
                <i class="far fa-clock"></i> ${date}
              </div>
              <div class="blog-excerpt" style="white-space: pre-wrap; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${post.content}</div>
              <div class="blog-footer">
                <span class="read-more" onclick="event.stopPropagation(); window.location.href='noticia.html?id=${post.id}'">LEIA MAIS →</span>
                <span class="comments"><i class="far fa-comment"></i> 0</span>
              </div>
            </div>
          `;
          
          blogGrid.appendChild(article);
        });
      }
    } catch (err) {
      console.error('Erro ao carregar notícias:', err.message);
    }
  }

  // Lógica para carregar Notícia Única
  async function loadSingleNews() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id || !isNewsPage) return;

    try {
      const { data: post, error } = await supabaseClient
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (post) {
        // Preencher Hero
        const hero = document.getElementById('hero-noticia');
        if (hero) {
          // Gradiente leve para garantir contraste do header branco
          hero.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0) 100%), url('${post.image_url}')`;
        }

        // Preencher Conteúdo
        document.getElementById('noticia-titulo').textContent = post.title;
        document.getElementById('noticia-texto').textContent = post.content;
        
        const date = new Date(post.created_at).toLocaleDateString('pt-BR', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        document.getElementById('noticia-data').textContent = `Publicado em ${date}`;

        // Atualizar título da página
        document.title = `${post.title} | Portela & Oliveira Advocacia`;
        
        // Carregar outros posts, excluindo o atual
        fetchPosts(id);
      }
    } catch (err) {
      console.error('Erro ao carregar notícia:', err.message);
      document.getElementById('noticia-titulo').textContent = 'Notícia não encontrada.';
    }
  }

  // Execução
  if (isNewsPage) {
    loadSingleNews();
  } else {
    fetchPosts();
  }
});
