/**
 * Website Chúc Mừng Sinh Nhật Tuyết Anh
 * Hiệu ứng Canvas Heart, Web Audio Synth, Bánh kem & Pháo hoa
 */

// --- 1. WEB AUDIO API SYNTHESIZER & AUDIO MANAGER ---
class BirthdayAudioPlayer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timerId = null;
    this.currentNoteIndex = 0;
    this.audioElement = document.getElementById('bg-audio');
    this.useAudioElement = false;

    // Melody notes for "Happy Birthday": [Frequency (Hz), Duration (s), Delay before next (s)]
    this.melody = [
      { f: 261.63, d: 0.35, pause: 0.4 },  // C4
      { f: 261.63, d: 0.25, pause: 0.3 },  // C4
      { f: 293.66, d: 0.6, pause: 0.65 },  // D4
      { f: 261.63, d: 0.6, pause: 0.65 },  // C4
      { f: 349.23, d: 0.6, pause: 0.65 },  // F4
      { f: 329.63, d: 1.1, pause: 1.2 },   // E4

      { f: 261.63, d: 0.35, pause: 0.4 },  // C4
      { f: 261.63, d: 0.25, pause: 0.3 },  // C4
      { f: 293.66, d: 0.6, pause: 0.65 },  // D4
      { f: 261.63, d: 0.6, pause: 0.65 },  // C4
      { f: 392.00, d: 0.6, pause: 0.65 },  // G4
      { f: 349.23, d: 1.1, pause: 1.2 },   // F4

      { f: 261.63, d: 0.35, pause: 0.4 },  // C4
      { f: 261.63, d: 0.25, pause: 0.3 },  // C4
      { f: 523.25, d: 0.6, pause: 0.65 },  // C5
      { f: 440.00, d: 0.6, pause: 0.65 },  // A4
      { f: 349.23, d: 0.5, pause: 0.55 },  // F4
      { f: 329.63, d: 0.5, pause: 0.55 },  // E4
      { f: 293.66, d: 0.9, pause: 1.0 },   // D4

      { f: 466.16, d: 0.35, pause: 0.4 },  // Bb4
      { f: 466.16, d: 0.25, pause: 0.3 },  // Bb4
      { f: 440.00, d: 0.6, pause: 0.65 },  // A4
      { f: 349.23, d: 0.6, pause: 0.65 },  // F4
      { f: 392.00, d: 0.6, pause: 0.65 },  // G4
      { f: 349.23, d: 1.3, pause: 1.8 }    // F4
    ];
  }

  init() {
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

  playSparkle() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBell(freq, 0.4);
      }, idx * 70);
    });
  }

  startMelody() {
    this.init();
    this.isPlaying = true;

    // Check if external audio element can play
    if (this.audioElement && this.audioElement.currentSrc && !this.audioElement.error) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.useAudioElement = true;
        }).catch(() => {
          this.useAudioElement = false;
          this.startSynthMelody();
        });
        return;
      }
    }

    this.startSynthMelody();
  }

  startSynthMelody() {
    this.useAudioElement = false;
    this.currentNoteIndex = 0;
    this.scheduleNextNote();
  }

  scheduleNextNote() {
    if (!this.isPlaying || this.useAudioElement) return;
    const note = this.melody[this.currentNoteIndex];
    this.playBell(note.f, note.d);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
    this.timerId = setTimeout(() => {
      this.scheduleNextNote();
    }, note.pause * 1000);
  }

  stopMelody() {
    this.isPlaying = false;
    if (this.useAudioElement && this.audioElement) {
      this.audioElement.pause();
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
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
}

const audioPlayer = new BirthdayAudioPlayer();

// --- 2. CANVASES: 3D PULSING HEART & FLOATING SPARKLES ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getHeartPoint(t, scale) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x: x * scale, y: y * scale };
}

const HEART_PARTICLE_COUNT = 320;
const heartParticles = [];

for (let i = 0; i < HEART_PARTICLE_COUNT; i++) {
  const t = Math.PI * 2 * Math.random();
  const scale = 11 + Math.random() * 2.5;
  const target = getHeartPoint(t, scale);
  heartParticles.push({
    baseX: target.x,
    baseY: target.y,
    x: target.x,
    y: target.y,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2.5 + 1.2,
    alpha: Math.random() * 0.7 + 0.3,
    color: Math.random() > 0.3 ? '#ff6b8b' : (Math.random() > 0.5 ? '#ffd166' : '#ff9a9e'),
    offset: Math.random() * Math.PI * 2
  });
}

const AMBIENT_COUNT = 60;
const ambientParticles = [];
for (let i = 0; i < AMBIENT_COUNT; i++) {
  ambientParticles.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 3 + 1,
    speedY: - (Math.random() * 0.8 + 0.3),
    speedX: (Math.random() - 0.5) * 0.5,
    alpha: Math.random() * 0.6 + 0.2,
    color: Math.random() > 0.5 ? 'rgba(255, 107, 139, ' : 'rgba(255, 209, 102, '
  });
}

let tick = 0;
function animateCanvas() {
  ctx.clearRect(0, 0, width, height);
  tick += 0.025;

  const pulse = Math.sin(tick * 2) * 0.08 + 1;
  const centerX = width / 2;
  const centerY = height * 0.38;

  heartParticles.forEach(p => {
    const px = centerX + p.baseX * pulse + Math.sin(tick + p.offset) * 3;
    const py = centerY + p.baseY * pulse + Math.cos(tick + p.offset) * 3;

    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fill();
  });

  ambientParticles.forEach(p => {
    p.y += p.speedY;
    p.x += p.speedX;
    if (p.y < -10) {
      p.y = height + 10;
      p.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color + p.alpha + ')';
    ctx.shadowBlur = 6;
    ctx.shadowColor = p.color + '1)';
    ctx.globalAlpha = p.alpha;
    ctx.fill();
  });

  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;

  requestAnimationFrame(animateCanvas);
}
animateCanvas();

// --- 3. GIFT BOX OPENING INTERACTION ---
const openGiftBtn = document.getElementById('open-gift-btn');
const introScreen = document.getElementById('intro-screen');
const mainContent = document.getElementById('main-content');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const musicIcon = document.getElementById('music-icon');

openGiftBtn.addEventListener('click', () => {
  audioPlayer.playSparkle();
  triggerCelebrationConfetti();

  setTimeout(() => {
    audioPlayer.startMelody();
    musicToggleBtn.classList.add('active');
  }, 500);

  introScreen.classList.add('fade-out');
  setTimeout(() => {
    introScreen.style.display = 'none';
    mainContent.classList.remove('hidden');
    startLetterTyping();
  }, 700);
});

musicToggleBtn.addEventListener('click', () => {
  const isPlaying = audioPlayer.toggle();
  if (isPlaying) {
    musicToggleBtn.classList.add('active');
    musicIcon.textContent = '🎵';
  } else {
    musicToggleBtn.classList.remove('active');
    musicIcon.textContent = '🔇';
  }
});

// --- 4. INTERACTIVE BIRTHDAY CAKE & BLOW CANDLE ---
const candle = document.getElementById('candle');
const flame = document.getElementById('flame');
const cakeInstruction = document.getElementById('cake-instruction');
const wishSuccess = document.getElementById('wish-success');
let candleBlown = false;

function blowOutCandle() {
  if (candleBlown) return;
  candleBlown = true;

  flame.classList.add('extinguished');
  cakeInstruction.style.display = 'none';
  wishSuccess.classList.remove('hidden');

  audioPlayer.playSparkle();
  triggerSuperConfetti();
}

candle.addEventListener('click', blowOutCandle);
document.getElementById('cake').addEventListener('click', blowOutCandle);

// --- 5. HEARTFELT LETTER TYPING EFFECT ---
const letterText = `Gửi Tuyết Anh yêu quý,

Hôm nay là một ngày thật dịu dàng và đặc biệt — ngày đánh dấu sự xuất hiện của một cô gái vô cùng xinh xắn, ngọt ngào và ấm áp.

Thêm một tuổi mới, chúc Tuyết Anh luôn giữ trọn nụ cười tươi tắn trên môi. Mong bạn luôn tìm thấy niềm vui trong những điều giản đơn nhất, tự tin bước đi trên con đường mình đã chọn và gặt hái thật nhiều thành công rực rỡ.

Dù ngoài kia có những ngày nắng hay mưa, mong rằng trái tim Tuyết Anh sẽ luôn bình yên, luôn được yêu thương, chiều chuộng và bao bọc bởi những điều tốt đẹp nhất.

Happy Birthday, Tuyết Anh! 💖🎂🎉`;

function startLetterTyping() {
  const textContainer = document.getElementById('typed-letter');
  const cursor = document.getElementById('typing-cursor');
  let charIdx = 0;

  function typeChar() {
    if (charIdx < letterText.length) {
      textContainer.textContent += letterText.charAt(charIdx);
      charIdx++;
      setTimeout(typeChar, 35);
    } else {
      cursor.style.display = 'none';
    }
  }
  setTimeout(typeChar, 800);
}

// --- 6. WISH CARDS MODAL INTERACTION ---
const wishCards = document.querySelectorAll('.wish-card');
const wishModal = document.getElementById('wish-modal');
const modalWishText = document.getElementById('modal-wish-text');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');

wishCards.forEach(card => {
  card.addEventListener('click', () => {
    const wish = card.getAttribute('data-wish');
    modalWishText.textContent = wish;
    wishModal.classList.remove('hidden');
    audioPlayer.playSparkle();
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  });
});

function closeModal() {
  wishModal.classList.add('hidden');
}

modalCloseBtn.addEventListener('click', closeModal);
modalConfirmBtn.addEventListener('click', closeModal);
wishModal.addEventListener('click', (e) => {
  if (e.target === wishModal) closeModal();
});

// --- 7. FIREWORKS & CONFETTI EFFECTS ---
function triggerCelebrationConfetti() {
  if (typeof confetti !== 'function') return;
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ff6b8b', '#ffd166', '#ff85a1', '#ffffff']
  });
}

function triggerSuperConfetti() {
  if (typeof confetti !== 'function') return;
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  function fire(particleRatio, opts) {
    confetti(Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio)
    }));
  }

  fire(0.25, { spread: 26, startVelocity: 55, colors: ['#ff6b8b', '#ffd166'] });
  fire(0.2, { spread: 60, colors: ['#ff9a9e', '#fecfef'] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#ffd166', '#ffb703', '#ffffff'] });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

const fireworkBtn = document.getElementById('firework-btn');
fireworkBtn.addEventListener('click', () => {
  audioPlayer.playSparkle();
  const duration = 3.5 * 1000;
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
        origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() - 0.2 }
      }));
    }
  }, 250);
});

// --- 8. CLICK ANYWHERE TO SPAWN FLOATING HEARTS ---
document.addEventListener('click', (e) => {
  if (e.target.closest('button') || e.target.closest('.wish-card') || e.target.closest('.gift-box-wrapper')) return;

  const heart = document.createElement('div');
  heart.className = 'floating-click-heart';
  heart.innerHTML = ['💖', '🌸', '✨', '🎂', '⭐'][Math.floor(Math.random() * 5)];
  heart.style.position = 'fixed';
  heart.style.left = `${e.clientX}px`;
  heart.style.top = `${e.clientY}px`;
  heart.style.pointerEvents = 'none';
  heart.style.fontSize = `${Math.random() * 18 + 18}px`;
  heart.style.zIndex = '9999';
  heart.style.transform = 'translate(-50%, -50%) scale(0)';
  heart.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
  document.body.appendChild(heart);

  requestAnimationFrame(() => {
    heart.style.transform = `translate(-50%, -${Math.random() * 60 + 50}px) scale(1.3) rotate(${Math.random() * 40 - 20}deg)`;
    heart.style.opacity = '0';
  });

  setTimeout(() => {
    heart.remove();
  }, 850);
});

// --- 9. PHOTO UPLOADER / LIVE MEMORY CHANGER ---
const photoUploadBtn = document.getElementById('photo-upload-btn');
const imageInput = document.getElementById('image-input');
const galleryContainer = document.getElementById('gallery-container');

photoUploadBtn.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  galleryContainer.innerHTML = '';

  const captions = [
    'Nụ cười ngọt ngào của Tuyết Anh ✨',
    'Khoảnh khắc rực rỡ nhất 💖',
    'Mãi xinh đẹp và hạnh phúc 🌸',
    'Kỷ niệm tuyệt vời 🎂',
    'Thiên thần nhỏ Tuyết Anh 👑'
  ];

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const polaroid = document.createElement('div');
      const rotateClass = index % 2 === 0 ? 'rotate-left' : 'rotate-right';
      polaroid.className = `polaroid-item ${rotateClass}`;

      polaroid.innerHTML = `
        <div class="pin">📌</div>
        <div class="polaroid-img-wrapper">
          <img src="${event.target.result}" alt="Tuyết Anh" class="polaroid-img" />
        </div>
        <div class="polaroid-caption">${captions[index % captions.length]}</div>
      `;
      galleryContainer.appendChild(polaroid);
    };
    reader.readAsDataURL(file);
  });

  audioPlayer.playSparkle();
  triggerCelebrationConfetti();
});
