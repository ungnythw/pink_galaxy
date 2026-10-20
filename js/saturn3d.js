/* ===================================================
   PINK GALAXY 20/10 - 3D INTERACTIVE SATURN ENGINE
   Powered by Three.js WebGL (Offline Local Library)
   - Real 3D Pearlescent Holographic Planet (Velvety pastel pink, no harsh glare)
   - Slim, Elegant, Crisp 3D Text Ribbons (Correct aspect ratio, not fat or stretched!)
   - Visibly Orbiting 3D Wish Cards with True Planet Occlusion (Strictly hidden when behind planet!)
   - Interactive Mouse & Touch Drag-to-Rotate
   =================================================== */

class Saturn3DEngine {
  constructor(containerId, wishesContainerId) {
    this.container = document.getElementById(containerId);
    this.wishesContainer = document.getElementById(wishesContainerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // 3D Objects
    this.saturnGroup = null;
    this.planetMesh = null;
    this.ringMesh1 = null;
    this.ringMesh2 = null;
    this.ringTex1 = null;
    this.ringTex2 = null;

    // Interactive Drag State
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.rotVelX = 0;
    this.rotVelY = 0;
    this.targetRotX = 0.22;
    this.targetRotY = 0;

    // Animation speeds:
    // Gentle planet auto-spin
    this.autoRotateSpeed = 0.0008;
    // Visibly revolving wish cards (~26 seconds per full orbit)
    this.orbitSpeed = 0.0038;
    this.isPaused = false;

    // Raycaster for clicks & occlusion
    this.raycaster = new THREE.Raycaster();

    // Badges
    this.wishNodes = [];
    this.orbitAngle = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 540;
    const height = this.container.clientHeight || 380;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.2, 12.0);

    // 2. WebGL Renderer with alpha transparency
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting (Soft, velvety, romantic pastel lighting - no blown-out white glare)
    const ambientLight = new THREE.AmbientLight(0xffd5e2, 0.85);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff0f5, 0.85);
    dirLight1.position.set(4, 6, 6);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf472b6, 0.50);
    dirLight2.position.set(-5, -3, -4);
    this.scene.add(dirLight2);

    // 4. Main Saturn 3D Group (holds planet and rings together)
    this.saturnGroup = new THREE.Group();
    this.saturnGroup.rotation.x = this.targetRotX;
    this.scene.add(this.saturnGroup);

    // 5. Build Planet Sphere & 3D Text Ribbons
    this.createPlanetSphere();
    this.create3DTextRibbons();

    // 6. Bind Wish Nodes
    this.wishNodes = Array.from(this.wishesContainer ? this.wishesContainer.querySelectorAll('.wish-node-item') : []);

    // 7. Setup Mouse & Touch Drag Controls
    this.setupDragEvents();

    // 8. Resize listener
    window.addEventListener('resize', () => this.onResize());

    // 9. Start 60fps render loop
    this.animate();
  }

  createPlanetTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich Pearlescent Pastel Gradient (Rose, Pink, Lilac, Cosmic Violet)
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#ffd1dc');
    grad.addColorStop(0.22, '#f472b6');
    grad.addColorStop(0.50, '#c084fc');
    grad.addColorStop(0.80, '#9333ea');
    grad.addColorStop(1, '#3b0764');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Soft Atmospheric Cloud Bands
    ctx.globalAlpha = 0.14;
    for (let y = 0; y < 512; y += 14) {
      ctx.fillStyle = (y % 28 === 0) ? '#ffffff' : '#581c87';
      ctx.fillRect(0, y, 1024, 6);
    }
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  createPlanetSphere() {
    const geo = new THREE.SphereGeometry(2.35, 64, 64);
    const texture = this.createPlanetTexture();

    // Soft satin/silk material - no harsh plastic white reflection
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.45,
      metalness: 0.05,
      emissive: new THREE.Color(0x28053c),
      emissiveIntensity: 0.04
    });

    this.planetMesh = new THREE.Mesh(geo, mat);
    this.saturnGroup.add(this.planetMesh);

    // Subtle atmospheric glow shell
    const glowGeo = new THREE.SphereGeometry(2.40, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff69b4,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.saturnGroup.add(glowMesh);
  }

  createRibbonTexture(text, textColor, glowColor, strokeColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 2048, 128);

    // Outer edge guide lines of the 3D ring
    ctx.strokeStyle = strokeColor || 'rgba(255, 182, 217, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 16); ctx.lineTo(2048, 16);
    ctx.moveTo(0, 112); ctx.lineTo(2048, 112);
    ctx.stroke();

    // Slim, elegant, highly legible typography with natural aspect ratio
    ctx.font = '600 32px "Quicksand", -apple-system, sans-serif';
    ctx.fillStyle = textColor || '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = glowColor || '#ff4d94';
    ctx.shadowBlur = 10;

    // Centered single repetition (repeat.x = 3 handles full cylinder coverage without stretching!)
    ctx.fillText(`✦   ${text}   ✦`, 1024, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    // Repeat 3 times around cylinder to eliminate horizontal stretching ("béo")!
    texture.repeat.set(3, 1);
    return texture;
  }

  create3DTextRibbons() {
    // Ribbon 1: Horizontal Saturn Equatorial Ring
    this.ringTex1 = this.createRibbonTexture(
      'CHÚC MỪNG 20/10 • PINK GALAXY • NÀNG LÀ DUY NHẤT • YOU ARE MAGIC',
      '#ffffff',
      '#ff4d94',
      'rgba(255, 182, 217, 0.45)'
    );

    const ribbonGeo1 = new THREE.CylinderGeometry(4.35, 4.35, 0.52, 128, 1, true);
    const ribbonMat1 = new THREE.MeshBasicMaterial({
      map: this.ringTex1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });

    this.ringMesh1 = new THREE.Mesh(ribbonGeo1, ribbonMat1);
    this.ringMesh1.rotation.z = -0.18;
    this.saturnGroup.add(this.ringMesh1);

    // Ribbon 2: Cross Polar Orbit Ring (Like Image 3!)
    this.ringTex2 = this.createRibbonTexture(
      'VŨ TRỤ DỊU DÀNG • MÃI MÃI XINH ĐẸP • BÌNH AN TRONG TÂM HỒN • LUÔN ĐƯỢC YÊU THƯƠNG',
      '#ffeaa7',
      '#c084fc',
      'rgba(216, 180, 254, 0.4)'
    );

    const ribbonGeo2 = new THREE.CylinderGeometry(4.05, 4.05, 0.48, 128, 1, true);
    const ribbonMat2 = new THREE.MeshBasicMaterial({
      map: this.ringTex2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });

    this.ringMesh2 = new THREE.Mesh(ribbonGeo2, ribbonMat2);
    this.ringMesh2.rotation.x = Math.PI * 0.42;
    this.ringMesh2.rotation.z = Math.PI * 0.32;
    this.saturnGroup.add(this.ringMesh2);
  }

  setupDragEvents() {
    const el = this.renderer.domElement;
    let startX = 0;
    let startY = 0;
    let hasDragged = false;
    const mouse = new THREE.Vector2();

    const onPointerDown = (clientX, clientY) => {
      this.isDragging = true;
      hasDragged = false;
      startX = clientX;
      startY = clientY;
      this.prevMouseX = clientX;
      this.prevMouseY = clientY;
      this.rotVelX = 0;
      this.rotVelY = 0;
      el.style.cursor = 'grabbing';
    };

    const onPointerMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const deltaX = clientX - this.prevMouseX;
      const deltaY = clientY - this.prevMouseY;

      if (Math.hypot(clientX - startX, clientY - startY) > 6) {
        hasDragged = true;
      }

      this.prevMouseX = clientX;
      this.prevMouseY = clientY;

      this.rotVelY = deltaX * 0.007;
      this.rotVelX = deltaY * 0.007;

      this.saturnGroup.rotation.y += this.rotVelY;
      this.saturnGroup.rotation.x += this.rotVelX;

      this.saturnGroup.rotation.x = Math.max(-0.85, Math.min(0.85, this.saturnGroup.rotation.x));
    };

    const onPointerUp = (clientX, clientY) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      el.style.cursor = 'grab';

      // If clicked on planet without dragging
      if (!hasDragged && clientX !== undefined && clientY !== undefined) {
        const rect = el.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.planetMesh);
        if (intersects.length > 0 && typeof this.onPlanetClick === 'function') {
          this.onPlanetClick();
        }
      }
    };

    // Mouse
    el.style.cursor = 'grab';
    el.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', (e) => onPointerUp(e.clientX, e.clientY));

    // Touch
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      onPointerUp(touch ? touch.clientX : undefined, touch ? touch.clientY : undefined);
    });

    // Pause orbit only when actively hovering a specific badge
    if (this.wishesContainer) {
      this.wishesContainer.addEventListener('mouseover', (e) => {
        if (e.target.closest('.wish-node-item')) {
          this.isPaused = true;
        }
      });
      this.wishesContainer.addEventListener('mouseout', (e) => {
        if (e.target.closest('.wish-node-item')) {
          this.isPaused = false;
        }
      });
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 540;
    const height = this.container.clientHeight || 380;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  updateProjectedBadges() {
    if (!this.wishNodes.length || !this.camera) return;

    const width = this.container.clientWidth || 540;
    const height = this.container.clientHeight || 380;
    // Elegant orbit radius around the planet
    const radius = 5.4;

    this.wishNodes.forEach((node, i) => {
      const angle = this.orbitAngle + (i * (Math.PI * 2 / this.wishNodes.length));
      
      // Calculate local 3D position in the group
      const localPos = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * 0.25,
        Math.sin(angle) * radius
      );

      // Transform by Saturn group's 3D matrix (rotates with user drag!)
      const worldPos = localPos.clone().applyMatrix4(this.saturnGroup.matrixWorld);

      // Camera 2D projection
      const screenPos = worldPos.clone().project(this.camera);
      const screenX = (screenPos.x * 0.5 + 0.5) * width;
      const screenY = (-(screenPos.y * 0.5) + 0.5) * height;

      // Z position relative to camera:
      // In camera space: negative Z is away from camera
      const camSpacePos = worldPos.clone().applyMatrix4(this.camera.matrixWorldInverse);

      // OCCLUSION LOGIC:
      // The planet center in camera space is at (0, 0, -12).
      // If a badge is further away than the planet (camSpacePos.z < -12.0)
      // AND its 2D distance from the planet center is within the planet silhouette:
      // It is 100% occluded behind the planet!
      const isBehindPlanetCenter = camSpacePos.z < -12.0;
      const distFromCenterScreen = Math.hypot(screenPos.x, screenPos.y);

      // If behind planet center and near silhouette: strictly hidden!
      const isOccluded = isBehindPlanetCenter && (distFromCenterScreen < 0.32 || camSpacePos.z < -13.8);

      if (isOccluded) {
        node.style.opacity = '0';
        node.style.visibility = 'hidden';
        node.style.pointerEvents = 'none';
      } else {
        node.style.visibility = 'visible';
        node.style.pointerEvents = 'auto';

        // Smooth depth scaling and opacity
        const depthNorm = Math.max(0, Math.min(1, (camSpacePos.z + 16) / 8)); // 0 (far) to 1 (near)
        const scale = 0.82 + 0.28 * depthNorm;
        const opacity = 0.70 + 0.30 * depthNorm;

        node.style.left = `${screenX}px`;
        node.style.top = `${screenY}px`;
        node.style.transform = `translate(-50%, -50%) scale(${scale})`;
        node.style.opacity = `${opacity}`;
        node.style.zIndex = '25';
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // 1. Visibly Revolving Wish Cards in 3D Space (smooth & clearly orbiting!)
    if (!this.isPaused) {
      this.orbitAngle += this.orbitSpeed;
    }

    // 2. Slow, Serene Planet Auto-Rotation with Smooth Inertia
    if (!this.isDragging && !this.isPaused) {
      this.saturnGroup.rotation.y += this.autoRotateSpeed;
    }

    if (!this.isDragging) {
      this.rotVelX *= 0.94;
      this.rotVelY *= 0.94;
      this.saturnGroup.rotation.x += this.rotVelX;
      this.saturnGroup.rotation.y += this.rotVelY;
    }

    // 3. Animate 3D Text Ribbons (Slow, elegant, comfortable reading pace)
    if (this.ringTex1) {
      this.ringTex1.offset.x -= 0.00045;
    }
    if (this.ringTex2) {
      this.ringTex2.offset.x += 0.00035;
    }

    // 4. Project 3D Positions of Wish Badges to Screen (with true occlusion)
    this.updateProjectedBadges();

    // 5. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Global hook
window.Saturn3DEngine = Saturn3DEngine;
