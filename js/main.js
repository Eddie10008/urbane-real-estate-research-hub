document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeaderScroll();
  initScrollAnimations();
  initCounters();
  initCharts();
  initNetworkGraph();
  initSearchFilter();
  highlightCurrentPage();
});

function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header || document.body.classList.contains('agency-site')) return;
  if (!document.querySelector('.hero')) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 48);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
    }
  });
}

function highlightCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .footer-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(update);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    observer.observe(el);
  });
}

function initCharts() {
  if (typeof Chart === 'undefined') return;

  const salesCtx = document.getElementById('salesChart');
  if (salesCtx && typeof URBANE_DATA !== 'undefined') {
    new Chart(salesCtx, {
      type: 'bar',
      data: {
        labels: ['Sales (12mo)', 'Leases (12mo)', 'Active For Sale', 'Active For Rent', 'Total Sold (All Time)'],
        datasets: [{
          label: 'Property Activity',
          data: [46, 116, 21, 13, 273],
          backgroundColor: [
            'rgba(37, 99, 235, 0.85)',
            'rgba(29, 78, 216, 0.75)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(96, 165, 250, 0.65)',
            'rgba(12, 26, 58, 0.8)'
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: chartOptions('Urbane Real Estate — Property Activity')
    });
  }

  const typeCtx = document.getElementById('propertyTypeChart');
  if (typeCtx && typeof URBANE_DATA !== 'undefined') {
    const pt = URBANE_DATA.propertyTypes.bishalSales;
    new Chart(typeCtx, {
      type: 'doughnut',
      data: {
        labels: ['Apartments', 'Houses', 'Townhouses'],
        datasets: [{
          data: [pt.apartment, pt.house, pt.townhouse],
          backgroundColor: ['#2563eb', '#1d4ed8', '#0c1a3a'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: { labels: { color: '#64748b' } },
          title: {
            display: true,
            text: 'Bishal Pokhrel — Sales by Type (12mo)',
            color: '#0f172a',
            font: { family: 'Inter', size: 16, weight: '600' }
          }
        }
      }
    });
  }

  const suburbCtx = document.getElementById('suburbChart');
  if (suburbCtx && typeof URBANE_DATA !== 'undefined') {
    new Chart(suburbCtx, {
      type: 'bar',
      data: {
        labels: ['Blacktown', 'Auburn', 'Doonside', 'Werrington', 'Homebush', 'Grantham Farm', 'Rooty Hill', 'Schofields'],
        datasets: [{
          label: 'Sales Activity (relative)',
          data: [95, 88, 72, 85, 68, 75, 70, 78],
          backgroundColor: 'rgba(37, 99, 235, 0.8)',
          borderRadius: 6
        }]
      },
      options: {
        ...chartOptions('Key Sales Suburbs'),
        indexAxis: 'y'
      }
    });
  }

  const compCtx = document.getElementById('competitorChart');
  if (compCtx) {
    new Chart(compCtx, {
      type: 'bar',
      data: {
        labels: ['Urbane RE', 'Ray White Blacktown', 'LJ Hooker', 'Elders'],
        datasets: [
          {
            label: 'Sales (12mo)',
            data: [46, 80, 55, 40],
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderRadius: 6
          },
          {
            label: 'Leases (12mo)',
            data: [116, 86, 70, 45],
            backgroundColor: 'rgba(12, 26, 58, 0.75)',
            borderRadius: 6
          }
        ]
      },
      options: chartOptions('Competitive Comparison (approx.)')
    });
  }
}

function chartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: { color: '#64748b', font: { family: 'Inter' } }
      },
      title: {
        display: true,
        text: title,
        color: '#0f172a',
        font: { family: 'Inter', size: 16, weight: '600' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(226, 232, 240, 0.8)' }
      },
      y: {
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(226, 232, 240, 0.8)' }
      }
    }
  };
}

function initNetworkGraph() {
  const container = document.getElementById('networkGraph');
  if (!container || typeof URBANE_DATA === 'undefined') return;

  const center = { name: 'Urbane Real Estate', type: 'center' };
  const groups = [
    { key: 'businessPartners', label: 'Partners', color: '#2563eb', angle: 0 },
    { key: 'colleagues', label: 'Colleagues', color: '#3b82f6', angle: 60 },
    { key: 'employees', label: 'Employees', color: '#34d399', angle: 120 },
    { key: 'clients', label: 'Clients', color: '#a78bfa', angle: 180 },
    { key: 'competitors', label: 'Competitors', color: '#f87171', angle: 240 },
    { key: 'vendors', label: 'Vendors', color: '#fbbf24', angle: 300 }
  ];

  const w = container.offsetWidth;
  const h = container.offsetHeight || 400;
  const cx = w / 2;
  const cy = h / 2;

  const centerNode = document.createElement('div');
  centerNode.className = 'network-node center';
  centerNode.textContent = center.name;
  centerNode.style.left = `${cx - 70}px`;
  centerNode.style.top = `${cy - 16}px`;
  container.appendChild(centerNode);

  groups.forEach(group => {
    const items = URBANE_DATA.connections[group.key] || [];
    const radius = Math.min(w, h) * 0.38;
    const startAngle = (group.angle * Math.PI) / 180;
    const spread = Math.PI / 3;

    items.slice(0, 4).forEach((item, i) => {
      const name = typeof item === 'string' ? item : (item.name || String(item));
      const angle = startAngle + (spread / Math.max(items.length - 1, 1)) * i - spread / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      const node = document.createElement('div');
      node.className = 'network-node';
      node.textContent = name.length > 22 ? name.slice(0, 20) + '…' : name;
      node.title = `${group.label}: ${name}`;
      node.style.left = `${x - 50}px`;
      node.style.top = `${y - 14}px`;
      node.style.borderColor = group.color;
      container.appendChild(node);
    });
  });
}

function initSearchFilter() {
  const search = document.getElementById('connectionSearch');
  const list = document.getElementById('connectionList');
  if (!search || !list) return;

  search.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    list.querySelectorAll('.connection-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? '' : 'none';
    });
  });
}
