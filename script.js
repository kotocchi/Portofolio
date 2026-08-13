// ===== Mobile nav toggle =====
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.textContent = isOpen ? 'CLOSE' : 'MENU';
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.textContent = 'MENU';
    });
  });
}

// ===== Drag-to-scroll filmstrip(s) =====
document.querySelectorAll('.filmstrip').forEach((strip) => {
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  const start = (x) => {
    isDown = true;
    strip.classList.add('dragging');
    startX = x;
    scrollStart = strip.scrollLeft;
  };

  const move = (x) => {
    if (!isDown) return;
    const dx = x - startX;
    strip.scrollLeft = scrollStart - dx;
  };

  const end = () => {
    isDown = false;
    strip.classList.remove('dragging');
  };

  strip.addEventListener('mousedown', (e) => start(e.pageX));
  window.addEventListener('mouseup', end);
  window.addEventListener('mousemove', (e) => move(e.pageX));

  strip.addEventListener('touchstart', (e) => start(e.touches[0].pageX), { passive: true });
  strip.addEventListener('touchend', end);
  strip.addEventListener('touchmove', (e) => move(e.touches[0].pageX), { passive: true });

  // Let mouse wheel vertical scroll translate to horizontal movement
  strip.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      strip.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
});

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}

// ===== Video lightbox =====
// Clicking a reel card that has a video opens it large in a centered popup,
// instead of playing inline. Cards without a video (still placeholders)
// keep their normal link behavior.

const modal = document.createElement('div');
modal.className = 'video-modal';
modal.innerHTML = `
  <div class="video-modal-inner">
    <button class="video-modal-close" aria-label="Close video">✕</button>
    <video muted loop playsinline controls></video>
  </div>
`;
document.body.appendChild(modal);

const modalVideo = modal.querySelector('video');
const modalClose = modal.querySelector('.video-modal-close');

const openModal = (src) => {
  modalVideo.src = src;
  modal.classList.add('open');
  modalVideo.play();
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  modal.classList.remove('open');
  modalVideo.pause();
  modalVideo.removeAttribute('src');
  document.body.style.overflow = '';
};

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.querySelectorAll('.reel-card').forEach((card) => {
  const video = card.querySelector('video');
  if (!video) return; // still a placeholder — let it link normally

  // Set the paused thumbnail frame (no manual screenshot needed)
  const THUMB_SECONDS = 1.2;
  const setThumbFrame = () => {
    const target = Math.min(THUMB_SECONDS, (video.duration || THUMB_SECONDS) / 4);
    video.currentTime = target;
  };
  if (video.readyState >= 1) setThumbFrame();
  else video.addEventListener('loadedmetadata', setThumbFrame, { once: true });

  card.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(video.currentSrc || video.src);
  });
});
