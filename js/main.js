/* ===================================================
   PINK GALAXY 20/10 - MAIN INTERACTION CONTROLLER
   Full logic for 7 cosmic sections, personalization & effects
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Engines
  const galaxy = new GalaxyEngine('galaxy-canvas');
  const audio = new SpaceAudioEngine();

  // State
  let currentSectionIndex = 0;
  const sections = document.querySelectorAll('.journey-section');
  const navDots = document.querySelectorAll('.nav-dot');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const stepCounter = document.getElementById('step-counter');
  const musicToggle = document.getElementById('music-toggle');

  // Recipient Name Handling
  const urlParams = new URLSearchParams(window.location.search);
  const paramTo = urlParams.get('to');
  let recipientName = paramTo ? decodeURIComponent(paramTo) : (localStorage.getItem('pink_galaxy_recipient') || 'Nàng Thơ Tuyệt Vời');

  function updateRecipientDisplays() {
    document.querySelectorAll('.recipient-name-display').forEach(el => {
      el.textContent = recipientName;
    });
    const headerInput = document.getElementById('recipient-input');
    if (headerInput) headerInput.value = recipientName;
  }
  updateRecipientDisplays();

  // Handle Recipient Input change
  const recipientInput = document.getElementById('recipient-input');
  if (recipientInput) {
    recipientInput.addEventListener('input', (e) => {
      recipientName = e.target.value.trim() || 'Nàng Thơ Tuyệt Vời';
      localStorage.setItem('pink_galaxy_recipient', recipientName);
      updateRecipientDisplays();
    });
  }

  // --- Navigation & Section Switching ---
  function goToSection(index, transitionType = 'normal') {
    if (index < 0 || index >= sections.length || index === currentSectionIndex) return;

    const currentSection = sections[currentSectionIndex];
    const targetSection = sections[index];

    if (transitionType === 'warp') {
      currentSection.classList.add('warp-out');
      setTimeout(() => {
        currentSection.classList.remove('active', 'warp-out');
        targetSection.scrollTop = 0;
        targetSection.classList.add('active');
        currentSectionIndex = index;
        onSectionChanged(index);
      }, 700);
    } else {
      currentSection.classList.remove('active');
      targetSection.scrollTop = 0;
      targetSection.classList.add('active');
      currentSectionIndex = index;
      onSectionChanged(index);
    }
  }

  function onSectionChanged(index) {
    // Update nav dots
    navDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });

    // Toggle bottom controls (strictly hidden on Section 1 / index 0 as requested)
    const bottomControls = document.querySelector('.bottom-controls');
    if (bottomControls) {
      if (index === 0) {
        bottomControls.classList.add('hidden-on-portal');
      } else {
        bottomControls.classList.remove('hidden-on-portal');
      }
    }

    // Update bottom controls buttons
    if (btnPrev) btnPrev.disabled = (index === 0);
    if (btnNext) btnNext.disabled = (index === sections.length - 1);
    if (stepCounter) stepCounter.textContent = `${index + 1} / ${sections.length}`;

    // Section specific behaviors
    if (index === 2) { // Constellation stage
      const stage = document.querySelector('.constellation-stage');
      if (stage) stage.classList.add('active-stage');
    }

    if (index === 3 || index === 6) { // Flower garden or Grand letter: activate petal rain
      galaxy.setPetalRain(true);
    } else {
      galaxy.setPetalRain(false);
    }

    if (index === 6) {
      audio.playGrandCelebrationChime();
    }
  }

  // Initial state on section 0
  onSectionChanged(0);

  // Nav Dot Clicks
  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIdx = parseInt(dot.getAttribute('data-index'), 10);
      goToSection(targetIdx);
      audio.playTwinkle();
    });
  });

  // Prev / Next Button Clicks
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentSectionIndex > 0) {
        goToSection(currentSectionIndex - 1);
        audio.playTwinkle();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentSectionIndex < sections.length - 1) {
        goToSection(currentSectionIndex + 1);
        audio.playTwinkle();
      }
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
      if (currentSectionIndex < sections.length - 1) goToSection(currentSectionIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      if (currentSectionIndex > 0) goToSection(currentSectionIndex - 1);
    }
  });

  // Touch Navigation for mobile devices
  // Horizontal swipe navigates sections without blocking native vertical page scrolling!
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouchValid = false;

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

      // Do NOT trigger section swipe if touch started on 3D planet canvas, form inputs, modal card, or horizontal pets carousel
      const target = e.target;
      if (
        target.closest('#saturn-3d-canvas-container') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('.modal-card') ||
        target.closest('.pets-grid')
      ) {
        isTouchValid = false;
      } else {
        isTouchValid = true;
      }
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!isTouchValid || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const diffX = touchStartX - touch.clientX;
    const diffY = touchStartY - touch.clientY;

    // Must be a deliberate horizontal swipe:
    // 1. Horizontal distance > 65px
    // 2. Horizontal distance must be significantly greater than vertical distance (distinguish from vertical scroll)
    if (Math.abs(diffX) > 65 && Math.abs(diffX) > Math.abs(diffY) * 1.6) {
      if (diffX > 0 && currentSectionIndex < sections.length - 1) {
        // Swiped Left -> Go Next Section
        goToSection(currentSectionIndex + 1);
      } else if (diffX < 0 && currentSectionIndex > 0) {
        // Swiped Right -> Go Previous Section
        goToSection(currentSectionIndex - 1);
      }
    }
  }, { passive: true });

  // Music Toggle
  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      const playing = audio.toggleBGM();
      musicToggle.classList.toggle('playing', playing);
      showToast(playing ? '🎶 Nhạc vũ trụ dịu êm đã bật' : '🔇 Đã tắt âm thanh nền');
    });
  }

  // ===================================================
  // SECTION 1: CÁNH CỔNG VŨ TRỤ (EXPLORE BUTTON)
  // ===================================================
  const btnExplore = document.getElementById('btn-explore');
  if (btnExplore) {
    btnExplore.addEventListener('click', (e) => {
      const rect = btnExplore.getBoundingClientRect();
      const burstX = rect.left + rect.width / 2;
      const burstY = rect.top + rect.height / 2;

      // Burst particles
      galaxy.burstParticles(burstX, burstY, 65, '#ff4d94');
      audio.playTwinkle();

      // Start music automatically on user intent
      if (!audio.isPlaying) {
        audio.startBGM();
        if (musicToggle) musicToggle.classList.add('playing');
      }

      // Warp out Section 1 into Saturn Section
      goToSection(1, 'warp');
    });
  }

  // ===================================================
  // MODAL MANAGER
  // ===================================================
  const modalOverlay = document.getElementById('glass-modal');
  const modalIcon = document.getElementById('modal-icon');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function openModal(icon, title, subtitle, contentHtml) {
    if (modalIcon) modalIcon.textContent = icon;
    if (modalTitle) modalTitle.textContent = title;
    if (modalSubtitle) modalSubtitle.textContent = subtitle;
    if (modalBody) modalBody.innerHTML = contentHtml;

    if (modalOverlay) {
      modalOverlay.classList.add('active');
      audio.playTwinkle();
    }
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('active');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // ===================================================
  // SECTION 2: PINK SATURN WISHES
  // ===================================================
  const saturnWishes = [
    {
      title: "Luôn Xinh Đẹp Theo Cách Của Riêng Mình",
      subtitle: "Vẻ Đẹp Độc Bản",
      message: "Bạn không cần phải giống bất kỳ ai trên thế gian này. Nụ cười dịu dàng, ánh mắt lấp lánh và nét riêng biệt chính là thứ khiến bạn trở thành một vì sao độc nhất trong vũ trụ!"
    },
    {
      title: "Mong Bạn Luôn Được Yêu Thương Vô Điều Kiện",
      subtitle: "Ấm Áp & Trân Trọng",
      message: "Mong rằng mọi khoảnh khắc bạn đi qua đều có sự chở che, thấu hiểu và nâng niu. Bạn xứng đáng nhận được thứ tình cảm chân thành, ấm áp nhất."
    },
    {
      title: "Rực Rỡ Và Tự Tin Mỗi Ngày",
      subtitle: "Bản Lĩnh Nàng Thơ",
      message: "Dù cuộc sống có những ngày mây mù hay bão giông, mong bạn luôn giữ vững niềm tin vào chính mình. Bước đi với nụ cười kiêu hãnh và tỏa sáng rực rỡ nhé!"
    },
    {
      title: "Bình An & Dịu Dàng Trong Tâm Hồn",
      subtitle: "Chốn Bình Yên Thiên Hà",
      message: "Sau những bộn bề và lo toan thường nhật, chúc bạn luôn tìm thấy một góc an yên cho riêng mình. Uống một tách trà thơm, ngắm một bầu trời sao và mỉm cười thanh thản."
    },
    {
      title: "Luôn Có Người Lắng Nghe & Thấu Hiểu",
      subtitle: "Đồng Điệu Tri Kỷ",
      message: "Mong bạn luôn có một bờ vai vững chãi để tựa vào, một đôi tai kiên nhẫn lắng nghe những câu chuyện nhỏ to, và một trái tim luôn đồng điệu cùng bạn."
    },
    {
      title: "Mọi Ước Mơ Đều Xứng Đáng Được Đơm Hoa",
      subtitle: "Chắp Cánh Hoài Bão",
      message: "Đừng bao giờ ngần ngại theo đuổi những điều bạn khát khao. Cả vũ trụ này sẽ hiệp lực để giúp những hạt mầm ước mơ trong bạn đơm hoa rực rỡ nhất!"
    }
  ];

  // ===================================================
  // SECTION 2: PINK SATURN 3D ENGINE (THREE.JS WEBGL + DRAG-TO-ROTATE)
  // ===================================================
  let saturn3D = null;
  if (window.Saturn3DEngine) {
    saturn3D = new Saturn3DEngine('saturn-3d-canvas-container', 'orbit-wishes-container');
    saturn3D.onPlanetClick = () => {
      audio.playHeartbeat();
      galaxy.burstParticles(window.innerWidth / 2, window.innerHeight * 0.45, 50, '#ff8da1');
      openModal(
        '✨',
        `Pink Saturn: Hành Tinh Của ${recipientName}`,
        'Trung tâm năng lượng dịu dàng 20/10',
        `<p>Đây là hành tinh được hình thành từ <strong>bụi sao ngọt ngào và những đóa hoa vũ trụ</strong>. Bất cứ khi nào mỏi mệt, hãy ghé thăm nơi này để được nạp đầy năng lượng yêu thương và sự ấm áp nhé nàng!</p>`
      );
    };
  }

  const wishNodes = document.querySelectorAll('.orbit-wishes-3d-container .wish-node-item');
  wishNodes.forEach((node, idx) => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const wish = saturnWishes[idx % saturnWishes.length];
      if (saturn3D) saturn3D.isPaused = true;

      const rect = node.getBoundingClientRect();
      galaxy.burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 40, '#ff69b4');

      openModal(
        '🪐',
        wish.title,
        `Gửi tặng ${recipientName} • ${wish.subtitle}`,
        `<p>${wish.message}</p>`
      );

      // Resume orbit after closing modal
      const resumeHandler = () => {
        if (saturn3D) saturn3D.isPaused = false;
        if (modalCloseBtn) modalCloseBtn.removeEventListener('click', resumeHandler);
      };
      if (modalCloseBtn) modalCloseBtn.addEventListener('click', resumeHandler);
    });
  });

  // ===================================================
  // SECTION 3: CHÒM SAO TRÁI TIM (HEART CONSTELLATION)
  // ===================================================
  const constellationWishes = [
    { title: "Ngôi Sao Rạng Ngời", text: "Ánh mắt của bạn chứa cả một bầu trời sao lấp lánh và trong trẻo!" },
    { title: "Ngôi Sao Tự Tin", text: "Khí chất tự tin chính là chiếc vương miện lộng lẫy và kiêu hãnh nhất của nàng." },
    { title: "Ngôi Sao Dịu Dàng", text: "Sự dịu dàng và ấm áp của bạn có sức mạnh xua tan mọi muộn phiền xung quanh." },
    { title: "Ngôi Sao Hạnh Phúc", text: "Chúc bạn mỗi sớm mai thức dậy đều đón nhận một niềm vui bất ngờ và nụ cười rạng rỡ." },
    { title: "Ngôi Sao Kiên Cường", text: "Nhỏ nhắn mà phi thường, dịu êm mà bền bỉ vượt qua mọi thử thách." },
    { title: "Ngôi Sao Tình Yêu", text: "Bạn xứng đáng nhận được tình yêu thương chân thành, ngọt ngào nhất từ vũ trụ này!" },
    { title: "Ngôi Sao Bình An", text: "Chúc tâm hồn bạn luôn thanh tịnh, an yên như mặt hồ soi bóng trăng sao." },
    { title: "Ngôi Sao May Mắn", text: "May mắn và những điều tuyệt vời nhất sẽ luôn mỉm cười với bước chân nàng." },
    { title: "Trái Tim Thiên Hà", text: "Nơi hội tụ trọn vẹn tình yêu thương và những lời chúc ngọt ngào nhất ngày 20/10 dành riêng cho nàng!" }
  ];

  const constStars = document.querySelectorAll('.const-star-group');
  constStars.forEach((starGroup, idx) => {
    starGroup.addEventListener('click', (e) => {
      const rect = starGroup.getBoundingClientRect();
      galaxy.burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 35, '#ffeaa7');
      audio.playTwinkle();

      const item = constellationWishes[idx % constellationWishes.length];
      openModal('⭐', item.title, `Vì sao tinh tú dành riêng cho ${recipientName}`, `<p>${item.text}</p>`);
    });
  });

  const btnLightConstellation = document.getElementById('btn-light-constellation');
  if (btnLightConstellation) {
    btnLightConstellation.addEventListener('click', () => {
      audio.playHeartbeat();
      const stage = document.querySelector('.constellation-stage');
      if (stage) stage.classList.toggle('lit-up');
      galaxy.burstParticles(window.innerWidth / 2, window.innerHeight * 0.45, 60, '#ff4d94');
      showToast('💖 Toàn bộ chòm sao đã bừng sáng và kết nối trọn vẹn!');
    });
  }

  // ===================================================
  // SECTION 4: KHU VƯỜN HOA ÁNH SAO (STAR FLOWER GARDEN)
  // ===================================================
  const flowers = [
    {
      id: 'rose',
      name: 'Hoa Hồng Tinh Vân',
      meaning: 'Biểu tượng của Tình Yêu & Sự Quyến Rũ',
      message: `Như một đóa hồng đắm mình trong ánh sao tím, chúc ${recipientName} luôn ngát hương, rạng rỡ và luôn nhận được sự trân trọng chân thành nhất!`
    },
    {
      id: 'tulip',
      name: 'Hoa Tulip Ánh Trăng',
      meaning: 'Biểu tượng của Tự Tin & Duyên Dáng',
      message: `Hoa Tulip vươn mình kiêu hãnh giữa không gian. Chúc ${recipientName} luôn tự tin theo đuổi lý tưởng và ước mơ của riêng mình.`
    },
    {
      id: 'daisy',
      name: 'Cúc Họa Mi Bụi Sao',
      meaning: 'Biểu tượng của Bình An & Thuần Khiết',
      message: `Một đóa cúc nhỏ mang đến cảm giác thanh bình và dịu nhẹ. Chúc tâm hồn bạn luôn trong trẻo, an yên trước mọi thăng trầm cuộc đời.`
    },
    {
      id: 'lily',
      name: 'Bách Hợp Thiên Hà',
      meaning: 'Biểu tượng của Hạnh Phúc & Quý Phái',
      message: `Bách Hợp nở rộ dưới ánh hào quang ngọc trai, tượng trưng cho hạnh phúc viên mãn. Chúc nàng luôn được sống trong sự ngọt ngào ngập tràn.`
    }
  ];

  const flowerCards = document.querySelectorAll('.flower-card');
  flowerCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      const fl = flowers[idx];
      const rect = card.getBoundingClientRect();
      galaxy.burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 45, '#ff8da1');
      audio.playTwinkle();

      openModal(
        '🌸',
        fl.name,
        fl.meaning,
        `<p>${fl.message}</p>`
      );
    });
  });

  // ===================================================
  // SECTION 5: NHỮNG NGƯỜI BẠN THIÊN HÀ (GALAXY PETS)
  // ===================================================
  const petCards = document.querySelectorAll('.pet-card');
  const petQuotes = [
    [
      "Meo meo! Hôm nay cậu là công chúa, ngày mai cũng thế, và tất cả những ngày sau nữa! 👑",
      "Mèo mây chúc cậu luôn vui vẻ, ăn ngon ngủ ngon và không có muộn phiền nào dám làm phiền cậu! 🐾",
      "Cậu chính là cô gái đáng yêu nhất dải ngân hà này đấy! Tin tớ đi! ✨"
    ],
    [
      "Thỏ ngọc ôm trái tim phát sáng để tặng riêng cho cậu nè! 💖",
      "Nụ cười của cậu chính là thứ thắp sáng cả dải ngân hà này đấy! 🐰",
      "Chúc cậu luôn được ôm ấp trong sự ngọt ngào và những điều tốt đẹp nhất!"
    ],
    [
      "Gâu gâu! Cún đem bức thư vũ trụ tới chuyển phát nhanh cho nàng đây! 💌",
      "Cún chúc bạn 20/10 nhận được thật nhiều hoa, nhiều quà và ngập tràn lời chúc! 🐶",
      "Mỗi bước chân của cậu đều để lại những vệt sáng lấp lánh như sao băng vậy!"
    ]
  ];

  petCards.forEach((card, petIdx) => {
    card.addEventListener('click', () => {
      audio.playCutePetChirp();
      const rect = card.getBoundingClientRect();
      galaxy.burstParticles(rect.left + rect.width / 2, rect.top + 60, 35, '#ffb8d2');

      // Update speech bubble with random cute quote
      const bubble = card.querySelector('.speech-bubble');
      if (bubble) {
        const quotes = petQuotes[petIdx];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        bubble.textContent = randomQuote;
        bubble.style.transform = 'scale(1.1)';
        setTimeout(() => { bubble.style.transform = 'scale(1)'; }, 300);
      }
    });
  });

  // Secret Easter Egg Star in Section 5
  const secretStar = document.getElementById('secret-pet-star');
  let secretClicks = 0;
  if (secretStar) {
    secretStar.addEventListener('click', (e) => {
      e.stopPropagation();
      secretClicks++;
      audio.playTwinkle();
      galaxy.burstParticles(e.clientX, e.clientY, 20, '#ffeaa7');

      if (secretClicks >= 3) {
        secretClicks = 0;
        openModal(
          '🐱‍🚀',
          'Mèo Thần Tài Vũ Trụ Xuất Hiện!',
          `Bí mật ẩn giấu dành cho ${recipientName}`,
          `<p>🎉 Bạn vừa tìm thấy chìa khóa bí mật của vũ trụ Pink Galaxy! Chú Mèo Thần Tài chúc bạn:</p>
           <ul style="text-align: left; margin: 12px 20px; line-height: 1.8;">
             <li>🌸 365 ngày luôn xinh tươi như hoa</li>
             <li>💎 Ví tiền rủng rỉnh, sự nghiệp rạng rỡ</li>
             <li>💖 Luôn có người cưng chiều, nâng niu như báu vật!</li>
           </ul>`
        );
      } else {
        showToast(`✨ Chạm thêm ${3 - secretClicks} lần nữa để mở khóa bí mật thiên hà!`);
      }
    });
  }

  // ===================================================
  // SECTION 6: CƠN MƯA SAO BĂNG ƯỚC NGUYỆN (WISH METEORS)
  // ===================================================
  const wishInput = document.getElementById('wish-text-input');
  const btnSendWish = document.getElementById('btn-send-wish');
  const skyWishDisplay = document.getElementById('sky-wish-display');
  const wishTags = document.querySelectorAll('.wish-tag-pill');
  const wishJar = document.getElementById('wish-jar-trigger');

  wishTags.forEach(tag => {
    tag.addEventListener('click', () => {
      wishTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      if (wishInput) wishInput.value = tag.getAttribute('data-wish');
      audio.playTwinkle();
    });
  });

  function launchCelestialRocket(text, onMidFlight, onDone) {
    const rocket = document.createElement('div');
    rocket.className = 'space-rocket-flyer';
    rocket.innerHTML = `
      <svg viewBox="0 0 100 160" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="rocketBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="50%" stop-color="#fce7f3"/>
            <stop offset="100%" stop-color="#f472b6"/>
          </linearGradient>
          <radialGradient id="flameOuterGrad" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="35%" stop-color="#f59e0b"/>
            <stop offset="70%" stop-color="#ff4d94"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <!-- Thruster Exhaust Jet Flame -->
        <g class="rocket-flames">
          <path class="flame-outer" d="M 40 120 Q 50 168 50 162 Q 50 168 60 120 Z" fill="url(#flameOuterGrad)"/>
          <path class="flame-inner" d="M 45 120 Q 50 150 50 148 Q 50 150 55 120 Z" fill="#ffffff"/>
        </g>
        <!-- Thruster Nozzle -->
        <rect x="42" y="112" width="16" height="8" rx="2" fill="#475569" stroke="#cbd5e1" stroke-width="1"/>
        <!-- Fins -->
        <path d="M 32 88 L 14 116 L 32 110 Z" fill="#e11d48" filter="drop-shadow(0 0 6px #ff4d94)"/>
        <path d="M 68 88 L 86 116 L 68 110 Z" fill="#e11d48" filter="drop-shadow(0 0 6px #ff4d94)"/>
        <!-- Fuselage -->
        <path d="M 50 8 C 30 40 30 90 32 112 L 68 112 C 70 90 70 40 50 8 Z" fill="url(#rocketBodyGrad)" stroke="#fda4af" stroke-width="1.8"/>
        <!-- Nose Cone -->
        <path d="M 50 8 C 42 22 38 38 38 44 L 62 44 C 62 38 58 22 50 8 Z" fill="#e11d48"/>
        <!-- Cockpit Porthole -->
        <circle cx="50" cy="62" r="13" fill="#0f172a" stroke="#ffeaa7" stroke-width="2.5"/>
        <circle cx="50" cy="62" r="9" fill="#38bdf8" opacity="0.9"/>
        <circle cx="47" cy="59" r="3.2" fill="#ffffff" opacity="0.85"/>
        <!-- Pink Starlight Heart Decal -->
        <path d="M 50 88 C 46 82 38 86 44 93 L 50 98 L 56 93 C 62 86 54 82 50 88 Z" fill="#ff4d94" filter="drop-shadow(0 0 4px #ff4d94)"/>
      </svg>
    `;
    document.body.appendChild(rocket);

    // Smoke and spark particle trail
    const trailInterval = setInterval(() => {
      const rect = rocket.getBoundingClientRect();
      if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
        return;
      }
      // Thruster position (bottom nozzle rotated 45 deg)
      const nozzleX = rect.left + rect.width * 0.18;
      const nozzleY = rect.top + rect.height * 0.82;

      // Spawn smoke puff
      const puff = document.createElement('div');
      puff.className = 'rocket-smoke-puff';
      const size = 18 + Math.random() * 20;
      puff.style.width = `${size}px`;
      puff.style.height = `${size}px`;
      puff.style.left = `${nozzleX - size / 2}px`;
      puff.style.top = `${nozzleY - size / 2}px`;
      document.body.appendChild(puff);
      setTimeout(() => puff.remove(), 1100);

      // Trigger sparkle particle on canvas
      if (Math.random() < 0.6) {
        galaxy.burstParticles(nozzleX, nozzleY, 4, '#ffeaa7');
      }
    }, 45);

    // Mid-flight trigger
    setTimeout(() => {
      if (typeof onMidFlight === 'function') onMidFlight();
    }, 1100);

    // End of flight cleanup
    setTimeout(() => {
      clearInterval(trailInterval);
      rocket.remove();
      if (typeof onDone === 'function') onDone();
    }, 2200);
  }

  function sendWish(text) {
    if (!text || text.trim() === '') {
      showToast('🌟 Hãy nhập hoặc chọn một điều ước trước nhé!');
      return;
    }

    if (btnSendWish) {
      btnSendWish.disabled = true;
      btnSendWish.innerHTML = `<span>Đang Phóng...</span> 🚀`;
    }

    // Play rocket launch audio
    if (audio.playRocketLaunch) {
      audio.playRocketLaunch();
    } else {
      audio.playShootingStarSound();
    }

    // Launch flying rocket across the sky
    launchCelestialRocket(
      text,
      // Mid-flight: rocket crosses zenith
      () => {
        // Celestial stardust explosions
        galaxy.burstParticles(window.innerWidth * 0.52, window.innerHeight * 0.35, 70, '#ff4d94');
        galaxy.burstParticles(window.innerWidth * 0.52, window.innerHeight * 0.35, 45, '#ffeaa7');
        galaxy.launchWishShootingStar(text, null);

        // Sound celebration
        audio.playGrandCelebrationChime();

        // Reveal wish in the sky
        if (skyWishDisplay) {
          skyWishDisplay.innerHTML = `
            <div class="wish-sky-card">
              <div class="wish-sky-title">🚀 ĐIỀU ƯỚC 20/10 ĐÃ ĐƯỢC PHÓNG VÀO VŨ TRỤ 💖</div>
              <div class="wish-sky-text">“${text}”</div>
              <div class="wish-sky-blessing">
                ✨ Tên lửa ngân hà đã mang theo ước mơ của <strong>${recipientName}</strong> bay đến chòm sao rực rỡ nhất! Chắc chắn mọi điều tốt đẹp và ngọt ngào sẽ thành hiện thực! ✨
              </div>
            </div>
          `;
          skyWishDisplay.style.display = 'block';
        }
      },
      // Flight complete
      () => {
        if (btnSendWish) {
          btnSendWish.disabled = false;
          btnSendWish.innerHTML = `<span>Phóng Lên Trời</span> 🚀`;
        }
        showToast(`🚀 Tên lửa đã đưa điều ước của ${recipientName} bay vào vũ trụ! ✨`);
      }
    );
  }

  if (btnSendWish) {
    btnSendWish.addEventListener('click', () => {
      const text = wishInput ? wishInput.value.trim() : '';
      sendWish(text);
    });
  }

  if (wishInput) {
    wishInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendWish(wishInput.value.trim());
      }
    });
  }

  // Floating Wish Jar
  const jarWishes = [
    "Mong bạn luôn nhận được những cái ôm ấm áp sau một ngày dài mỏi mệt.",
    "Chúc bạn luôn có đủ dũng khí để sống đúng với những gì trái tim bạn mong muốn.",
    "Mong những người bạn yêu thương đều luôn khỏe mạnh, bình an và trân quý bạn.",
    "Chúc bạn luôn giữ được nét hồn nhiên, đôi mắt sáng và nụ cười rực rỡ như thuở ban đầu.",
    "Mong mọi giọt nước mắt nếu có rơi cũng chỉ là vì niềm hạnh phúc vỡ òa."
  ];

  if (wishJar) {
    wishJar.addEventListener('click', () => {
      audio.playTwinkle();
      const randomJarWish = jarWishes[Math.floor(Math.random() * jarWishes.length)];
      galaxy.burstParticles(window.innerWidth / 2, window.innerHeight / 2, 45, '#ffeaa7');

      openModal(
        '🏺',
        'Lời Chúc Rút Từ Lọ Thủy Tinh',
        `Món quà tinh tú dành cho ${recipientName}`,
        `<p style="font-style: italic; font-size: 1.1rem; color: #ffeaa7;">“${randomJarWish}”</p>`
      );
    });
  }

  // ===================================================
  // SECTION 7: LÁ THƯ CUỐI CÙNG (GRAND 20/10 LETTER)
  // ===================================================
  const alternateWishes = [
    `Chúc ${recipientName} luôn rạng rỡ như những vì sao, dịu dàng nhưng mạnh mẽ, luôn được trân trọng, yêu thương và tự do trở thành phiên bản tuyệt vời nhất của chính mình!`,
    `Gửi đến ${recipientName}: 20/10 này chúc bạn có thật nhiều niềm vui, luôn tự tin bước đi trên con đường mình chọn. Cả vũ trụ đều đang dõi theo và ủng hộ bạn!`,
    `Chúc ${recipientName} một ngày 20/10 ngập tràn hoa tươi và quà tặng. Nhưng món quà quý giá nhất trần đời chính là nụ cười hạnh phúc của bạn mỗi ngày!`,
    `Mong ${recipientName} luôn được là chính mình: tự do, kiêu hãnh và được yêu thương theo cách mà bạn xứng đáng nhất trong cuộc đời này.`
  ];
  let wishIndex = 0;

  const btnCycleWish = document.getElementById('btn-cycle-wish');
  const letterQuote = document.getElementById('letter-quote-text');

  if (btnCycleWish && letterQuote) {
    btnCycleWish.addEventListener('click', () => {
      wishIndex = (wishIndex + 1) % alternateWishes.length;
      letterQuote.style.opacity = '0';
      audio.playTwinkle();

      setTimeout(() => {
        letterQuote.textContent = alternateWishes[wishIndex];
        letterQuote.style.opacity = '1';
        galaxy.burstParticles(window.innerWidth / 2, window.innerHeight * 0.6, 30, '#ff69b4');
      }, 300);
    });
  }

  // Share & Copy greeting
  const btnShareCard = document.getElementById('btn-share-card');
  if (btnShareCard) {
    btnShareCard.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(recipientName)}`;
      const shareText = `🌸 PINK GALAXY 20/10 — Món quà vũ trụ dịu dàng dành tặng ${recipientName}:\n${shareUrl}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          audio.playTwinkle();
          showToast('📋 Đã sao chép liên kết thiệp kèm tên nàng vào bộ nhớ tạm!');
        }).catch(() => {
          prompt('Sao chép đường dẫn gửi tặng:', shareUrl);
        });
      } else {
        prompt('Sao chép đường dẫn gửi tặng:', shareUrl);
      }
    });
  }

  // Restart Journey Button & Header Logo
  const btnRestartJourney = document.getElementById('btn-restart-journey');
  const btnRestartHeader = document.getElementById('btn-restart-header');
  
  if (btnRestartJourney) {
    btnRestartJourney.addEventListener('click', () => {
      goToSection(0);
      audio.playTwinkle();
    });
  }
  if (btnRestartHeader) {
    btnRestartHeader.addEventListener('click', () => {
      goToSection(0);
      audio.playTwinkle();
    });
  }

  // ===================================================
  // TOAST NOTIFICATIONS
  // ===================================================
  const toast = document.getElementById('toast-notice');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
});
