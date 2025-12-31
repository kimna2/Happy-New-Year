// =====================
// 1) COUNTDOWN (đến 01/01/2026 00:00:00 local time)
// =====================
const target = new Date("2026-01-01T00:00:00");
const pad = (n) => String(n).padStart(2, "0");

const elD = document.getElementById("d");
const elH = document.getElementById("h");
const elM = document.getElementById("m");
const elS = document.getElementById("s");
const yearText = document.getElementById("yearText");

if (yearText) yearText.textContent = String(target.getFullYear());

function tick() {
  const now = new Date();
  let diff = target - now;

  if (diff <= 0) {
    if (elD) elD.textContent = "00";
    if (elH) elH.textContent = "00";
    if (elM) elM.textContent = "00";
    if (elS) elS.textContent = "00";
    // Khi đã sang năm mới thì vẫn cứ bắn pháo hoa (đang auto sẵn)
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (elD) elD.textContent = pad(days);
  if (elH) elH.textContent = pad(hours);
  if (elM) elM.textContent = pad(minutes);
  if (elS) elS.textContent = pad(seconds);
}
setInterval(tick, 250);
tick();


// =====================
// 2) CANVAS FIREWORKS + CONFETTI
// =====================
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d", { alpha: true });

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const rand = (a, b) => a + Math.random() * (b - a);

class Particle {
  constructor(x, y, vx, vy, life, size, type = "spark") {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.life = life; this.maxLife = life;
    this.size = size;
    this.type = type;
    this.hue = rand(0, 360);
    this.spin = rand(-0.2, 0.2);
    this.rot = rand(0, Math.PI * 2);
  }
  step(dt) {
    this.life -= dt;

    // gravity
    this.vy += (this.type === "confetti" ? 0.18 : 0.28) * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.type === "confetti") {
      this.rot += this.spin * dt;
      this.vx *= 0.995;
      this.vy *= 0.995;
    } else {
      this.vx *= 0.985;
      this.vy *= 0.985;
    }
  }
  draw() {
    const t = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = t;

    if (this.type === "confetti") {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = `hsl(${this.hue} 90% 60%)`;
      ctx.fillRect(-this.size, -this.size * 0.4, this.size * 2, this.size * 0.8);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.fillStyle = `hsl(${this.hue} 90% 65%)`;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}

const particles = [];

// Fireworks auto ON ngay khi load
const state = {
  fxOn: true,
};

// bắn 1 quả pháo hoa
function firework(x, y) {
  // sparks
  const n = Math.floor(rand(40, 70));
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(2.2, 6.2);
    particles.push(
      new Particle(
        x, y,
        Math.cos(a) * sp,
        Math.sin(a) * sp,
        rand(35, 60),
        rand(1.2, 2.6),
        "spark"
      )
    );
  }

  // confetti
  const c = Math.floor(rand(18, 30));
  for (let i = 0; i < c; i++) {
    particles.push(
      new Particle(
        x, y,
        rand(-2.5, 2.5),
        rand(-4.5, -1.2),
        rand(80, 140),
        rand(5, 9),
        "confetti"
      )
    );
  }
}

// animation loop
let last = performance.now();
function animate(now) {
  const dt = Math.min(2, (now - last) / 16.67);
  last = now;

  ctx.clearRect(0, 0, innerWidth, innerHeight);

  // glow nhẹ
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  ctx.restore();

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.step(dt);
    p.draw();
    if (p.life <= 0) particles.splice(i, 1);
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);


// =====================
// 3) AUTO FIREWORKS (TỰ ĐỘNG)
// =====================
function autoFireworks() {
  if (!state.fxOn) return;

  const x = rand(innerWidth * 0.15, innerWidth * 0.85);
  const y = rand(innerHeight * 0.12, innerHeight * 0.50);
  firework(x, y);

  setTimeout(autoFireworks, rand(300, 900)); // tốc độ bắn
}

// chạy luôn khi mở trang
autoFireworks();


// =====================
// 4) OPTIONAL: CLICK / SPACE để bắn thêm
// =====================
window.addEventListener("pointerdown", (e) => {
  if (!state.fxOn) return;
  firework(e.clientX, e.clientY);
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!state.fxOn) return;
    firework(
      rand(innerWidth * 0.2, innerWidth * 0.8),
      rand(innerHeight * 0.2, innerHeight * 0.55)
    );
  }
});


// 5) MP3 AUTOPLAY
const bgm = document.getElementById("bgm");
const unlock = document.getElementById("audioUnlock");

if (unlock && bgm) {
  unlock.addEventListener("click", async () => {
    try {
      bgm.volume = 0.7;   // chỉnh âm lượng
      await bgm.play();  // chạy nhạc
      unlock.remove();   // xoá overlay
    } catch (e) {
      console.log("Audio blocked:", e);
    }
  }, { once: true });
}


