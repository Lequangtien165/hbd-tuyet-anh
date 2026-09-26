/**
 * Happy Birthday Tuyết Anh - Pinterest Bento & Scrapbook Edition
 * Featuring Authentic Happy Birthday Theme Song, Real-time Spotify Player,
 * Candle Smoke FX, Photo Lightbox & Fluid Micro-Interactions.
 */

// --- 1. AESTHETIC AUDIO PLAYER & THEME SONG MANAGER ---
class AestheticAudioPlayer {
  constructor() {
    this.ctx = null;
    this.audioElement = document.getElementById('bg-audio');
    this.isPlaying = false;
    this.useSynthFallback = false;
    this.timerId = null;
    this.currentNoteIndex = 0;

    // Melody notes for "Happy Birthday" (warm music box / celesta) as fallback
    this.melody = [
      { f: 261.63, d: 0.35, pause: 0.4 },
      { f: 261.63, d: 0.25, pause: 0.3 },
      { f: 293.66, d: 0.6, pause: 0.65 },
      { f: 261.63, d: 0.6, pause: 0.65 },
      { f: 349.23, d: 0.6, pause: 0.65 },
      { f: 329.63, d: 1.1, pause: 1.2 },

      { f: 261.63, d: 0.35, pause: 0.4 },
      { f: 261.63, d: 0.25, pause: 0.3 },
      { f: 293.66, d: 0.6, pause: 0.65 },
      { f: 261.63, d: 0.6, pause: 0.65 },
      { f: 392.00, d: 0.6, pause: 0.65 },
      { f: 349.23, d: 1.1, pause: 1.2 },

      { f: 261.63, d: 0.35, pause: 0.4 },
      { f: 261.63, d: 0.25, pause: 0.3 },
      { f: 523.25, d: 0.6, pause: 0.65 },
      { f: 440.00, d: 0.6, pause: 0.65 },
      { f: 349.23, d: 0.5, pause: 0.55 },
      { f: 329.63, d: 0.5, pause: 0.55 },
      { f: 293.66, d: 0.9, pause: 1.0 },

      { f: 466.16, d: 0.35, pause: 0.4 },
      { f: 466.16, d: 0.25, pause: 0.3 },
      { f: 440.00, d: 0.6, pause: 0.65 },
      { f: 349.23, d: 0.6, pause: 0.65 },
      { f: 392.00, d: 0.6, pause: 0.65 },
      { f: 349.23, d: 1.3, pause: 1.8 }
    ];

    this.bindEvents();
  }

  initSynth() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBell(freq, duration) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  playChime() {
    this.initSynth();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBell(freq, 0.45);
      }, idx * 65);
    });
  }

  startMelody() {
    this.isPlaying = true;

    // Try playing MP3 audio track
    if (this.audioElement) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.useSynthFallback = false;
          updatePlayerUI(true);
        }).catch(() => {
          // Fallback to synth if autoplay is blocked or file missing
          this.useSynthFallback = true;
          this.startSynthMelody();
          updatePlayerUI(true);
        });
        return;
      }
    }

    this.useSynthFallback = true;
    this.startSynthMelody();
    updatePlayerUI(true);
  }

  startSynthMelody() {
    this.initSynth();
    this.currentNoteIndex = 0;
    this.scheduleNextNote();
  }

  scheduleNextNote() {
    if (!this.isPlaying || !this.useSynthFallback) return;
    const note = this.melody[this.currentNoteIndex];
    this.playBell(note.f, note.d);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
    this.timerId = setTimeout(() => {
      this.scheduleNextNote();
    }, note.pause * 1000);
  }

  stopMelody() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    updatePlayerUI(false);
  }

  toggle() {
    if (this.isPlaying) {
      this.stopMelody();
      return false;
    } else {
      this.startMelody();
      return true;
    }
  }

  bindEvents() {
    if (!this.audioElement) return;

    // Real-time progress updates
    this.audioElement.addEventListener('timeupdate', () => {
      if (!this.audioElement.duration) return;
      const progressPercent = (this.audioElement.currentTime / this.audioElement.duration) * 100;
      const progressFill = document.getElementById('progress-fill');
      const currentTimeEl = document.getElementById('current-time');
      const durationTimeEl = document.getElementById('duration-time');

      if (progressFill) progressFill.style.width = `${progressPercent}%`;
      if (currentTimeEl) currentTimeEl.textContent = formatTime(this.audioElement.currentTime);
      if (durationTimeEl) durationTimeEl.textContent = formatTime(this.audioElement.duration);
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      const durationTimeEl = document.getElementById('duration-time');
      if (durationTimeEl) durationTimeEl.textContent = formatTime(this.audioElement.duration);
    });

    this.audioElement.addEventListener('ended', () => {
      this.audioElement.currentTime = 0;
      this.audioElement.play();
    });
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const audioPlayer = new AestheticAudioPlayer();

// --- 2. SPOTIFY PLAYER & DOCK UI SYNCHRONIZATION ---
const musicBtn = document.getElementById('music-btn');
const spotifyPlayToggle = document.getElementById('spotify-play-toggle');
const playStateIcon = document.getElementById('play-state-icon');
const albumCover = document.querySelector('.spotify-album-cover');
const progressBarContainer = document.getElementById('progress-bar-container');

function updatePlayerUI(isPlaying) {
  if (isPlaying) {
    musicBtn.classList.add('active');
    if (playStateIcon) playStateIcon.textContent = '❚❚';
    if (spotifyPlayToggle) spotifyPlayToggle.querySelector('span:last-child').textContent = 'Pause';
    if (albumCover) albumCover.classList.add('playing');
  } else {
    musicBtn.classList.remove('active');
    if (playStateIcon) playStateIcon.textContent = '▶';
    if (spotifyPlayToggle) spotifyPlayToggle.querySelector('span:last-child').textContent = 'Play';
    if (albumCover) albumCover.classList.remove('playing');
  }
}

musicBtn.addEventListener('click', () => {
  audioPlayer.toggle();
});

spotifyPlayToggle.addEventListener('click', () => {
  audioPlayer.toggle();
});

// Interactive seeking on click
if (progressBarContainer) {
  progressBarContainer.addEventListener('click', (e) => {
    if (!audioPlayer.audioElement || !audioPlayer.audioElement.duration) return;
    const rect = progressBarContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const fraction = clickX / width;
    audioPlayer.audioElement.currentTime = fraction * audioPlayer.audioElement.duration;
  });
}

// Auto-play audio upon first user gesture (respects browser policy)
let hasUserInteracted = false;
document.addEventListener('click', () => {
  if (!hasUserInteracted) {
    hasUserInteracted = true;
    audioPlayer.startMelody();
  }
}, { once: true });

// Like button with sweet count pulse
const likeBtn = document.getElementById('like-btn');
const likeCount = document.getElementById('like-count');
let isLiked = false;

if (likeBtn) {
  likeBtn.addEventListener('click', () => {
    isLiked = !isLiked;
    audioPlayer.playChime();
    if (isLiked) {
      likeCount.textContent = '1,000,000 ❤️';
      likeBtn.style.background = '#fecdd3';
      likeBtn.style.borderColor = '#f43f5e';
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
    } else {
      likeCount.textContent = '999k+';
      likeBtn.style.background = '#fff1f2';
      likeBtn.style.borderColor = '#fecdd3';
    }
  });
}

// --- 3. BENTO CAKE & CANDLE BLOWOUT WITH REALISTIC SMOKE ---
const candle = document.getElementById('candle');
const flame = document.getElementById('flame');
const cakeHint = document.getElementById('cake-hint');
const wishBanner = document.getElementById('wish-banner');
let candleBlown = false;

function blowOutCandle() {
  if (candleBlown) return;
  candleBlown = true;

  // Extinguish Flame
  flame.classList.add('extinguished');
  cakeHint.textContent = 'Ước nguyện đã thành hiện thực! 🌸';
  wishBanner.classList.remove('hidden');

  // Spawn delicate curling smoke puffs
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      const smoke = document.createElement('div');
      smoke.className = 'smoke-puff';
      smoke.style.animationDelay = `${i * 0.15}s`;
      candle.appendChild(smoke);
      setTimeout(() => smoke.remove(), 1600);
    }, i * 180);
  }

  audioPlayer.playChime();

  if (typeof confetti === 'function') {
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#fecdd3', '#fef08a', '#ffffff', '#fb7185']
    });
  }
}

if (candle) candle.addEventListener('click', blowOutCandle);
document.getElementById('cake').addEventListener('click', blowOutCandle);

// --- 4. HANDWRITTEN LETTER TYPING EFFECT & WAX SEAL ---
const letterText = `Hôm nay là một ngày thật dịu dàng và đặc biệt — ngày đánh dấu sự xuất hiện của một cô gái vô cùng xinh xắn, ngọt ngào và ấm áp.

Thêm một tuổi mới, chúc Tuyết Anh luôn giữ trọn nụ cười tươi tắn trên môi. Mong em nhí yêu luôn tìm thấy niềm vui trong những điều giản đơn nhất, tự tin bước đi trên con đường mình đã chọn và gặt hái thật nhiều thành công rực rỡ.

Dù ngoài kia có những ngày nắng hay mưa, mong rằng trái tim Tuyết Anh sẽ luôn bình yên, luôn được yêu thương, chiều chuộng và bao bọc bởi những điều tốt đẹp nhất.

Happy Birthday, Tuyết Anh! 💖🎂🎉`;

function startTyping() {
  const textContainer = document.getElementById('typed-text');
  const cursor = document.getElementById('type-cursor');
  if (!textContainer) return;
  let charIdx = 0;

  function typeChar() {
    if (charIdx < letterText.length) {
      textContainer.textContent += letterText.charAt(charIdx);
      charIdx++;
      setTimeout(typeChar, 30);
    } else if (cursor) {
      cursor.style.display = 'none';
    }
  }
  setTimeout(typeChar, 400);
}
startTyping();

// Wax seal click chime
const waxSeal = document.querySelector('.wax-seal');
if (waxSeal) {
  waxSeal.addEventListener('click', () => {
    audioPlayer.playChime();
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.6 }
      });
    }
  });
}

// --- 5. PASTEL STICKY NOTES MODAL ---
const stickyNotes = document.querySelectorAll('.sticky-note');
const wishModal = document.getElementById('wish-modal');
const modalWishText = document.getElementById('modal-wish-text');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalOkBtn = document.getElementById('modal-ok-btn');

stickyNotes.forEach(note => {
  note.addEventListener('click', () => {
    const wish = note.getAttribute('data-wish');
    modalWishText.textContent = wish;
    wishModal.classList.remove('hidden');
    audioPlayer.playChime();
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  });
});

function closeModal() {
  wishModal.classList.add('hidden');
}
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modalOkBtn) modalOkBtn.addEventListener('click', closeModal);
if (wishModal) {
  wishModal.addEventListener('click', (e) => {
    if (e.target === wishModal) closeModal();
  });
}

// --- 6. PHOTO LIGHTBOX FOR POLAROIDS ---
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

function bindPolaroidClicks() {
  const polaroids = document.querySelectorAll('.polaroid-frame');
  polaroids.forEach(frame => {
    frame.addEventListener('click', (e) => {
      const img = frame.querySelector('.polaroid-img');
      const caption = frame.querySelector('.handwritten-caption');
      if (img && lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption ? caption.textContent : 'Tuyết Anh ✨';
        lightboxModal.classList.remove('hidden');
        audioPlayer.playChime();
      }
    });
  });
}
bindPolaroidClicks();

function closeLightbox() {
  if (lightboxModal) lightboxModal.classList.add('hidden');
}
if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
if (lightboxModal) {
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });
}

// --- 7. FIREWORKS CELEBRATION BUTTON ---
const fireworkBtn = document.getElementById('firework-btn');
if (fireworkBtn) {
  fireworkBtn.addEventListener('click', () => {
    audioPlayer.playChime();
    const duration = 3.2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1500 };

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      if (typeof confetti === 'function') {
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() - 0.2 },
          colors: ['#f43f5e', '#fecdd3', '#fef08a', '#c084fc', '#6ee7b7']
        }));
      }
    }, 220);
  });
}

// --- 8. PHOTO UPLOADER / LIVE MEMORY CHANGER ---
const photoUploadBtn = document.getElementById('photo-upload-btn');
const imageInput = document.getElementById('image-input');
const galleryContainer = document.getElementById('gallery-container');
const albumArt = document.querySelector('.album-art');

if (photoUploadBtn && imageInput) {
  photoUploadBtn.addEventListener('click', () => {
    imageInput.click();
  });

  imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    galleryContainer.innerHTML = '';
    const washiTapes = ['tape-peach', 'tape-lavender', 'tape-mint'];
    const rotations = ['tape-top-left', 'tape-center rotate-right', 'tape-top-right rotate-left'];
    const captions = [
      'Nụ cười ngọt ngào của em nhí ✨',
      'Khoảnh khắc rực rỡ nhất 💖',
      'Mãi xinh đẹp và hạnh phúc 🌸',
      'Kỷ niệm tuyệt vời 🎂'
    ];

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (index === 0 && albumArt) {
          albumArt.src = event.target.result;
        }
        const polaroid = document.createElement('div');
        polaroid.className = `polaroid-frame ${rotations[index % rotations.length]}`;
        polaroid.innerHTML = `
          <div class="washi-tape ${washiTapes[index % washiTapes.length]}"></div>
          <div class="polaroid-photo-box">
            <img src="${event.target.result}" alt="Tuyết Anh" class="polaroid-img" />
          </div>
          <div class="polaroid-footer">
            <span class="handwritten-caption">${captions[index % captions.length]}</span>
            <span class="sticker-heart">🌸</span>
          </div>
        `;
        galleryContainer.appendChild(polaroid);
        bindPolaroidClicks();
      };
      reader.readAsDataURL(file);
    });

    audioPlayer.playChime();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  });
}

// --- 9. AMBIENT DRIFTING SAKURA CANVAS ---
const canvas = document.getElementById('ambient-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const PETAL_COUNT = 36;
  const petals = [];
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 6,
      speedX: Math.random() * 1 + 0.3,
      speedY: Math.random() * 1.2 + 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      color: Math.random() > 0.4 ? 'rgba(254, 205, 211, ' : 'rgba(251, 113, 133, ',
      alpha: Math.random() * 0.4 + 0.2
    });
  }

  function animateAmbient() {
    ctx.clearRect(0, 0, width, height);

    petals.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) {
        p.x = -20;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(animateAmbient);
  }
  animateAmbient();
}

// --- 10. CLICK FLOATING ICONS MICRO-INTERACTION ---
document.addEventListener('click', (e) => {
  if (e.target.closest('button') || e.target.closest('.sticky-note') || e.target.closest('.bento-cake-container') || e.target.closest('.progress-bar')) return;

  const heart = document.createElement('div');
  heart.className = 'click-floating-icon';
  heart.innerHTML = ['🌸', '✨', '💖', '🍰', '⭐', '🎀'][Math.floor(Math.random() * 6)];
  heart.style.position = 'fixed';
  heart.style.left = `${e.clientX}px`;
  heart.style.top = `${e.clientY}px`;
  heart.style.pointerEvents = 'none';
  heart.style.fontSize = `${Math.random() * 16 + 18}px`;
  heart.style.zIndex = '9999';
  heart.style.transform = 'translate(-50%, -50%) scale(0)';
  heart.style.transition = 'transform 0.8s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.8s ease-out';
  document.body.appendChild(heart);

  requestAnimationFrame(() => {
    heart.style.transform = `translate(-50%, -${Math.random() * 60 + 40}px) scale(1.3) rotate(${Math.random() * 30 - 15}deg)`;
    heart.style.opacity = '0';
  });

  setTimeout(() => {
    heart.remove();
  }, 850);
});
