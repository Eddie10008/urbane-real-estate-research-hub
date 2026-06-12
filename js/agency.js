document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initPropertyListings();
  initPropertySearch();
  initNewsletterForm();
});

function initHeroSlider() {
  const slides = document.querySelectorAll('.agency-hero-slide');
  const dots = document.querySelectorAll('.agency-hero-dot');
  const prev = document.querySelector('.agency-hero-arrow.prev');
  const next = document.querySelector('.agency-hero-arrow.next');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function nextSlide() { goTo(current + 1); }
  function prevSlide() { goTo(current - 1); }

  function startAutoplay() {
    timer = setInterval(nextSlide, 5000);
  }

  function resetAutoplay() {
    clearInterval(timer);
    startAutoplay();
  }

  prev?.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
  next?.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAutoplay(); });
  });

  startAutoplay();
}

function initPropertyListings() {
  const grid = document.getElementById('listingsGrid');
  if (!grid || typeof URBANE_LISTINGS === 'undefined') return;

  grid.innerHTML = URBANE_LISTINGS.map(listing => {
    const statusClass = listing.status === 'For Rent' ? 'rent'
      : listing.status === 'Under Application' ? 'application' : '';

    const features = [
      listing.beds && `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> ${listing.beds}</span>`,
      listing.baths && `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16M4 12a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/></svg> ${listing.baths}</span>`,
      listing.cars && `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="6" rx="1"/><path d="M5 11l2-5h10l2 5"/></svg> ${listing.cars}</span>`,
      listing.land && `<span>${listing.land}</span>`
    ].filter(Boolean).join('');

    return `
      <article class="property-card fade-in">
        <div class="property-card-image">
          <a href="${listing.url}" target="_blank" rel="noopener">
            <img src="${listing.image}" alt="${listing.address}, ${listing.suburb}" loading="lazy" width="675" height="375">
          </a>
          <div class="property-card-badge">
            <span class="property-card-status ${statusClass}">${listing.status}</span>
            <div class="property-card-price">${listing.price}</div>
          </div>
        </div>
        <div class="property-card-body">
          <h3><a href="${listing.url}" target="_blank" rel="noopener">${listing.address}</a></h3>
          <div class="property-card-suburb">${listing.suburb}</div>
          <div class="property-card-features">${features}</div>
        </div>
      </article>`;
  }).join('');

  document.querySelectorAll('#listingsGrid .fade-in').forEach(el => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    observer.observe(el);
  });
}

function initPropertySearch() {
  const form = document.getElementById('propertySearchForm');
  const suburbSelect = document.getElementById('searchSuburb');
  const listingType = document.getElementById('searchListingType');

  if (suburbSelect && typeof URBANE_SUBURBS !== 'undefined') {
    URBANE_SUBURBS.forEach(suburb => {
      const opt = document.createElement('option');
      opt.value = suburb;
      opt.textContent = suburb;
      suburbSelect.appendChild(opt);
    });
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = listingType?.value || 'buy';
    const suburb = suburbSelect?.value || '';
    const beds = document.getElementById('searchBeds')?.value || '';
    const minPrice = document.getElementById('searchMinPrice')?.value || '';
    const maxPrice = document.getElementById('searchMaxPrice')?.value || '';

    let url = `https://www.urbanere.com.au/${type}`;
    const params = new URLSearchParams();
    if (suburb) params.set('suburb', suburb);
    if (beds) params.set('bedrooms', beds);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);

    const qs = params.toString();
    window.open(qs ? `${url}?${qs}` : url, '_blank');
  });

  listingType?.addEventListener('change', () => {
    const isRent = listingType.value === 'rent';
    document.getElementById('minPriceLabel').textContent = isRent ? 'Min Rent' : 'Min Price';
    document.getElementById('maxPriceLabel').textContent = isRent ? 'Max Rent' : 'Max Price';
  });
}

function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = form.querySelector('[name="alert_type"]')?.value || 'buyer';
    const urls = {
      buyer: 'https://www.urbanere.com.au/buyer-alerts',
      renter: 'https://www.urbanere.com.au/rental-finder',
      newsletter: 'https://www.urbanere.com.au/contact'
    };
    window.open(urls[type] || urls.buyer, '_blank');
  });
}

function initTeamGrid() {
  const grid = document.getElementById('teamGrid');
  if (!grid || typeof URBANE_AGENTS === 'undefined') return;

  grid.innerHTML = URBANE_AGENTS.map(agent => `
    <article class="team-card fade-in">
      <div class="team-card-image">
        <a href="${agent.url}" target="_blank" rel="noopener">
          <img src="${agent.image}" alt="${agent.name}" loading="lazy" width="400" height="300">
        </a>
      </div>
      <div class="team-card-body">
        <h3><a href="${agent.url}" target="_blank" rel="noopener">${agent.name}</a></h3>
        <div class="team-card-role">${agent.role}</div>
        ${agent.mobile ? `<div class="team-card-mobile"><a href="tel:${agent.mobile.replace(/\s/g, '')}">${agent.mobile}</a></div>` : ''}
      </div>
    </article>
  `).join('');
}

if (document.getElementById('teamGrid')) {
  document.addEventListener('DOMContentLoaded', initTeamGrid);
}
