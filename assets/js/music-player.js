/* ============================================================
   MUSIC PLAYER + GLOBAL CLICK SFX
   File terpisah dari script.js agar error di script.js
   (mis. elemen null) tidak ikut mematikan fitur ini.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- KONFIGURASI ---------- */
  const PLAYLIST = [
    // cover boleh dikosongkan ("") -> memakai label hijau default di tengah piringan
    { title: "Spring (It's a Big World Outside)", artist: "Stardew Valley OST", src: "assets/audio/music/Stardew Valley OST - Spring It's a Big World Outside.mp3", cover: "assets/img/background/stardew-valley-cover.jpg" },
    { title: "Cloud Country", artist: "Stardew Valley OST", src: "assets/audio/music/Stardew Valley OST - Cloud Country.mp3", cover: "assets/img/background/stardew-valley-cover.jpg" },
    { title: "Pelican Town", artist: "Stardew Valley OST", src: "assets/audio/music/Stardew Valley OST - Pelican Town.mp3", cover: "assets/img/background/stardew-valley-cover.jpg" },
  ];
  const MUSIC_VOLUME = 0.35;          // 0.0 - 1.0
  const INTRO_DELAY = 400;            // ms setelah preloader selesai (slide-up widget + mulai musik)
  const AUTO_CLOSE_DELAY = 0;         // ms; 0 = widget tetap terbuka sampai ditutup manual
  const STATE_KEY = "itb-music-state";

  // Dua suara berbeda: klik area biasa vs klik elemen interaktif (tombol, link, dll.)
  const SFX = {
    click:  { src: "assets/audio/sfx/click.ogg.mp3",  volume: 0.5, synth: { type: "square", from: 240, to: 90,  dur: 0.06, gain: 0.12 } },
    button: { src: "assets/audio/sfx/button.mp3", volume: 0.6, synth: { type: "square", from: 420, to: 640, dur: 0.09, gain: 0.10 } },
  };
  const SFX_POOL_SIZE = 5;
  // Elemen yang dianggap "tombol" -> bunyi SFX.button. Tambah selector sendiri bila perlu.
  // Override per elemen lewat atribut: data-sfx="button" | "click" | "none"
  const SFX_BUTTON_SELECTOR = [
    "a[href]", "button", "summary", "select", '[role="button"]',
    'input[type="button"]', 'input[type="submit"]', 'input[type="reset"]',
    'input[type="checkbox"]', 'input[type="radio"]', 'input[type="file"]',
    "[data-status-option]", "[data-payment-card]",
    ".btn", ".btn-pixel", ".btn-daftar", ".register-btn", ".retro-btn", ".copy-btn","nav__link-badge",
    ".navbar__toggle", ".hamburger",
  ].join(",");

  /* ============================================================
     1. GLOBAL CLICK SFX
     ============================================================ */
  function initClickSfx() {
    let ctx = null;
    let lastPlay = 0;

    // Membuat satu "suara": pool audio + cadangan sintetis bila file tidak ada.
    // Cadangan ini BUKAN suara Minecraft asli — hanya agar fitur tetap terdengar.
    function createSfx(cfg) {
      const pool = [];
      let cursor = 0;
      let failed = false;

      for (let i = 0; i < SFX_POOL_SIZE; i++) {
        const a = new Audio(cfg.src);
        a.preload = "auto";
        a.volume = cfg.volume;
        a.addEventListener("error", () => { failed = true; }, { once: true });
        pool.push(a);
      }

      function synth() {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          ctx = ctx || new AC();
          const t = ctx.currentTime;
          const c = cfg.synth;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = c.type;
          osc.frequency.setValueAtTime(c.from, t);
          osc.frequency.exponentialRampToValueAtTime(c.to, t + c.dur * 0.8);
          gain.gain.setValueAtTime(c.gain, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + c.dur);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + c.dur + 0.01);
        } catch (e) { /* diabaikan */ }
      }

      return function play() {
        if (failed) return synth();
        const a = pool[cursor];
        cursor = (cursor + 1) % pool.length;
        try { a.currentTime = 0; } catch (err) {}
        const p = a.play();
        if (p && p.catch) p.catch(() => {});
      };
    }

    const players = { click: createSfx(SFX.click), button: createSfx(SFX.button) };

    function typeFor(target) {
      if (!(target instanceof Element)) return "click";
      const override = target.closest("[data-sfx]");
      if (override) {
        const v = override.getAttribute("data-sfx");
        if (v === "none") return null;
        if (players[v]) return v;
      }
      return target.closest(SFX_BUTTON_SELECTOR) ? "button" : "click";
    }

    function onClick(e) {
      if (e.isTrusted === false) return;               // abaikan klik programatik (mis. fileInput.click())
      const now = performance.now();
      if (now - lastPlay < 40) return;                 // cegah bunyi ganda: klik label -> klik input
      const type = typeFor(e.target);
      if (!type) return;
      lastPlay = now;
      players[type]();
    }

    // capture = true supaya tetap bunyi walau ada handler lain yang stopPropagation()
    document.addEventListener("click", onClick, true);
  }

  /* ============================================================
     2. MUSIC PLAYER
     ============================================================ */
  function initMusicPlayer() {
    const root = document.getElementById("music-player");
    if (!root || !PLAYLIST.length) return;

    const toggleBtn = document.getElementById("mp-toggle");
    const playBtn = document.getElementById("mp-play");
    const titleEl = document.getElementById("mp-title");
    const artistEl = document.getElementById("mp-artist");
    const coverEl = document.getElementById("mp-cover");
    if (!toggleBtn || !playBtn || !titleEl || !artistEl || !coverEl) return;

    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = MUSIC_VOLUME;

    let index = 0;
    let userPaused = false;       // true bila pengguna sendiri menekan pause
    let errorStreak = 0;
    let autoCloseTimer = null;
    let waitingGesture = false;
    let lastSave = 0;

    /* ----- state antar-halaman (situs multi-halaman: musik lanjut, bukan mulai dari 0) ----- */
    function readState() {
      try { return JSON.parse(sessionStorage.getItem(STATE_KEY)) || null; } catch (e) { return null; }
    }
    function saveState() {
      try {
        sessionStorage.setItem(STATE_KEY, JSON.stringify({
          index: index,
          time: audio.currentTime || 0,
          playing: !userPaused,
          open: root.classList.contains("is-open"),
        }));
      } catch (e) {}
    }

    /* ----- buka / tutup widget ----- */
    function setOpen(open) {
      root.classList.toggle("is-open", open);
      toggleBtn.setAttribute("aria-expanded", String(open));
      toggleBtn.setAttribute("aria-label", open ? "Tutup music player" : "Buka music player");
      clearTimeout(autoCloseTimer);
      if (open && AUTO_CLOSE_DELAY > 0) {
        autoCloseTimer = setTimeout(() => setOpen(false), AUTO_CLOSE_DELAY);
      }
      saveState();
    }

    /* ----- kebijakan autoplay browser: tanpa interaksi, play() ditolak -----
       Solusi: tunggu klik/tombol pertama pengguna (di luar widget), lalu putar. */
    function waitForGesture() {
      if (waitingGesture) return;
      waitingGesture = true;
      const events = ["click", "keydown", "touchend"];
      const handler = (e) => {
        if (root.contains(e.target)) return;           // biarkan kontrol widget bekerja sendiri
        stopWaiting();
        if (!userPaused && audio.paused) audio.play().catch(() => {});
      };
      function stopWaiting() {
        waitingGesture = false;
        events.forEach((ev) => document.removeEventListener(ev, handler, true));
      }
      audio._stopWaiting = stopWaiting;
      events.forEach((ev) => document.addEventListener(ev, handler, true));
    }

    function tryPlay() {
      const p = audio.play();
      if (p && p.catch) {
        p.catch((err) => {
          if (err && err.name === "NotAllowedError") waitForGesture();
        });
      }
    }

    /* ----- muat lagu ----- */
    function loadTrack(i, opts) {
      const o = Object.assign({ play: true, time: 0, announce: true }, opts || {});
      index = (i + PLAYLIST.length) % PLAYLIST.length;
      const t = PLAYLIST[index];

      audio.src = t.src;
      if (o.time > 0) {
        audio.addEventListener("loadedmetadata", () => {
          try { audio.currentTime = o.time; } catch (e) {}
        }, { once: true });
      }

      titleEl.textContent = t.title;
      artistEl.textContent = t.artist || "";
      if (t.cover) {
        coverEl.src = t.cover;
        coverEl.hidden = false;
      } else {
        coverEl.removeAttribute("src");
        coverEl.hidden = true;
      }

      if (o.announce) setOpen(true);                   // lagu berganti -> widget otomatis terbuka
      if (o.play) tryPlay();
      saveState();
    }

    /* ----- event audio ----- */
    audio.addEventListener("play", () => {
      root.classList.add("is-playing");
      playBtn.setAttribute("aria-label", "Jeda musik");
      if (audio._stopWaiting) audio._stopWaiting();
    });
    audio.addEventListener("pause", () => {
      root.classList.remove("is-playing");
      playBtn.setAttribute("aria-label", "Putar musik");
    });
    audio.addEventListener("playing", () => { errorStreak = 0; });
    audio.addEventListener("ended", () => loadTrack(index + 1));    // auto next + auto open
    audio.addEventListener("error", () => {
      errorStreak++;
      if (errorStreak < PLAYLIST.length) {
        loadTrack(index + 1);                          // lewati file yang gagal dimuat
      } else {
        titleEl.textContent = "Lagu tidak ditemukan";
        artistEl.textContent = "Periksa path di PLAYLIST";
        root.classList.remove("is-playing");
      }
    });
    audio.addEventListener("timeupdate", () => {
      const now = Date.now();
      if (now - lastSave > 1000) { lastSave = now; saveState(); }
    });
    window.addEventListener("pagehide", saveState);

    /* ----- kontrol ----- */
    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        userPaused = false;
        if (!audio.src) loadTrack(index, { announce: false });
        else audio.play().catch(() => {});
      } else {
        userPaused = true;
        audio.pause();
      }
      saveState();
    });
    toggleBtn.addEventListener("click", () => setOpen(!root.classList.contains("is-open")));

    /* ----- inisialisasi ----- */
    const saved = readState();
    if (saved && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < PLAYLIST.length) {
      index = saved.index;
      userPaused = saved.playing === false;
    }
    // Muat lagu (preload) tetapi JANGAN diputar dulu — putar setelah preloader selesai.
    loadTrack(index, {
      play: false,
      time: saved ? saved.time : 0,
      announce: false,
    });

    // Widget slide-up, (opsional) musik mulai, lalu kartu bergeser ke kanan
    function intro(startMusic) {
      root.classList.add("is-ready");
      if (startMusic && !userPaused) tryPlay();        // bila diblokir browser -> menunggu klik pertama
      const wantOpen = !(saved && saved.open === false);
      if (wantOpen) setTimeout(() => setOpen(true), 600);
    }

    // Menunggu class "preloader-hidden" (ditambahkan script.js) pada #preloader.
    function onPreloaderDone(fn) {
      let finished = false;
      let observer = null;
      const run = () => {
        if (finished) return;
        finished = true;
        if (observer) observer.disconnect();
        setTimeout(fn, INTRO_DELAY);
      };
      const pre = document.getElementById("preloader");

      if (!pre || pre.classList.contains("preloader-hidden")) {
        if (document.readyState === "complete") run();
        else window.addEventListener("load", run);
        return;
      }
      observer = new MutationObserver(() => {
        if (pre.classList.contains("preloader-hidden")) run();
      });
      observer.observe(pre, { attributes: true, attributeFilter: ["class"] });
      // Jaring pengaman: jangan menunggu selamanya bila class tidak pernah muncul
      window.addEventListener("load", () => setTimeout(run, 6000));
    }

    if (window.ITB_ENTRY && window.ITB_ENTRY.active) {
      // Mode "Klik untuk masuk" (entry-gate.js): musik mulai tepat saat klik,
      // widget baru muncul setelah animasi awan selesai.
      document.addEventListener("itb:entry-click", () => { if (!userPaused) tryPlay(); }, { once: true });
      document.addEventListener("itb:entry-done", () => intro(false), { once: true });
    } else {
      onPreloaderDone(() => intro(true));
    }
  }

  initClickSfx();
  initMusicPlayer();
})();
