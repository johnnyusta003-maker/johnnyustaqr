(function () {
  const TAGS = {
    topseller: { cls: 'tag-topseller', label: '⭐ Top Seller' },
    picante: { cls: 'tag-picante', label: '🌶 Picante' },
    veggie: { cls: 'tag-veggie', label: '🥗 Veggie' },
    vegano: { cls: 'tag-vegano', label: '🌿 Vegano' },
    kids: { cls: 'tag-kids', label: '👶 Kids' },
    gym: { cls: 'tag-gym', label: '💪 Gym' },
    alemana: { cls: 'tag-alemana', label: '🇩🇪 Alemana' },
    sinalcohol: { cls: 'tag-sinalcohol', label: 'Sin alcohol' }
  };

  const storeId = new URLSearchParams(window.location.search).get('store') || 'torrente';

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderTags(tags) {
    if (!tags || !tags.length) return '';
    return `<div class="card-tags">${tags.map(t => {
      const tag = TAGS[t];
      return tag ? `<span class="tag ${tag.cls}">${esc(tag.label)}</span>` : '';
    }).join('')}</div>`;
  }

  function renderSizes(sizes) {
    return `<div class="card-sizes">${sizes.map(s =>
      `<div class="size-row"><span class="size-label">${esc(s.label)}</span><span class="size-price">${esc(s.price)}</span></div>`
    ).join('')}</div>`;
  }

  function renderCard(item) {
    const nameBlock = item.volume || item.subdesc
      ? `<div><div class="card-name">${esc(item.name)}</div>${item.volume ? `<div class="card-desc" style="margin-top:3px;">${esc(item.volume)}</div>` : ''}${item.subdesc ? `<div class="card-desc" style="margin-top:3px;">${esc(item.subdesc)}</div>` : ''}</div>`
      : `<div class="card-name">${esc(item.name)}</div>`;

    const priceBlock = item.sizes
      ? `<div class="card-price">${renderSizes(item.sizes)}</div>`
      : `<div class="card-price card-price-single">${esc(item.price)}</div>`;

    const descBlock = item.desc ? `<div class="card-desc">${esc(item.desc)}</div>` : '';

    return `<div class="card"><div class="card-top">${nameBlock}${priceBlock}</div>${descBlock}${renderTags(item.tags)}</div>`;
  }

  function renderItem(item) {
    switch (item.type) {
      case 'card': return renderCard(item);
      case 'simple':
        return `<div class="simple-card"><span class="simple-name">${esc(item.name)}</span><span class="simple-price">${esc(item.price)}</span></div>`;
      case 'groupTitle':
        return `<div class="bebidas-group-title">${esc(item.text)}</div>`;
      case 'subsection':
        return `<div class="section-header" style="margin-top:24px;"><h2 class="section-title">${esc(item.title)}</h2><div class="section-line"></div></div>`;
      case 'fritzBanner':
        return `<div class="fritz-banner"><div class="fritz-banner-top"><span class="fritz-label">${esc(item.label)}</span></div><div class="fritz-tagline">${esc(item.tagline)}</div></div>`;
      case 'salsas':
        return `<div class="salsas-grid">${item.list.map(s => `<div class="salsa-chip">${esc(s)}</div>`).join('')}</div>`;
      default: return '';
    }
  }

  function renderSection(section, index) {
    const titleHtml = section.titleSuffix
      ? `${esc(section.title)} <span style="font-size:0.55em; font-weight:400; letter-spacing:0.05em; opacity:0.6;">${esc(section.titleSuffix)}</span>`
      : esc(section.title);

    const imageHtml = section.image
      ? `<div class="section-img-banner"><img src="${esc(section.image)}" alt="${esc(section.title)}" onerror="this.style.display='none'" /></div>`
      : '';

    const itemsHtml = (section.items || []).map(renderItem).join('');

    return `<section class="menu-section" id="${esc(section.id)}">
      <div class="section-header">
        <h2 class="section-title">${titleHtml}</h2>
        <div class="section-line"></div>
      </div>
      ${imageHtml}
      ${itemsHtml}
    </section>`;
  }

  function renderNav(sections) {
    const navScroll = document.getElementById('navScroll');
    navScroll.innerHTML = sections.map((s, i) =>
      `<button class="nav-btn${i === 0 ? ' active' : ''}" data-target="${esc(s.id)}">${esc(s.navLabel || s.title)}</button>`
    ).join('');
  }

  function initNav() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.menu-section');
    const navHeight = document.getElementById('mainNav').offsetHeight;

    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const el = document.getElementById(btn.dataset.target);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    function setActive(id) {
      navBtns.forEach(b => b.classList.toggle('active', b.dataset.target === id));
      const activeBtn = document.querySelector(`.nav-btn[data-target="${id}"]`);
      if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: `-${navHeight + 16}px 0px -55% 0px`, threshold: 0 });

    sections.forEach(s => observer.observe(s));
  }

  function initStagger() {
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.card, .simple-card, .salsa-chip').forEach((el, i) => {
      el.style.animationDelay = `${(i % 7) * 0.06}s`;
      el.style.animationPlayState = 'paused';
      cardObserver.observe(el);
    });
  }

  function initModal() {
    const overlay = document.getElementById('modalOverlay');
    document.getElementById('pedirBtn').addEventListener('click', () => {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    document.getElementById('modalClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  async function loadMenu() {
    const main = document.getElementById('menuMain');
    main.innerHTML = '<p style="text-align:center;padding:40px 0;color:#777;">Cargando menú…</p>';

    try {
      const res = await fetch(`menus/${storeId}.json`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();

      document.title = `Johnny Usta · ${data.store.name}`;
      renderNav(data.sections);
      main.innerHTML = data.sections.map(renderSection).join('');

      initNav();
      initStagger();
    } catch (e) {
      main.innerHTML = `<p style="text-align:center;padding:40px 16px;color:#777;">Menú no disponible.<br><small>Laden: ${esc(storeId)}</small></p>`;
    }
  }

  initModal();
  loadMenu();
})();
