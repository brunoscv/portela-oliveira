document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Smooth scroll (native behavior retained via CSS scroll-behavior if present)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Accordion logic (serviços)
  document.querySelectorAll('.accordion').forEach(acc => {
    const toggle = acc.querySelector('.accordion-toggle');
    const content = acc.querySelector('.accordion-content');
    if (toggle && content) {
      toggle.addEventListener('click', () => {
        const isHidden = content.hasAttribute('hidden');
        if (isHidden) {
          content.removeAttribute('hidden');
          toggle.setAttribute('aria-expanded', 'true');
        } else {
          content.setAttribute('hidden', '');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  // Carousel (Depoimentos)
  const carouselTrack = document.querySelector('#depoimentos .carousel-track');
  const prevBtn = document.querySelector('#depoimentos .prev');
  const nextBtn = document.querySelector('#depoimentos .next');

  if (carouselTrack && prevBtn && nextBtn) {
    let index = 0;
    
    // Função para calcular quantos items visíveis (responsivo)
    const getVisibleCount = () => {
      const w = carouselTrack.clientWidth;
      if (w >= 1100) return 5;
      if (w >= 900) return 4;
      if (w >= 700) return 3;
      if (w >= 520) return 2;
      return 1;
    };

    // Atualiza posição do carrossel
    const updateCarousel = () => {
      const items = Array.from(carouselTrack.children);
      if (items.length === 0) return;

      const visibleCount = getVisibleCount();
      carouselTrack.style.setProperty('--visible-count', String(visibleCount));
      
      const maxIndex = Math.max(0, items.length - visibleCount);
      index = Math.min(index, maxIndex); // Garante que index não ultrapasse limite
      
      const itemWidth = carouselTrack.clientWidth / visibleCount;
      const offset = index * itemWidth;
      carouselTrack.style.transform = `translateX(-${offset}px)`;
    };

    const next = () => {
      const items = Array.from(carouselTrack.children);
      const visibleCount = parseInt(getComputedStyle(carouselTrack).getPropertyValue('--visible-count')) || getVisibleCount();
      const maxIndex = Math.max(0, items.length - visibleCount);
      index = Math.min(index + 1, maxIndex);
      updateCarousel();
    };

    const prev = () => {
      index = Math.max(index - 1, 0);
      updateCarousel();
    };

    // Auto-play
    let autoTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const items = Array.from(carouselTrack.children);
        const visibleCount = parseInt(getComputedStyle(carouselTrack).getPropertyValue('--visible-count')) || getVisibleCount();
        const maxIndex = Math.max(0, items.length - visibleCount);
        
        if (index >= maxIndex) {
          index = 0;
        } else {
          index += 1;
        }
        updateCarousel();
      }
    }, 4000);

    // Event Listeners
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    window.addEventListener('resize', updateCarousel);
    
    // Pause on hover
    carouselTrack.addEventListener('mouseenter', () => { clearInterval(autoTimer); });
    carouselTrack.addEventListener('mouseleave', () => {
      autoTimer = setInterval(() => {
        if (document.visibilityState === 'visible') {
          const items = Array.from(carouselTrack.children);
          const visibleCount = parseInt(getComputedStyle(carouselTrack).getPropertyValue('--visible-count')) || getVisibleCount();
          const maxIndex = Math.max(0, items.length - visibleCount);
          if (index >= maxIndex) { index = 0; } else { index += 1; }
          updateCarousel();
        }
      }, 4000);
    });

    // Inicializa
    updateCarousel();

    // ---------------------------------------------------------
    // INTEGRAÇÃO GOOGLE REVIEWS (Lógica opcional)
    // ---------------------------------------------------------
    // Para funcionar: 
    // 1. Descomente a tag script do Google Maps no HTML e adicione sua API KEY.
    // 2. Adicione o PLACE ID do escritório abaixo.
    
    const GOOGLE_PLACE_ID = 'YOUR_PLACE_ID_HERE'; // <--- COLOCAR O ID DO LOCAL AQUI

    if (typeof google !== 'undefined' && google.maps && google.maps.places && GOOGLE_PLACE_ID !== 'YOUR_PLACE_ID_HERE') {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        placeId: GOOGLE_PLACE_ID,
        fields: ['reviews']
      };

      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place.reviews && place.reviews.length > 0) {
          // Limpa os cards estáticos
          carouselTrack.innerHTML = '';
          
          // Filtra reviews com 4 ou 5 estrelas (opcional)
          const goodReviews = place.reviews.filter(r => r.rating >= 4);

          goodReviews.forEach(review => {
            const card = document.createElement('article');
            card.className = 'review-card';
            card.setAttribute('aria-label', 'Avaliação');

            // Gera estrelas
            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
               if (i < review.rating) {
                 // Estrela cheia
                 starsHtml += `<svg viewBox="0 0 20 20"><path d="M10 1l2.6 5.4L18 7l-4 3.9.9 5.6L10 14.8 5.1 16.5 6 10.9 2 7l5.4-.6L10 1z"/></svg>`;
               } else {
                 // Estrela vazia (opcional, ou opacidade)
                 starsHtml += `<svg viewBox="0 0 20 20" style="opacity:.3"><path d="M10 1l2.6 5.4L18 7l-4 3.9.9 5.6L10 14.8 5.1 16.5 6 10.9 2 7l5.4-.6L10 1z"/></svg>`;
               }
            }

            // Truncar texto se muito longo
            const text = review.text.length > 150 ? review.text.substring(0, 150) + '...' : review.text;

            card.innerHTML = `
              <div class="stars" aria-label="Avaliação ${review.rating} de 5">
                ${starsHtml}
              </div>
              <p class="review-text">${text}</p>
              <div class="reviewer">
                <img class="avatar" src="${review.profile_photo_url}" alt="${review.author_name}" loading="lazy">
                <div class="who">
                  <strong>${review.author_name}</strong>
                  <small>${review.relative_time_description}</small>
                </div>
                <img class="g-badge" src="https://www.gstatic.com/images/branding/product/1x/google_g_48dp.png" alt="Google" loading="lazy">
              </div>
            `;
            carouselTrack.appendChild(card);
          });

          // Reinicia índice e atualiza layout
          index = 0;
          updateCarousel();
        }
      });
    }
  }

  // Fade-in on scroll
  const fades = document.querySelectorAll('.fade');
  if (fades.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    fades.forEach(el => io.observe(el));
  }

  // Chat widget: open WhatsApp
  const chatWidget = document.getElementById('chat-widget');
  if (chatWidget) {
    chatWidget.addEventListener('click', () => {
      window.open('https://wa.me/5586988180360?text=Ol%C3%A1,%20gostaria%20de%20iniciar%20um%20atendimento.', '_blank', 'noopener');
    });
  }

  // Contact form submission (simple WhatsApp link or local handling)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const mensagem = document.getElementById('mensagem').value.trim();
      const texto = encodeURIComponent(`Olá, meu nome é ${nome}. Meu e-mail é ${email}. Assunto: ${mensagem}`);
      window.open(`https://wa.me/5586988180360?text=${texto}`, '_blank', 'noopener');
    });
  }
});
