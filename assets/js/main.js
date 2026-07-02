// Menu mobile
const menuToggle = document.getElementById('menu-toggle');
const navPrincipal = document.getElementById('nav-principal');

if (menuToggle && navPrincipal) {
  menuToggle.addEventListener('click', () => {
    const aberto = document.body.classList.toggle('menu-aberto');
    menuToggle.setAttribute('aria-expanded', String(aberto));
  });

  navPrincipal.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      document.body.classList.remove('menu-aberto');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Ano atual no rodapé
const anoAtual = document.getElementById('ano-atual');
if (anoAtual) anoAtual.textContent = `© ${new Date().getFullYear()}`;

// Carrossel — reaproveitado no hero e na galeria de obras
function iniciarCarrossel({ carrosselId, trilhaId, pontosId, classePonto, intervalo = 4800 }) {
  const carrossel = document.getElementById(carrosselId);
  const trilha = document.getElementById(trilhaId);
  const pontosContainer = document.getElementById(pontosId);
  if (!carrossel || !trilha || !pontosContainer) return;

  const slides = Array.from(trilha.children);
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let indice = 0;
  let temporizador = null;

  slides.forEach((_, i) => {
    const ponto = document.createElement('button');
    ponto.type = 'button';
    ponto.className = classePonto;
    ponto.setAttribute('aria-label', `Ir para foto ${i + 1}`);
    ponto.addEventListener('click', () => irPara(i, true));
    pontosContainer.appendChild(ponto);
  });
  const pontos = Array.from(pontosContainer.children);

  function atualizar() {
    trilha.style.transform = `translateX(-${indice * 100}%)`;
    pontos.forEach((p, i) => p.classList.toggle('ativo', i === indice));
  }

  function irPara(novoIndice, manual) {
    indice = (novoIndice + slides.length) % slides.length;
    atualizar();
    if (manual) reiniciarAutoplay();
  }

  function proximo(manual) { irPara(indice + 1, manual); }
  function anterior(manual) { irPara(indice - 1, manual); }

  function iniciarAutoplay() {
    if (reduzMovimento || slides.length < 2) return;
    temporizador = setInterval(() => proximo(false), intervalo);
  }
  function pararAutoplay() { if (temporizador) { clearInterval(temporizador); temporizador = null; } }
  function reiniciarAutoplay() { pararAutoplay(); iniciarAutoplay(); }

  const setaProximo = carrossel.querySelector('[class$="__seta--proximo"]');
  const setaAnterior = carrossel.querySelector('[class$="__seta--anterior"]');
  if (setaProximo) setaProximo.addEventListener('click', () => proximo(true));
  if (setaAnterior) setaAnterior.addEventListener('click', () => anterior(true));

  carrossel.addEventListener('mouseenter', pararAutoplay);
  carrossel.addEventListener('mouseleave', iniciarAutoplay);
  carrossel.addEventListener('focusin', pararAutoplay);
  carrossel.addEventListener('focusout', iniciarAutoplay);

  let toqueInicioX = null;
  trilha.addEventListener('touchstart', (e) => { toqueInicioX = e.touches[0].clientX; pararAutoplay(); }, { passive: true });
  trilha.addEventListener('touchend', (e) => {
    if (toqueInicioX === null) return;
    const delta = e.changedTouches[0].clientX - toqueInicioX;
    if (Math.abs(delta) > 40) { delta < 0 ? proximo(true) : anterior(true); }
    else { iniciarAutoplay(); }
    toqueInicioX = null;
  });

  atualizar();
  iniciarAutoplay();
}

iniciarCarrossel({ carrosselId: 'hero-carrossel', trilhaId: 'hero-trilha', pontosId: 'hero-pontos', classePonto: 'hero__ponto', intervalo: 5500 });
iniciarCarrossel({ carrosselId: 'galeria-carrossel', trilhaId: 'galeria-trilha', pontosId: 'galeria-pontos', classePonto: 'galeria__ponto', intervalo: 4800 });

// Revelar elementos ao rolar a página
const elementosRevelados = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && elementosRevelados.length) {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('em-vista');
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  elementosRevelados.forEach((el) => observador.observe(el));
} else {
  elementosRevelados.forEach((el) => el.classList.add('em-vista'));
}
