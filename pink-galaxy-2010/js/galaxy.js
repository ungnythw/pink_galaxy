/* ===================================================
   PINK GALAXY 20/10 - CANVAS GALAXY ENGINE
   Stars, Nebulae, Shooting Stars, Floating Hearts & Burst FX
   =================================================== */

class GalaxyEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Mouse Parallax
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.targetMouseX = this.mouseX;
    this.targetMouseY = this.mouseY;

    // Entities
    this.stars = [];
    this.specialStars = [];
    this.shootingStars = [];
    this.floatingHearts = [];
    this.particles = [];
    this.petals = [];
    this.nebulae = [];

    // State
    this.isPetalRainActive = false;
    this.lastTime = performance.now();

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetMouseX = e.touches[0].clientX;
        this.targetMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.initNebulae();
    this.initStars();
    this.initSpecialStars();
    this.initFloatingHearts();

    // Start Animation Loop
    this.animate();

    // Periodic shooting stars
    setInterval(() => {
      if (Math.random() < 0.75) {
        this.spawnShootingStar();
      }
    }, 3200);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Re-init when resizing
    this.initNebulae();
    this.initStars();
  }

  onMouseMove(e) {
    this.targetMouseX = e.clientX;
    this.targetMouseY = e.clientY;
  }

  initNebulae() {
    this.nebulae = [
      {
        x: this.width * 0.2,
        y: this.height * 0.3,
        radius: Math.min(this.width, this.height) * 0.45,
        color: 'rgba(108, 34, 121, 0.22)'
      },
      {
        x: this.width * 0.8,
        y: this.height * 0.4,
        radius: Math.min(this.width, this.height) * 0.5,
        color: 'rgba(236, 72, 153, 0.16)'
      },
      {
        x: this.width * 0.5,
        y: this.height * 0.85,
        radius: Math.min(this.width, this.height) * 0.6,
        color: 'rgba(63, 20, 90, 0.28)'
      }
    ];
  }

  initStars() {
    this.stars = [];
    const count = Math.min(Math.floor((this.width * this.height) / 4500), 240);
    const starColors = ['#ffffff', '#ffe4ee', '#ffd1dc', '#e9d5ff', '#ffeaa7'];

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.8 + 0.5,
        baseAlpha: Math.random() * 0.6 + 0.3,
        alpha: 0.5,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        depth: Math.random() * 1.5 + 0.5 // for parallax
      });
    }
  }

  initSpecialStars() {
    // A few four-point cross sparkling stars
    this.specialStars = [];
    const specialCount = 8;
    for (let i = 0; i < specialCount; i++) {
      this.specialStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 5 + 4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.02,
        color: '#ffcce6'
      });
    }
  }

  initFloatingHearts() {
    this.floatingHearts = [];
    const heartCount = 12;
    for (let i = 0; i < heartCount; i++) {
      this.spawnHeart(true);
    }
  }

  spawnHeart(randomY = false) {
    this.floatingHearts.push({
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 20,
      size: Math.random() * 9 + 6,
      speedY: Math.random() * 0.7 + 0.4,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayAmplitude: Math.random() * 30 + 15,
      swayOffset: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.45 + 0.2,
      rotation: (Math.random() - 0.5) * 0.4
    });
  }

  spawnShootingStar(customStartX = null, customStartY = null, customAngle = null) {
    const startX = customStartX !== null ? customStartX : Math.random() * (this.width * 0.8) + (this.width * 0.1);
    const startY = customStartY !== null ? customStartY : Math.random() * (this.height * 0.4);
    const angle = customAngle !== null ? customAngle : (Math.PI / 4) + (Math.random() * 0.3 - 0.15); // ~45 deg
    const speed = Math.random() * 12 + 14;
    const length = Math.random() * 120 + 80;

    this.shootingStars.push({
      x: startX,
      y: startY,
      startX: startX,
      startY: startY,
      length: length,
      speed: speed,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      alpha: 1,
      life: 1,
      decay: Math.random() * 0.015 + 0.012,
      color: Math.random() > 0.5 ? '#ffffff' : '#ffd1dc'
    });
  }

  // Particle Burst when user clicks buttons, wishes, or stars
  burstParticles(x, y, count = 35, mainColor = '#ff69b4') {
    const palette = [mainColor, '#ffffff', '#ffd1dc', '#ffeaa7', '#c084fc'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.015,
        color: palette[Math.floor(Math.random() * palette.length)],
        isHeart: Math.random() < 0.25,
        gravity: 0.06
      });
    }
  }

  // Trigger special shooting star for Section 6 (Make a wish)
  launchWishShootingStar(wishText, onComplete) {
    const startX = this.width * 0.1;
    const startY = this.height * 0.2;
    const angle = Math.PI / 5; // 36 deg
    const speed = 18;
    const length = 160;

    const wishStar = {
      x: startX,
      y: startY,
      length: length,
      speed: speed,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      alpha: 1,
      life: 1,
      decay: 0.011,
      color: '#ffeaa7',
      isSpecialWish: true,
      wishText: wishText,
      callback: onComplete
    };

    this.shootingStars.push(wishStar);
  }

  setPetalRain(active) {
    this.isPetalRainActive = active;
    if (active && this.petals.length === 0) {
      for (let i = 0; i < 28; i++) {
        this.spawnPetal(true);
      }
    }
  }

  spawnPetal(randomY = false) {
    this.petals.push({
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -20,
      size: Math.random() * 10 + 8,
      speedY: Math.random() * 1.2 + 0.8,
      speedX: Math.random() * 0.8 + 0.2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      alpha: Math.random() * 0.4 + 0.5,
      color: Math.random() > 0.4 ? '#ff9ebb' : '#fecdd3'
    });
  }

  // Draw 4-point cross star
  drawCrossStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff69b4';

    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawHeart(ctx, x, y, size, color, alpha, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size / 20, size / 20);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff4d94';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -10, -15, 5, 0, 18);
    ctx.bezierCurveTo(15, 5, 10, -10, 0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  animate() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Smooth Parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
    const offsetX = (this.mouseX - this.width / 2) * 0.035;
    const offsetY = (this.mouseY - this.height / 2) * 0.035;

    // Clear Canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Nebula Clouds
    for (const neb of this.nebulae) {
      const grad = this.ctx.createRadialGradient(
        neb.x - offsetX * 0.3,
        neb.y - offsetY * 0.3,
        10,
        neb.x - offsetX * 0.3,
        neb.y - offsetY * 0.3,
        neb.radius
      );
      grad.addColorStop(0, neb.color);
      grad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // 2. Draw Twinkling Stars
    for (const star of this.stars) {
      star.twinklePhase += star.twinkleSpeed;
      const alphaFactor = (Math.sin(star.twinklePhase) + 1) / 2;
      star.alpha = star.baseAlpha * 0.4 + alphaFactor * (star.baseAlpha * 0.6);

      const px = star.x - offsetX * star.depth;
      const py = star.y - offsetY * star.depth;

      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = star.alpha;
      this.ctx.beginPath();
      this.ctx.arc(px, py, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3. Draw Special Cross Stars
    for (const s of this.specialStars) {
      s.phase += s.speed;
      const radius = s.radius * (0.8 + 0.3 * Math.sin(s.phase));
      const alpha = 0.5 + 0.4 * Math.sin(s.phase);
      this.drawCrossStar(this.ctx, s.x - offsetX * 0.5, s.y - offsetY * 0.5, 4, radius, radius * 0.28, s.color, alpha);
    }

    // 4. Draw Floating Hearts
    for (let i = this.floatingHearts.length - 1; i >= 0; i--) {
      const h = this.floatingHearts[i];
      h.y -= h.speedY;
      h.swayOffset += h.swaySpeed;
      const currentX = h.x + Math.sin(h.swayOffset) * h.swayAmplitude;

      this.drawHeart(this.ctx, currentX - offsetX * 0.4, h.y, h.size, '#ff8da1', h.alpha, h.rotation);

      if (h.y < -30) {
        this.floatingHearts.splice(i, 1);
        this.spawnHeart(false);
      }
    }

    // 5. Draw Shooting Stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.dx;
      s.y += s.dy;
      s.life -= s.decay;

      const tailX = s.x - (s.dx / s.speed) * s.length;
      const tailY = s.y - (s.dy / s.speed) * s.length;

      const grad = this.ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, s.color);
      grad.addColorStop(0.2, 'rgba(255, 105, 180, ' + (s.life * 0.7) + ')');
      grad.addColorStop(1, 'transparent');

      this.ctx.save();
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = s.isSpecialWish ? 3.5 : 2;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(tailX, tailY);
      this.ctx.stroke();

      // Glowing head
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowBlur = s.isSpecialWish ? 20 : 12;
      this.ctx.shadowColor = '#ff4d94';
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.isSpecialWish ? 4 : 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      if (s.life <= 0 || s.x > this.width + 100 || s.y > this.height + 100) {
        if (s.isSpecialWish) {
          // Trigger particle burst at wish explosion point!
          this.burstParticles(s.x, s.y, 45, '#ffd1dc');
          if (s.callback) s.callback();
        }
        this.shootingStars.splice(i, 1);
      }
    }

    // 6. Draw Particle Bursts
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.alpha -= p.decay;

      if (p.isHeart) {
        this.drawHeart(this.ctx, p.x, p.y, p.size * 3, p.color, p.alpha);
      } else {
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(p.alpha, 0);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 7. Draw Petal Rain (if active)
    if (this.isPetalRainActive) {
      if (this.petals.length < 28 && Math.random() < 0.2) {
        this.spawnPetal(false);
      }
      for (let i = this.petals.length - 1; i >= 0; i--) {
        const pt = this.petals[i];
        pt.y += pt.speedY;
        pt.x += Math.sin(pt.y * 0.02) * pt.speedX;
        pt.rotation += pt.rotSpeed;

        this.ctx.save();
        this.ctx.translate(pt.x, pt.y);
        this.ctx.rotate((pt.rotation * Math.PI) / 180);
        this.ctx.fillStyle = pt.color;
        this.ctx.globalAlpha = pt.alpha;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = '#ff69b4';

        // Draw petal shape
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, pt.size, pt.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        if (pt.y > this.height + 20) {
          this.petals.splice(i, 1);
        }
      }
    }

    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
}

