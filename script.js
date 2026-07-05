(function () {
  "use strict";

  /* ===== Config ===== */
  var THEMES = {
    emoji: {
      label: "Эмодзи",
      data: [
        "🚀",
        "🌟",
        "🎯",
        "🎨",
        "🧩",
        "💎",
        "🦋",
        "🌺",
        "🐶",
        "🐱",
        "🐼",
        "🐨",
        "🦊",
        "🐸",
        "🦁",
        "🐯",
        "🐰",
        "🐹",
        "🐧",
        "🦉",
        "🦅",
        "🐝",
        "🐞",
        "🌻",
        "🌹",
        "🍀",
        "🍄",
        "🌈",
        "⭐",
        "🌙",
        "☀️",
        "🔥",
        "💧",
        "❄️",
        "⚡",
        "🍕",
        "🍦",
        "🍩",
        "🍉",
        "🍇",
        "🍓",
        "🍋",
        "🍊",
        "🍌",
        "🥝",
        "🍑",
        "🎸",
        "🎵",
        "🎮",
        "📚",
        "✏️",
        "📷",
        "💡",
        "🔑",
        "🎁",
        "🎈",
        "🎪",
        "🎭",
        "🎢",
        "🎡",
      ],
    },
    shapes: {
      label: "Фигуры",
      data: [
        "circle",
        "square",
        "triangle",
        "star",
        "diamond",
        "hexagon",
        "heart",
        "cross",
        "crescent",
        "arrow",
        "lightning",
        "sun",
        "moon",
        "cloud",
        "drop",
        "flower",
        "leaf",
        "spiral",
        "ring",
        "infinity",
        "plus",
        "minus",
        "multiply",
        "divide",
        "arrow-up",
        "arrow-down",
        "arrow-left",
        "arrow-right",
        "play",
        "pause",
      ],
    },
    images: {
      label: "Картинки",
      data: [
        "images/card-1.svg",
        "images/card-2.svg",
        "images/card-3.svg",
        "images/card-4.svg",
        "images/card-5.svg",
        "images/card-6.svg",
        "images/card-7.svg",
        "images/card-8.svg",
        "images/card-9.svg",
        "images/card-10.svg",
        "images/card-11.svg",
        "images/card-12.svg",
        "images/card-13.svg",
        "images/card-14.svg",
        "images/card-15.svg",
        "images/card-16.svg",
        "images/card-17.svg",
        "images/card-18.svg",
        "images/card-19.svg",
        "images/card-20.svg",
        "images/card-21.svg",
        "images/card-22.svg",
        "images/card-23.svg",
        "images/card-24.svg",
      ],
    },
  };

  var DIFFICULTIES = {
    easy: { cols: 3, pairs: 3, label: "Лёгкий", desc: "3×2 · 6 карточек" },
    medium: { cols: 4, pairs: 6, label: "Средний", desc: "4×3 · 12 карточек" },
    hard: { cols: 4, pairs: 8, label: "Сложный", desc: "4×4 · 16 карточек" },
  };

  var SESSION_KEY = "memory-game-theme";

  /* ===== State ===== */
  var state = {
    theme: loadTheme(),
    difficulty: null,
    cards: [],
    flippedIds: [],
    locked: false,
    moves: 0,
    timerStart: null,
    elapsed: 0,
    timerInterval: null,
    won: false,
  };

  /* ===== Helpers ===== */
  function loadTheme() {
    try {
      var saved = sessionStorage.getItem(SESSION_KEY);
      if (saved === "emoji" || saved === "shapes" || saved === "images") {
        return saved;
      }
    } catch (_) {}
    return "emoji";
  }

  function saveTheme(t) {
    try {
      sessionStorage.setItem(SESSION_KEY, t);
    } catch (_) {}
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function createCards(diff, theme) {
    var config = DIFFICULTIES[diff];
    var themeData = THEMES[theme].data;
    var shuffled = shuffle(themeData);
    var selected = shuffled.slice(0, config.pairs);
    var pairs = [];
    for (var i = 0; i < selected.length; i++) {
      pairs.push({ id: i * 2, pairId: i, content: selected[i] });
      pairs.push({ id: i * 2 + 1, pairId: i, content: selected[i] });
    }
    return shuffle(pairs);
  }

  function shapeSVG(name, className) {
    var size = 40;
    var viewBox = "0 0 100 100";
    var cls = className ? ' class="' + className + '"' : "";

    switch (name) {
      case "circle":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><circle cx="50" cy="50" r="40"/></svg>'
        );
      case "square":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><rect x="15" y="15" width="70" height="70" rx="4"/></svg>'
        );
      case "triangle":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="50,10 90,80 10,80"/></svg>'
        );
      case "star":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="50,5 63,35 95,38 70,60 77,92 50,76 23,92 30,60 5,38 37,35"/></svg>'
        );
      case "diamond":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="50,5 95,50 50,95 5,50"/></svg>'
        );
      case "hexagon":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="50,5 82,25 82,75 50,95 18,75 18,25"/></svg>'
        );
      case "heart":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><path d="M50,85 C25,65 5,50 5,35 C5,20 18,10 30,15 C40,18 45,25 50,35 C55,25 60,18 70,15 C82,10 95,20 95,35 C95,50 75,65 50,85Z"/></svg>'
        );
      case "cross":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><rect x="40" y="5" width="20" height="90" rx="4"/><rect x="5" y="40" width="90" height="20" rx="4"/></svg>'
        );
      case "crescent":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><path d="M60,10 C78,10 92,28 92,50 C92,72 78,90 60,90 C45,90 32,80 25,66 C35,72 48,75 60,75 C78,75 82,60 82,50 C82,40 78,25 60,25 C48,25 35,28 25,34 C32,20 45,10 60,10Z"/></svg>'
        );
      case "arrow":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="10,40 60,40 60,15 95,50 60,85 60,60 10,60"/></svg>'
        );
      case "lightning":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="55,5 55,40 95,40 50,95 45,60 5,60 50,5"/></svg>'
        );
      case "sun":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><circle cx="50" cy="50" r="18"/><line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="50" y1="85" x2="50" y2="95" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="5" y1="50" x2="15" y2="50" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="85" y1="50" x2="95" y2="50" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="18" y1="18" x2="25" y2="25" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="75" y1="75" x2="82" y2="82" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="82" y1="18" x2="75" y2="25" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><line x1="18" y1="82" x2="25" y2="75" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>'
        );
      case "moon":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><path d="M65,10 C80,20 90,40 90,55 C90,72 78,88 60,90 C75,78 82,60 78,42 C74,26 62,14 45,12 C52,10 58,10 65,10Z"/></svg>'
        );
      case "cloud":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><ellipse cx="50" cy="55" rx="35" ry="20"/><circle cx="35" cy="48" r="18"/><circle cx="58" cy="44" r="20"/></svg>'
        );
      case "drop":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><path d="M50,5 C50,5 15,50 15,70 C15,90 30,95 50,95 C70,95 85,90 85,70 C85,50 50,5 50,5Z"/></svg>'
        );
      case "flower":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><circle cx="50" cy="30" r="14"/><circle cx="32" cy="45" r="14"/><circle cx="68" cy="45" r="14"/><circle cx="38" cy="68" r="14"/><circle cx="62" cy="68" r="14"/><circle cx="50" cy="50" r="10"/></svg>'
        );
      case "leaf":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><path d="M50,95 C50,95 15,60 15,35 C15,15 30,5 50,5 C70,5 85,15 85,35 C85,50 65,75 50,95Z"/><line x1="50" y1="15" x2="50" y2="65" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
        );
      case "spiral":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><path d="M50,15 C30,15 18,30 20,50 C22,70 40,80 55,78 C70,76 78,60 76,48 C74,36 60,30 50,34 C40,38 36,50 40,58 C44,66 55,68 60,62" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>'
        );
      case "ring":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" stroke-width="6"/></svg>'
        );
      case "infinity":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><path d="M50,50 C50,25 72,25 72,50 C72,75 50,75 50,50 C50,25 28,25 28,50 C28,75 50,75 50,50Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>'
        );
      case "plus":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>'
        );
      case "minus":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>'
        );
      case "multiply":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></svg>'
        );
      case "divide":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="25" r="6"/><circle cx="50" cy="75" r="6"/></svg>'
        );
      case "arrow-up":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="50,10 90,60 60,60 60,90 40,90 40,60 10,60"/></svg>'
        );
      case "arrow-down":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="50,90 10,40 40,40 40,10 60,10 60,40 90,40"/></svg>'
        );
      case "arrow-left":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="10,50 60,10 60,40 90,40 90,60 60,60 60,90"/></svg>'
        );
      case "arrow-right":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="90,50 40,10 40,40 10,40 10,60 40,60 40,90"/></svg>'
        );
      case "play":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><polygon points="25,15 85,50 25,85"/></svg>'
        );
      case "pause":
        return (
          '<svg width="' +
          size +
          '" height="' +
          size +
          '" viewBox="' +
          viewBox +
          '"' +
          cls +
          ' fill="currentColor"><rect x="25" y="15" width="18" height="70" rx="5"/><rect x="57" y="15" width="18" height="70" rx="5"/></svg>'
        );
      default:
        return "";
    }
  }

  /* ===== Render ===== */
  var app = document.getElementById("app");

  function render() {
    if (state.difficulty === null) {
      renderSelection();
    } else if (state.won) {
      renderWin();
    } else {
      renderGame();
    }

    updateFooterYear();
  }

  /* ---- Selection Screen ---- */
  function renderSelection() {
    var themeKeys = Object.keys(THEMES);

    app.innerHTML =
      '<div class="container screen-selection">' +
      '<div class="selection-header">' +
      '<div class="selection-icon">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
      "</div>" +
      '<h2 class="selection-title">Запоминайка</h2>' +
      '<p class="selection-subtitle">Выбери тему и уровень сложности</p>' +
      "</div>" +
      '<div class="theme-section">' +
      '<p class="theme-label">Тема карточек</p>' +
      '<div class="theme-grid">' +
      themeKeys
        .map(function (key) {
          var isActive = state.theme === key;
          var cfg = THEMES[key];
          var icon = getThemeIcon(key);
          return (
            '<div class="theme-option' +
            (isActive ? " active" : "") +
            '" data-theme="' +
            key +
            '">' +
            '<span class="theme-option-icon">' +
            icon +
            "</span>" +
            '<span class="theme-option-label">' +
            cfg.label +
            "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>" +
      "</div>" +
      '<div class="difficulty-section">' +
      '<p class="difficulty-label">Уровень сложности</p>' +
      '<div class="difficulty-grid">' +
      Object.keys(DIFFICULTIES)
        .map(function (key) {
          var cfg = DIFFICULTIES[key];
          var icon = getDifficultyIcon(key);
          return (
            '<div class="difficulty-card" data-difficulty="' +
            key +
            '">' +
            '<div class="difficulty-card-header">' +
            '<span class="difficulty-card-icon">' +
            icon +
            "</span>" +
            '<span class="difficulty-card-title">' +
            cfg.label +
            "</span>" +
            "</div>" +
            '<p class="difficulty-card-desc">' +
            cfg.desc +
            "</p>" +
            "</div>"
          );
        })
        .join("") +
      "</div>" +
      "</div>" +
      "</div>";

    bindSelectionEvents();
  }

  function getThemeIcon(key) {
    if (key === "emoji") {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
    }
    if (key === "shapes") {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>';
    }
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  }

  function getDifficultyIcon(key) {
    if (key === "easy") {
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    }
    if (key === "medium") {
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
    }
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9Z"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9Z"/><path d="M4 22h16"/><path d="M10 22V2h4v20"/></svg>';
  }

  function bindSelectionEvents() {
    var themeOptions = app.querySelectorAll(".theme-option");
    for (var i = 0; i < themeOptions.length; i++) {
      themeOptions[i].addEventListener("click", function () {
        var t = this.getAttribute("data-theme");
        state.theme = t;
        saveTheme(t);
        render();
      });
    }

    var diffCards = app.querySelectorAll(".difficulty-card");
    for (var i = 0; i < diffCards.length; i++) {
      diffCards[i].addEventListener("click", function () {
        startGame(this.getAttribute("data-difficulty"));
      });
    }
  }

  /* ---- Start Game ---- */
  function startGame(diff) {
    stopTimer();
    state.difficulty = diff;
    state.cards = createCards(diff, state.theme);
    state.flippedIds = [];
    state.locked = false;
    state.moves = 0;
    state.timerStart = null;
    state.elapsed = 0;
    state.won = false;
    render();
  }

  /* ---- Game Screen ---- */
  function renderGame() {
    var config = DIFFICULTIES[state.difficulty];
    var matchedCount = 0;
    for (var i = 0; i < state.cards.length; i++) {
      if (state.cards[i].isMatched) matchedCount++;
    }

    var timeDisplay =
      state.timerStart !== null ? formatTime(state.elapsed) : "0:00";
    var colsClass = "cols-" + config.cols;

    app.innerHTML =
      '<div class="screen-game">' +
      '<div class="game-header">' +
      '<div class="game-header-icon">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
      "</div>" +
      '<h1 class="game-title">Запоминайка</h1>' +
      '<p class="game-subtitle">' +
      config.label +
      " · " +
      config.desc +
      "</p>" +
      "</div>" +
      '<div class="game-stats">' +
      '<div class="stat-item">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>' +
      "<span>Ходы: " +
      state.moves +
      "</span>" +
      "</div>" +
      '<div class="stat-item">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      "<span>" +
      timeDisplay +
      "</span>" +
      "</div>" +
      "</div>" +
      '<div class="game-grid ' +
      colsClass +
      '">' +
      state.cards
        .map(function (card) {
          return renderCard(card);
        })
        .join("") +
      "</div>" +
      '<div class="game-actions">' +
      '<button class="btn btn-primary btn-lg" id="btn-new-game">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>' +
      " Новая игра" +
      "</button>" +
      '<button class="btn btn-outline btn-lg" id="btn-main-menu">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' +
      " В главное меню" +
      "</button>" +
      "</div>" +
      "</div>";

    bindGameEvents();
  }

  function updateCards() {
    var grid = app.querySelector(".game-grid");
    if (!grid) return;

    var config = DIFFICULTIES[state.difficulty];
    var colsClass = "cols-" + config.cols;

    grid.className = "game-grid " + colsClass;
    grid.innerHTML = state.cards
      .map(function (card) {
        return renderCard(card);
      })
      .join("");

    bindCardEvents();
  }

  function renderCard(card) {
    var isFlipped = card.isFlipped || card.isMatched;
    var matchedClass = card.isMatched ? " matched" : "";
    var animateClass = card.isMatched ? " animate-match" : "";

    var content = "";
    if (state.theme === "emoji") {
      content = '<span class="card-content-emoji">' + card.content + "</span>";
    } else if (state.theme === "shapes") {
      content =
        '<span class="card-content-shapes">' +
        shapeSVG(card.content) +
        "</span>";
    } else {
      content =
        '<img src="' + card.content + '" alt="" class="card-content-image" />';
    }

    return (
      '<div class="card' +
      matchedClass +
      '" data-card-id="' +
      card.id +
      '">' +
      '<div class="card-inner' +
      (isFlipped ? " flipped" : "") +
      animateClass +
      '">' +
      '<div class="card-face card-front">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
      "</div>" +
      '<div class="card-face card-back' +
      (card.isMatched ? " matched" : "") +
      '">' +
      content +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function bindCardEvents() {
    var cards = app.querySelectorAll(".card:not(.matched)");
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener("click", function () {
        var id = parseInt(this.getAttribute("data-card-id"), 10);
        handleFlip(id);
      });
    }
  }

  function bindGameEvents() {
    bindCardEvents();

    var btnNew = document.getElementById("btn-new-game");
    if (btnNew) {
      btnNew.addEventListener("click", function () {
        startGame(state.difficulty);
      });
    }

    var btnMainMenu = document.getElementById("btn-main-menu");
    if (btnMainMenu) {
      btnMainMenu.addEventListener("click", function () {
        stopTimer();
        state.difficulty = null;
        state.cards = [];
        state.flippedIds = [];
        state.locked = false;
        state.moves = 0;
        state.timerStart = null;
        state.elapsed = 0;
        state.won = false;
        render();
      });
    }
  }

  /* ---- Win Screen ---- */
  function renderWin() {
    var finalTime = formatTime(state.elapsed);

    app.innerHTML =
      '<div class="container screen-win">' +
      '<div class="win-icon">' +
      '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/><line x1="5" y1="19" x2="19" y2="5"/></svg>' +
      "</div>" +
      '<h2 class="win-title">Поздравляем!</h2>' +
      '<p class="win-subtitle">Вы нашли все пары!</p>' +
      '<div class="win-stats">' +
      '<div class="win-stat">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>' +
      '<span class="win-stat-value">' +
      state.moves +
      " ходов</span>" +
      "</div>" +
      '<div class="win-stat">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      '<span class="win-stat-value">' +
      finalTime +
      "</span>" +
      "</div>" +
      "</div>" +
      '<div class="win-actions">' +
      '<button class="btn btn-primary btn-lg" id="btn-play-again">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>' +
      " Играть снова" +
      "</button>" +
      '<button class="btn btn-outline btn-lg" id="btn-choose-level">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
      " Выбрать уровень" +
      "</button>" +
      "</div>" +
      "</div>";

    document
      .getElementById("btn-play-again")
      .addEventListener("click", function () {
        startGame(state.difficulty);
      });

    document
      .getElementById("btn-choose-level")
      .addEventListener("click", function () {
        stopTimer();
        state.difficulty = null;
        state.cards = [];
        state.flippedIds = [];
        state.locked = false;
        state.moves = 0;
        state.timerStart = null;
        state.elapsed = 0;
        state.won = false;
        render();
      });
  }

  /* ===== Game Logic ===== */
  function handleFlip(id) {
    if (state.locked || state.won) return;

    var card = null;
    for (var i = 0; i < state.cards.length; i++) {
      if (state.cards[i].id === id) {
        card = state.cards[i];
        break;
      }
    }
    if (!card || card.isFlipped || card.isMatched) return;

    if (state.timerStart === null) {
      state.timerStart = Date.now();
      startTimer();
    }

    card.isFlipped = true;
    state.flippedIds.push(id);

    if (state.flippedIds.length === 2) {
      state.moves++;
      state.locked = true;

      updateCards();

      var firstId = state.flippedIds[0];
      var secondId = state.flippedIds[1];
      var first = null;
      var second = null;
      for (var i = 0; i < state.cards.length; i++) {
        if (state.cards[i].id === firstId) first = state.cards[i];
        if (state.cards[i].id === secondId) second = state.cards[i];
      }

      if (first.pairId === second.pairId) {
        setTimeout(function () {
          for (var i = 0; i < state.cards.length; i++) {
            if (
              state.cards[i].id === firstId ||
              state.cards[i].id === secondId
            ) {
              state.cards[i].isMatched = true;
            }
          }
          state.flippedIds = [];
          state.locked = false;
          checkWin();
          updateCards();
        }, 400);
      } else {
        setTimeout(function () {
          for (var i = 0; i < state.cards.length; i++) {
            if (
              state.cards[i].id === firstId ||
              state.cards[i].id === secondId
            ) {
              state.cards[i].isFlipped = false;
            }
          }
          state.flippedIds = [];
          state.locked = false;
          updateCards();
        }, 1000);
      }
    } else {
      updateCards();
    }
  }

  function checkWin() {
    var allMatched = true;
    for (var i = 0; i < state.cards.length; i++) {
      if (!state.cards[i].isMatched) {
        allMatched = false;
        break;
      }
    }
    if (allMatched && state.cards.length > 0) {
      state.won = true;
      stopTimer();
      render();
    }
  }

  /* ===== Timer ===== */
  function startTimer() {
    stopTimer();
    state.timerInterval = setInterval(function () {
      state.elapsed = Math.floor((Date.now() - state.timerStart) / 1000);
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    var el = document.querySelector(".stat-item:last-child span:last-child");
    if (el) {
      el.textContent = formatTime(state.elapsed);
    }
  }

  function updateFooterYear() {
    var yearEl = document.querySelector(".footer p");
    if (yearEl) {
      yearEl.textContent =
        "\u00A9 " +
        new Date().getFullYear() +
        " \u0417\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0439\u043A\u0430";
    }
  }

  /* ===== Modal ===== */
  function initModals() {
    var rulesBtn = document.getElementById("btn-rules");
    var shareBtn = document.getElementById("btn-share");
    var rulesModal = document.getElementById("modal-rules");
    var shareModal = document.getElementById("modal-share");

    if (!rulesBtn || !shareBtn || !rulesModal || !shareModal) return;

    function openModal(overlay) {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeModal(overlay) {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    function closeOnOverlay(e) {
      if (e.target === this) {
        closeModal(this);
      }
    }

    rulesBtn.addEventListener("click", function () {
      openModal(rulesModal);
    });

    shareBtn.addEventListener("click", function () {
      openModal(shareModal);
    });

    rulesModal.addEventListener("click", closeOnOverlay);
    shareModal.addEventListener("click", closeOnOverlay);

    document
      .querySelectorAll('[id$="-close"], [id$="-close-btn"]')
      .forEach(function (btn) {
        btn.addEventListener("click", function () {
          var overlay = this.closest(".modal-overlay");
          if (overlay) closeModal(overlay);
        });
      });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.open").forEach(function (ov) {
          closeModal(ov);
        });
      }
    });
  }

  /* ===== Copy Link ===== */
  function initCopy() {
    var copyBtn = document.getElementById("btn-copy");
    if (!copyBtn) return;

    copyBtn.addEventListener("click", function () {
      var input = document.getElementById("share-link");
      if (!input) return;

      input.select();
      input.setSelectionRange(0, 99999);

      try {
        navigator.clipboard.writeText(input.value).then(function () {
          var orig = copyBtn.textContent;
          copyBtn.textContent = "Скопировано!";
          setTimeout(function () {
            copyBtn.textContent = orig;
          }, 2000);
        });
      } catch (_) {
        document.execCommand("copy");
        var orig = copyBtn.textContent;
        copyBtn.textContent = "Скопировано!";
        setTimeout(function () {
          copyBtn.textContent = orig;
        }, 2000);
      }
    });
  }

  /* ===== Init ===== */
  initModals();
  initCopy();
  render();
})();
