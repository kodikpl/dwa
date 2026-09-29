const App = (() => {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ================== STAN ==================
  const state = {
    view: 'home',
    channels: [],
    categories: [],
    currentIndex: -1,

    favorites: [],
    history: [],
    settings: {},

    numBuffer: '',
    numTimer: null,
    infoTimer: null,
    controlsTimer: null,
    screensaverTimer: null,
    clockTimer: null,
    reconnectTimer: null,

    focusTile: 0,
    focusList: 0,
    focusMenu: 0,
    focusSettings: 0,
    focusGeneric: 0,
    focusControls: 0,

    settingsSchema: [],
    genericType: null,
    genericItems: [],

    playlistTab: 0,
    playlistFocus: 0,

    searchQuery: '',
    searchFocusMode: 'keyboard', // 'keyboard' | 'results'
    searchRow: 0,
    searchCol: 0,
    searchResults: [],
    searchResultFocus: 0,

    reconnectCount: 0,
    playing: false,
    paused: false,

    errorText: '',
    errorActive: false
  };

  // ================== DEFINICJE ==================
  const TILES = [
    { action:'tv',         label:'TELEWIZJA',  cls:'tile-blue',
      svg:'<rect x="2" y="7" width="20" height="14"/><path d="M8 3l4 4 4-4"/>' },
    { action:'channels',   label:'KANAŁY',     cls:'tile-teal',
      svg:'<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>' },
    { action:'favorites',  label:'ULUBIONE',   cls:'tile-magenta',
      svg:'<polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/>' },
    { action:'categories', label:'KATEGORIE',  cls:'tile-purple',
      svg:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
    { action:'epg',        label:'EPG',        cls:'tile-green',
      svg:'<rect x="3" y="5" width="18" height="16"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="7"/><line x1="16" y1="2" x2="16" y2="7"/>' },
    { action:'recent',     label:'OSTATNIE',   cls:'tile-orange',
      svg:'<circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 15,14"/>' },
    { action:'search',     label:'SZUKAJ',     cls:'tile-bluegray',
      svg:'<circle cx="10" cy="10" r="6"/><line x1="15" y1="15" x2="21" y2="21"/>' },
    { action:'settings',   label:'USTAWIENIA', cls:'tile-dark',
      svg:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>' }
  ];

  const MENU_ITEMS = [
    { action:'tv',         label:'TELEWIZJA' },
    { action:'channels',   label:'LISTA KANAŁÓW' },
    { action:'favorites',  label:'ULUBIONE' },
    { action:'categories', label:'KATEGORIE' },
    { action:'recent',     label:'OSTATNIO OGLĄDANE' },
    { action:'epg',        label:'EPG' },
    { action:'search',     label:'SZUKAJ' },
    { action:'settings',   label:'USTAWIENIA' },
    { action:'info',       label:'INFORMACJE' }
  ];

  const KB_ROWS = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M'],
    ['SPACJA','USUŃ','CZYŚĆ','ZAMKNIJ']
  ];

  function buildSettingsSchema() {
    const p = v => v ? 'WŁ.' : 'WYŁ.';
    return [
      { group:'ODTWARZANIE' },
      { key:'autoplay',          label:'Automatyczne odtwarzanie',    type:'bool' },
      { key:'autoSwitchOnError', label:'Auto-przełączanie po błędzie', type:'bool' },
      { key:'reconnectAttempts', label:'Liczba prób reconnect',       type:'num', min:0, max:10, step:1 },
      { key:'reconnectDelay',    label:'Opóźnienie reconnect (ms)',   type:'num', min:500, max:10000, step:500 },
      { key:'rememberLast',      label:'Pamiętaj ostatni kanał',      type:'bool' },
      { key:'fullscreen',        label:'Tryb pełnoekranowy',          type:'bool' },

      { group:'INTERFEJS' },
      { key:'infoBarDuration',   label:'Czas belki kanału (ms)',      type:'num', min:1000, max:15000, step:500 },
      { key:'animations',        label:'Animacje',                    type:'bool' },
      { key:'fontSize',          label:'Rozmiar tekstu',              type:'enum', values:['MAŁY','NORMALNY','DUŻY','BARDZO DUŻY'], fmt:v=>v+1 },
      { key:'panelOpacity',      label:'Przezroczystość paneli',      type:'enum', values:['PEŁNA','WYSOKA','ŚREDNIA'], fmt:v=>v+1 },
      { key:'screensaverTime',   label:'Wygaszacz (ms)',              type:'num', min:10000, max:600000, step:10000 },

      { group:'KANAŁY' },
      { key:'showNumbers',       label:'Pokaż numery kanałów',        type:'bool' },
      { key:'showLogos',         label:'Pokaż logo',                  type:'bool' },
      { key:'groupChannels',     label:'Grupowanie kanałów',          type:'bool' },
      { key:'sortMode',          label:'Sortowanie',                  type:'enum', values:['NUMER','NAZWA','GRUPA'], fmt:v=>v+1 },
      { key:'favoritesFirst',    label:'Ulubione na początku',        type:'bool' },

      { group:'SIEĆ' },
      { key:'streamTimeout',     label:'Timeout streamu (ms)',        type:'num', min:3000, max:60000, step:1000 },
      { key:'autoReconnect',     label:'Auto-reconnect',              type:'bool' },
      { key:'dataSaver',         label:'Tryb oszczędzania danych',    type:'bool' },

      { group:'EPG' },
      { key:'epgUrl',            label:'Adres XMLTV EPG',             type:'text' },

      { group:'DANE' },
      { key:'__clearHistory',    label:'Wyczyść historię',            type:'action' },
      { key:'__clearFavorites',  label:'Wyczyść ulubione',            type:'action' },
      { key:'__clearPlaylist',   label:'Wyczyść playlistę',           type:'action' },
      { key:'__resetSettings',   label:'Resetuj ustawienia',          type:'action' }
    ];
  }

  // ================== INIT ==================
  function init() {
    state.settings = Storage.getSettings();
    state.favorites = Storage.getFavorites();
    state.history = Storage.getHistory();
    state.settingsSchema = buildSettingsSchema();

    Player.init($('#video'));
    Player.setSettings(state.settings);
    Player.setOnError(onStreamError);
    Player.setOnPlaying(onStreamPlaying);
    Player.setOnStalled(() => {});

    Remote.init();
    bindRemote();

    applySettingsToUI();
    renderTiles();
    renderMenu();
    renderChannelList();
    renderGenericList();
    renderSettings();
    renderPlaylistTabs();
    renderKeyboard();
    startClock();

    const playlist = Storage.getPlaylist();
    if (Array.isArray(playlist) && playlist.length > 0) {
      state.channels = playlist;
      buildCategories();
      restoreLastChannel();
      if (state.settings.autoplay && state.currentIndex >= 0 && state.settings.rememberLast) {
        showView('playing');
        playCurrent();
      } else {
        showView('home');
      }
    } else {
      showView('playlist');
    }

    resetScreensaver();
  }

  // ================== VIEW MANAGEMENT ==================
  function showView(name) {
    state.view = name;

    const home = $('#home');
    const channelPanel = $('#channel-panel');
    const menuPanel = $('#menu-panel');
    const genericPanel = $('#generic-panel');
    const settingsPanel = $('#settings-panel');
    const playlistPanel = $('#playlist-panel');
    const searchPanel = $('#search-panel');
    const infoBar = $('#info-bar');
    const controls = $('#player-controls');
    const errorScr = $('#error-screen');
    const loading = $('#loading');

    // hide all panels
    [channelPanel, menuPanel, genericPanel, settingsPanel, playlistPanel, searchPanel]
      .forEach(el => el.classList.remove('open'));

    home.classList.add('hidden');
    infoBar.classList.add('hidden');
    controls.classList.remove('show');
    errorScr.classList.add('hidden');
    loading.classList.add('hidden');

    switch (name) {
      case 'home':
        home.classList.remove('hidden');
        Player.stop();
        state.playing = false;
        break;
      case 'playing':
        if (state.currentIndex >= 0) {
          showInfoBar();
          if (!state.playing) playCurrent();
        }
        break;
      case 'channels':
        openChannelPanel();
        break;
      case 'menu':
        menuPanel.classList.add('open');
        refreshMenuFocus();
        break;
      case 'favorites':
        state.genericType = 'favorites';
        buildGenericFavorites();
        genericPanel.classList.add('open');
        break;
      case 'recent':
        state.genericType = 'recent';
        buildGenericRecent();
        genericPanel.classList.add('open');
        break;
      case 'categories':
        state.genericType = 'categories';
        buildGenericCategories();
        genericPanel.classList.add('open');
        break;
      case 'epg':
        state.genericType = 'epg';
        buildGenericEpg();
        genericPanel.classList.add('open');
        break;
      case 'info':
        state.genericType = 'info';
        buildGenericInfo();
        genericPanel.classList.add('open');
        break;
      case 'settings':
        settingsPanel.classList.add('open');
        renderSettings();
        break;
      case 'playlist':
        playlistPanel.classList.add('open');
        prefillPlaylistForm();
        break;
      case 'search':
        searchPanel.classList.add('open');
        resetSearch();
        break;
      case 'error':
        errorScr.classList.remove('hidden');
        break;
    }
  }

  function goBack() {
    switch (state.view) {
      case 'home':      /* nothing */ break;
      case 'playing':   showView('home'); break;
      case 'channels':
      case 'menu':
      case 'favorites':
      case 'recent':
      case 'categories':
      case 'epg':
      case 'info':
        if (state.playing && state.currentIndex >= 0) {
          showView('playing');
        } else {
          showView('home');
        }
        break;
      case 'settings':
      case 'playlist':
      case 'search':
        if (state.playing && state.currentIndex >= 0) {
          showView('playing');
        } else {
          showView('home');
        }
        break;
      case 'error':
        showView('channels');
        break;
    }
  }

  // ================== REMOTE BINDING ==================
  function bindRemote() {
    Remote.on('UP',    () => onKey('UP'));
    Remote.on('DOWN',  () => onKey('DOWN'));
    Remote.on('LEFT',  () => onKey('LEFT'));
    Remote.on('RIGHT', () => onKey('RIGHT'));
    Remote.on('OK',    () => onKey('OK'));
    Remote.on('BACK',  () => onKey('BACK'));
    Remote.on('MENU',  () => onKey('MENU'));
    Remote.on('PLAYPAUSE', () => onKey('PLAYPAUSE'));
    Remote.on('PLAY',      () => onKey('PLAY'));
    Remote.on('PAUSE',     () => onKey('PAUSE'));
    Remote.on('CH_UP',     () => onKey('CH_UP'));
    Remote.on('CH_DOWN',   () => onKey('CH_DOWN'));

    for (let i = 0; i < 10; i++) {
      (function (n) {
        Remote.on('NUM' + n, () => onKey('NUM', n));
      })(i);
    }
  }

  function onKey(action, data) {
    if (state.view !== 'screensaver') resetScreensaver();
    if (state.view === 'screensaver') {
      hideScreensaver();
      return;
    }

    // numeric quick entry – works only while playing
    if (action === 'NUM' && (state.view === 'playing')) {
      handleNumeric(data);
      return;
    }

    switch (state.view) {
      case 'home':      handleHome(action); break;
      case 'playing':   handlePlaying(action); break;
      case 'channels':  handleChannelPanel(action); break;
      case 'menu':      handleMenu(action); break;
      case 'favorites':
      case 'recent':
      case 'categories':
      case 'epg':
      case 'info':      handleGeneric(action); break;
      case 'settings':  handleSettings(action); break;
      case 'playlist':  handlePlaylist(action); break;
      case 'search':    handleSearch(action); break;
      case 'error':     handleErrorScreen(action); break;
    }
  }

  // ================== HOME ==================
  function renderTiles() {
    const container = $('#tiles');
    container.innerHTML = '';
    TILES.forEach((t, i) => {
      const el = document.createElement('div');
      el.className = 'tile ' + t.cls + (i === 0 ? ' focused' : '');
      el.dataset.action = t.action;
      el.innerHTML =
        '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">' + t.svg + '</svg>' +
        '<div class="tile-label">' + t.label + '</div>';
      el.addEventListener('click', () => activateTile(i));
      container.appendChild(el);
    });
    state.focusTile = 0;
  }

  function refreshTilesFocus() {
    const tiles = $$('#tiles .tile');
    tiles.forEach((t, i) => t.classList.toggle('focused', i === state.focusTile));
  }

  function handleHome(action) {
    const cols = 4, rows = 2;
    let r = Math.floor(state.focusTile / cols);
    let c = state.focusTile % cols;

    if (action === 'LEFT')  c = (c - 1 + cols) % cols;
    if (action === 'RIGHT') c = (c + 1) % cols;
    if (action === 'UP')    r = (r - 1 + rows) % rows;
    if (action === 'DOWN')  r = (r + 1) % rows;
    if (action === 'OK') { activateTile(state.focusTile); return; }
    if (action === 'MENU') { showView('menu'); return; }
    if (action === 'BACK') { return; }

    state.focusTile = r * cols + c;
    refreshTilesFocus();
  }

  function activateTile(i) {
    const t = TILES[i];
    if (!t) return;

    if (t.action === 'tv') {
      if (!state.channels.length) { showView('playlist'); return; }
      if (state.currentIndex < 0) state.currentIndex = 0;
      showView('playing');
      return;
    }
    if (t.action === 'settings') { showView('settings'); return; }
    if (t.action === 'search')   { showView('search');   return; }

    if (t.action === 'channels' && !state.channels.length) {
      showView('playlist'); return;
    }
    if ((t.action === 'favorites' || t.action === 'recent' || t.action === 'categories' || t.action === 'epg')
        && !state.channels.length) {
      showView('playlist'); return;
    }
    showView(t.action);
  }

  // ================== PLAYING ==================
  function handlePlaying(action) {
    switch (action) {
      case 'UP':   switchChannel(-1); return;
      case 'DOWN': switchChannel(1);  return;
      case 'CH_UP':   switchChannel(-1); return;
      case 'CH_DOWN': switchChannel(1);  return;
      case 'OK':
        showPlayerControls();
        return;
      case 'PLAYPAUSE':
      case 'PLAY':
      case 'PAUSE':
        Player.togglePlay();
        state.paused = Player.isPaused();
        showPlayerControls();
        return;
      case 'MENU':
        showView('menu');
        return;
      case 'BACK':
        showView('home');
        return;
      case 'LEFT':
      case 'RIGHT':
        showPlayerControls();
        return;
    }
  }

  function switchChannel(dir) {
    if (!state.channels.length) return;
    let idx = state.currentIndex;
    idx += dir;
    if (idx < 0) idx = state.channels.length - 1;
    if (idx >= state.channels.length) idx = 0;
    state.currentIndex = idx;
    playCurrent();
  }

  function playCurrent() {
    if (state.currentIndex < 0 || !state.channels.length) return;
    const ch = state.channels[state.currentIndex];
    if (!ch) return;

    state.playing = true;
    state.reconnectCount = 0;
    state.errorActive = false;

    showLoading(true);
    showInfoBar();

    Player.stop();
    Player.play(ch.url);

    Storage.saveLastChannel({ id: ch.id, number: ch.number, name: ch.name });
    pushHistory(ch);

    updateInfoBar();
  }

  function onStreamPlaying() {
    state.playing = true;
    state.reconnectCount = 0;
    showLoading(false);
    hideErrorScreen();
  }

  function onStreamError(info) {
    showLoading(false);
    if (!state.playing) return;

    if (state.settings.autoReconnect && state.reconnectCount < (state.settings.reconnectAttempts || 3)) {
      state.reconnectCount++;
      const delay = state.settings.reconnectDelay || 2000;
      showErrorScreen('RECONNECT ' + state.reconnectCount + '/' + state.settings.reconnectAttempts);
      state.reconnectTimer = setTimeout(() => {
        if (state.currentIndex >= 0) {
          Player.play(state.channels[state.currentIndex].url);
        }
      }, delay);
      return;
    }

    const code = pickErrorCode();
    showErrorScreen('BRAK SYGNAŁU ' + code);

    if (state.settings.autoSwitchOnError) {
      setTimeout(() => {
        if (state.view === 'error' || state.errorActive) {
          switchChannel(1);
        }
      }, 8000);
    }
  }

  function pickErrorCode() {
    const codes = [404, 408, 500, 502, 503, 504];
    return codes[Math.floor(Math.random() * codes.length)];
  }

  function handleErrorScreen(action) {
    if (action === 'OK') {
      hideErrorScreen();
      switchChannel(1);
    } else if (action === 'BACK' || action === 'MENU') {
      hideErrorScreen();
      showView('channels');
    } else if (action === 'UP' || action === 'CH_UP') {
      hideErrorScreen();
      switchChannel(-1);
    } else if (action === 'DOWN' || action === 'CH_DOWN') {
      hideErrorScreen();
      switchChannel(1);
    }
  }

  function showErrorScreen(text) {
    state.errorText = text;
    state.errorActive = true;
    $('#error-line').textContent = text;
    $('#error-screen').classList.remove('hidden');
    state.view = 'error';
    state.playing = false;
  }
  function hideErrorScreen() {
    $('#error-screen').classList.add('hidden');
    state.errorActive = false;
    if (state.view === 'error') {
      state.view = state.playing ? 'playing' : 'home';
    }
  }

  function showLoading(on) {
    $('#loading').classList.toggle('hidden', !on);
  }

  // ================== INFO BAR ==================
  function showInfoBar() {
    const bar = $('#info-bar');
    bar.classList.remove('hidden');
    updateInfoBar();
    if (state.infoTimer) clearTimeout(state.infoTimer);
    const dur = state.settings.infoBarDuration || 4000;
    state.infoTimer = setTimeout(() => {
      bar.classList.add('hidden');
      hidePlayerControls();
    }, dur);
  }

  function updateInfoBar() {
    const ch = state.channels[state.currentIndex];
    if (!ch) return;

    const n = String(ch.number).padStart(3, '0');
    $('#ib-num').textContent = n;
    $('#ib-name').textContent = ch.name;
    $('#ib-time').textContent = formatTime(new Date());

    const logoEl = $('#ib-logo');
    logoEl.innerHTML = '';
    if (state.settings.showLogos && ch.logo) {
      const img = document.createElement('img');
      img.src = ch.logo;
      img.onerror = () => { logoEl.innerHTML = ''; logoEl.textContent = initials(ch.name); };
      logoEl.appendChild(img);
    } else {
      logoEl.textContent = initials(ch.name);
    }

    // EPG
    const epgEl = $('#ib-epg');
    const now = EPG.getNow(ch.epgId);
    const next = EPG.getNext(ch.epgId);
    if (now || next) {
      epgEl.textContent =
        (now ? 'TERAZ: ' + now.title : '') +
        (next ? '   ·   NASTĘPNIE: ' + next.title : '');
    } else {
      epgEl.textContent = '';
    }
  }

  // ================== PLAYER CONTROLS ==================
  function showPlayerControls() {
    const c = $('#player-controls');
    c.classList.add('show');
    state.focusControls = 0;
    refreshControlsFocus();

    if (state.controlsTimer) clearTimeout(state.controlsTimer);
    state.controlsTimer = setTimeout(() => {
      c.classList.remove('show');
    }, 5000);
  }
  function hidePlayerControls() {
    $('#player-controls').classList.remove('show');
  }
  function refreshControlsFocus() {
    const items = $$('#player-controls .pc-item');
    items.forEach((el, i) => el.classList.toggle('focused', i === state.focusControls));
  }
  function activateControl(idx) {
    const items = $$('#player-controls .pc-item');
    const el = items[idx];
    if (!el) return;
    const key = el.dataset.pc;
    switch (key) {
      case 'play':        Player.togglePlay(); break;
      case 'mute':        Player.toggleMute(); break;
      case 'volup':       Player.volumeUp(); break;
      case 'voldown':     Player.volumeDown(); break;
      case 'fullscreen':  Player.toggleFullscreen(); break;
      case 'fav':         toggleFavorite(); break;
      case 'list':        showView('channels'); break;
      case 'next':        switchChannel(1); return;
    }
  }

  // ================== NUMERIC ENTRY ==================
  function handleNumeric(digit) {
    state.numBuffer += String(digit);
    if (state.numBuffer.length > 3) state.numBuffer = state.numBuffer.slice(-3);

    const el = $('#num-overlay');
    el.classList.remove('error');
    $('#num-text').textContent = state.numBuffer;
    el.classList.add('show');

    if (state.numTimer) clearTimeout(state.numTimer);
    state.numTimer = setTimeout(() => {
      commitNumeric();
    }, 1500);
  }

  function commitNumeric() {
    const el = $('#num-overlay');
    const num = parseInt(state.numBuffer, 10);
    state.numBuffer = '';

    if (isNaN(num)) { el.classList.remove('show'); return; }

    const idx = state.channels.findIndex(c => c.number === num);
    if (idx < 0) {
      el.classList.add('error');
      $('#num-text').textContent = 'KANAŁ ' + num + ' NIE ISTNIEJE';
      setTimeout(() => el.classList.remove('show'), 1800);
      return;
    }
    state.currentIndex = idx;
    playCurrent();
    setTimeout(() => el.classList.remove('show'), 900);
  }

  // ================== CHANNEL PANEL ==================
  function openChannelPanel() {
    $('#channel-panel').classList.add('open');
    renderChannelList();
    state.focusList = state.currentIndex >= 0 ? state.currentIndex : 0;
    refreshChannelFocus(true);
  }

  function renderChannelList() {
    const list = $('#channel-list');
    list.innerHTML = '';
    if (!state.channels.length) {
      const empty = document.createElement('div');
      empty.className = 'ch-item';
      empty.innerHTML = '<div class="ch-name">Brak kanałów. Dodaj playlistę M3U.</div>';
      list.appendChild(empty);
      return;
    }
    state.channels.forEach((c, i) => {
      const item = document.createElement('div');
      item.className = 'ch-item' + (i === state.currentIndex ? ' current' : '');
      item.dataset.index = i;

      const numHtml = state.settings.showNumbers
        ? '<div class="ch-num">' + String(c.number).padStart(3, '0') + '</div>'
        : '<div class="ch-num"></div>';

      let logoHtml = '<div class="ch-logo">' + initials(c.name) + '</div>';
      if (state.settings.showLogos && c.logo) {
        logoHtml = '<div class="ch-logo"><img src="' + escapeAttr(c.logo) + '" alt=""></div>';
      }

      const favMark = state.favorites.includes(c.id) ? '★' : '';

      item.innerHTML =
        numHtml +
        logoHtml +
        '<div class="ch-name">' + escapeHtml(c.name) + '</div>' +
        '<div class="ch-group">' + escapeHtml(c.group || '') + '</div>' +
        '<div class="ch-fav">' + favMark + '</div>';

      // safe image error handling
      const img = item.querySelector('.ch-logo img');
      if (img) {
        img.onerror = () => { img.parentElement.innerHTML = initials(c.name); };
      }

      list.appendChild(item);
    });
    refreshChannelFocus(false);
  }

  function refreshChannelFocus(scroll) {
    const items = $$('#channel-list .ch-item');
    items.forEach((el, i) => el.classList.toggle('focused', i === state.focusList));
    if (scroll && items[state.focusList]) {
      items[state.focusList].scrollIntoView({ block:'center', behavior:'auto' });
    }
  }

  function handleChannelPanel(action) {
    const total = state.channels.length;
    if (!total) {
      if (action === 'BACK' || action === 'LEFT' || action === 'MENU') {
        if (state.playing) showView('playing'); else showView('home');
      }
      return;
    }
    switch (action) {
      case 'UP':   state.focusList = (state.focusList - 1 + total) % total; refreshChannelFocus(true); return;
      case 'DOWN': state.focusList = (state.focusList + 1) % total; refreshChannelFocus(true); return;
      case 'OK':   state.currentIndex = state.focusList; playCurrent(); showView('playing'); return;
      case 'LEFT':
      case 'BACK': if (state.playing) showView('playing'); else showView('home'); return;
      case 'MENU': showView('menu'); return;
    }
  }

  // ================== MENU PANEL ==================
  function renderMenu() {
    const list = $('#menu-list');
    list.innerHTML = '';
    MENU_ITEMS.forEach((m, i) => {
      const el = document.createElement('div');
      el.className = 'menu-item';
      el.innerHTML = m.label;
      el.dataset.action = m.action;
      el.dataset.index = i;
      el.addEventListener('click', () => { state.focusMenu = i; activateMenu(); });
      list.appendChild(el);
    });
    state.focusMenu = 0;
    refreshMenuFocus();
  }

  function refreshMenuFocus() {
    const items = $$('#menu-list .menu-item');
    items.forEach((el, i) => el.classList.toggle('focused', i === state.focusMenu));
  }

  function handleMenu(action) {
    const n = MENU_ITEMS.length;
    switch (action) {
      case 'UP':   state.focusMenu = (state.focusMenu - 1 + n) % n; refreshMenuFocus(); return;
      case 'DOWN': state.focusMenu = (state.focusMenu + 1) % n; refreshMenuFocus(); return;
      case 'OK':   activateMenu(); return;
      case 'LEFT':
      case 'BACK':
      case 'MENU':
        if (state.playing) showView('playing'); else showView('home');
        return;
    }
  }

  function activateMenu() {
    const item = MENU_ITEMS[state.focusMenu];
    if (!item) return;
    showView(item.action);
  }

  // ================== GENERIC PANEL ==================
  function buildGenericFavorites() {
    $('#generic-title').textContent = 'ULUBIONE';
    state.genericItems = state.channels.filter(c => state.favorites.includes(c.id));
    if (!state.genericItems.length) {
      state.genericItems = [{ __empty: 'Brak ulubionych kanałów.' }];
    }
    renderGenericListChannels();
  }

  function buildGenericRecent() {
    $('#generic-title').textContent = 'OSTATNIO OGLĄDANE';
    const ids = state.history.map(h => h.id);
    state.genericItems = ids
      .map(id => state.channels.find(c => c.id === id))
      .filter(Boolean);
    if (!state.genericItems.length) {
      state.genericItems = [{ __empty: 'Brak historii.' }];
    }
    renderGenericListChannels();
  }

  function buildGenericCategories() {
    $('#generic-title').textContent = 'KATEGORIE';
    state.genericItems = state.categories.map(c => ({ __category: c, __name: c }));
    if (!state.genericItems.length) {
      state.genericItems = [{ __empty: 'Brak kategorii.' }];
    }
    renderGenericListItems();
  }

  function buildGenericEpg() {
    $('#generic-title').textContent = 'EPG';
    const ch = state.channels[state.currentIndex];
    state.genericItems = [];
    if (!ch) {
      state.genericItems = [{ __empty: 'Brak kanału.' }];
    } else if (!EPG.hasData()) {
      state.genericItems = [{ __empty: 'EPG niedostępne.' }];
    } else {
      const now = Date.now();
      const from = now - 3600000;
      const to   = now + 12 * 3600000;
      const list = EPG.getRange(ch.epgId, from, to);
      if (!list.length) state.genericItems = [{ __empty: 'Brak danych EPG dla tego kanału.' }];
      else {
        state.genericItems = list.map(p => ({
          __program: p,
          __name: formatTime(new Date(p.start)) + ' – ' + formatTime(new Date(p.stop)) + '   ' + p.title
        }));
      }
    }
    renderGenericListItems();
  }

  function buildGenericInfo() {
    $('#generic-title').textContent = 'INFORMACJE';
    state.genericItems = [
      { __info:'IPTV Player Smart TV' },
      { __info:'Wersja 1.0' },
      { __info:'Liczba kanałów: ' + state.channels.length },
      { __info:'Kategorii: ' + state.categories.length },
      { __info:'Ulubione: ' + state.favorites.length },
      { __info:'Historia: ' + state.history.length },
      { __info:'Klient: ' + navigator.userAgent.substring(0, 60) }
    ];
    renderGenericListItems();
  }

  function renderGenericListChannels() {
    const list = $('#generic-list');
    list.innerHTML = '';
    state.genericItems.forEach((c, i) => {
      const el = document.createElement('div');
      if (c.__empty) {
        el.className = 'gen-item empty-state';
        el.textContent = c.__empty;
      } else {
        el.className = 'gen-item';
        const num = state.settings.showNumbers
          ? '<div class="ch-num" style="min-width:60px;font-size:18px;color:#888">' + String(c.number).padStart(3,'0') + '</div>'
          : '';
        let logoHtml = '<div class="ch-logo">' + initials(c.name) + '</div>';
        if (state.settings.showLogos && c.logo) {
          logoHtml = '<div class="ch-logo"><img src="' + escapeAttr(c.logo) + '" alt=""></div>';
        }
        el.innerHTML =
          num + logoHtml +
          '<div class="ch-name">' + escapeHtml(c.name) + '</div>' +
          '<div class="gi-sub">' + escapeHtml(c.group || '') + '</div>';
        const img = el.querySelector('.ch-logo img');
        if (img) img.onerror = () => { img.parentElement.innerHTML = initials(c.name); };
      }
      el.dataset.index = i;
      list.appendChild(el);
    });
    state.focusGeneric = 0;
    refreshGenericFocus();
  }

  function renderGenericListItems() {
    const list = $('#generic-list');
    list.innerHTML = '';
    state.genericItems.forEach((it, i) => {
      const el = document.createElement('div');
      if (it.__empty) {
        el.className = 'gen-item empty-state';
        el.textContent = it.__empty;
      } else if (it.__category) {
        el.className = 'gen-item';
        el.textContent = it.__name;
      } else if (it.__program) {
        el.className = 'gen-item';
        el.textContent = it.__name;
      } else {
        el.className = 'gen-item';
        el.textContent = it.__info || '';
      }
      el.dataset.index = i;
      list.appendChild(el);
    });
    state.focusGeneric = 0;
    refreshGenericFocus();
  }

  function refreshGenericFocus() {
    const items = $$('#generic-list .gen-item');
    items.forEach((el, i) => el.classList.toggle('focused', i === state.focusGeneric));
  }

  function handleGeneric(action) {
    const items = $$('#generic-list .gen-item');
    const total = items.length;
    if (!total) {
      if (action === 'BACK' || action === 'LEFT') goBack();
      return;
    }
    switch (action) {
      case 'UP':   state.focusGeneric = (state.focusGeneric - 1 + total) % total; refreshGenericFocus(); scrollGenericTo(); return;
      case 'DOWN': state.focusGeneric = (state.focusGeneric + 1) % total; refreshGenericFocus(); scrollGenericTo(); return;
      case 'OK':   activateGeneric(); return;
      case 'LEFT':
      case 'BACK':
        goBack(); return;
      case 'MENU':
        showView('menu'); return;
    }
  }
  function scrollGenericTo() {
    const items = $$('#generic-list .gen-item');
    if (items[state.focusGeneric]) items[state.focusGeneric].scrollIntoView({ block:'center' });
  }

  function activateGeneric() {
    const it = state.genericItems[state.focusGeneric];
    if (!it) return;
    if (it.__empty || it.__info || it.__program) return;

    if (it.__category) {
      const cat = it.__category;
      // open channel list filtered by category
      const idx = state.channels.findIndex(c => c.group === cat);
      if (idx >= 0) {
        // Reset – build temporary list view inside channel panel
        state.focusList = idx;
        showView('channels');
      }
      return;
    }

    if (it.id) {
      const idx = state.channels.findIndex(c => c.id === it.id);
      if (idx >= 0) {
        state.currentIndex = idx;
        playCurrent();
        showView('playing');
      }
    }
  }

  // ================== SETTINGS ==================
  function renderSettings() {
    const c = $('#settings-content');
    c.innerHTML = '';

    state.settingsSchema.forEach((item, i) => {
      if (item.group) {
        const g = document.createElement('div');
        g.className = 'settings-group';
        g.textContent = item.group;
        c.appendChild(g);
        return;
      }
      const el = document.createElement('div');
      el.className = 'set-item';
      if (item.key.startsWith('__')) el.classList.add('action');

      const val = state.settings[item.key];
      let valueText = '';
      if (item.type === 'bool')    valueText = val ? 'WŁ.' : 'WYŁ.';
      else if (item.type === 'num') valueText = String(val);
      else if (item.type === 'enum') valueText = (item.values && item.values[val]) || String(val);
      else if (item.type === 'text') valueText = val ? val.toString().substring(0, 40) : '—';
      else if (item.type === 'action') valueText = '';

      el.innerHTML =
        '<div class="set-label">' + escapeHtml(item.label) + '</div>' +
        '<div class="set-value">' + escapeHtml(valueText) + '</div>';

      el.dataset.index = i;
      c.appendChild(el);
    });

    // remove non-interactive group headers from index counting
    state.settingsInteractive = state.settingsSchema
      .map((it, i) => ({ it, i }))
      .filter(x => !x.it.group)
      .map(x => x.i);

    state.focusSettings = 0;
    refreshSettingsFocus();
  }

  function refreshSettingsFocus() {
    const items = $$('#settings-content .set-item');
    items.forEach((el, i) => el.classList.toggle('focused', i === state.focusSettings));
    const focused = items[state.focusSettings];
    if (focused) focused.scrollIntoView({ block:'center' });
  }

  function handleSettings(action) {
    const items = $$('#settings-content .set-item');
    const total = items.length;
    if (!total) return;
    switch (action) {
      case 'UP':   state.focusSettings = (state.focusSettings - 1 + total) % total; refreshSettingsFocus(); return;
      case 'DOWN': state.focusSettings = (state.focusSettings + 1) % total; refreshSettingsFocus(); return;
      case 'LEFT': changeSetting(-1); return;
      case 'RIGHT':changeSetting(1);  return;
      case 'OK':   activateSetting(); return;
      case 'BACK': goBack(); return;
    }
  }

  function getFocusedSetting() {
    const items = $$('#settings-content .set-item');
    const el = items[state.focusSettings];
    if (!el) return null;
    return state.settingsSchema[parseInt(el.dataset.index, 10)];
  }

  function changeSetting(dir) {
    const item = getFocusedSetting();
    if (!item) return;
    if (item.type === 'num') {
      const v = state.settings[item.key] + dir * (item.step || 1);
      state.settings[item.key] = Math.max(item.min, Math.min(item.max, v));
      commitSettings();
      renderSettings();
    } else if (item.type === 'enum') {
      const n = item.values.length;
      state.settings[item.key] = (state.settings[item.key] + dir + n) % n;
      commitSettings();
      renderSettings();
    }
  }

  function activateSetting() {
    const item = getFocusedSetting();
    if (!item) return;

    if (item.type === 'bool') {
      state.settings[item.key] = !state.settings[item.key];
      commitSettings();
      renderSettings();
      return;
    }
    if (item.type === 'enum') {
      const n = item.values.length;
      state.settings[item.key] = (state.settings[item.key] + 1) % n;
      commitSettings();
      renderSettings();
      return;
    }
    if (item.type === 'num') {
      changeSetting(1);
      return;
    }
    if (item.type === 'text') {
      // simple inline prompt – TV-safe
      const v = promptSafe('Wpisz wartość', state.settings[item.key] || '');
      if (v !== null) {
        state.settings[item.key] = v;
        commitSettings();
        renderSettings();
      }
      return;
    }
    if (item.type === 'action') {
      runAction(item.key);
      return;
    }
  }

  function runAction(key) {
    if (key === '__clearHistory') {
      Storage.clearHistory();
      state.history = [];
    } else if (key === '__clearFavorites') {
      Storage.clearFavorites();
      state.favorites = [];
      renderChannelList();
    } else if (key === '__clearPlaylist') {
      Storage.clearPlaylist();
      state.channels = [];
      state.categories = [];
      state.currentIndex = -1;
      renderChannelList();
      showView('playlist');
      return;
    } else if (key === '__resetSettings') {
      Storage.resetSettings();
      state.settings = Storage.getSettings();
      Player.setSettings(state.settings);
      applySettingsToUI();
    }
    renderSettings();
  }

  function commitSettings() {
    Storage.saveSettings(state.settings);
    Player.setSettings(state.settings);
    applySettingsToUI();
  }

  function applySettingsToUI() {
    const body = document.body;
    body.classList.remove('fs-1','fs-2','fs-3','fs-4');
    body.classList.add('fs-' + (state.settings.fontSize || 2));
    body.classList.toggle('no-anim', !state.settings.animations);
    // panel opacity
    const op = state.settings.panelOpacity;
    const map = { 0:'1', 1:'0.97', 2:'0.9' };
    const val = map[op] !== undefined ? map[op] : '0.95';
    document.documentElement.style.setProperty('--panel-opacity', val);
    // restart clock timer if needed
    resetScreensaver();
  }

  // ================== PLAYLIST ==================
  function renderPlaylistTabs() {
    const tabs = $$('#pl-tabs .tab-btn');
    tabs.forEach((t, i) => {
      t.classList.toggle('active', i === state.playlistTab);
      t.classList.toggle('focused', i === state.playlistFocus);
    });
    $$('#playlist-panel .tab-pane').forEach((p, i) => {
      p.classList.toggle('hidden', i !== state.playlistTab);
    });
  }

  function prefillPlaylistForm() {
    $('#playlist-url').value = Storage.getPlaylistUrl() || '';
    renderPlaylistTabs();
  }

  function handlePlaylist(action) {
    const tabs = $$('#pl-tabs .tab-btn');
    switch (action) {
      case 'LEFT':
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        state.playlistTab = (state.playlistTab - 1 + tabs.length) % tabs.length;
        state.playlistFocus = state.playlistTab;
        renderPlaylistTabs();
        return;
      case 'RIGHT':
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        state.playlistTab = (state.playlistTab + 1) % tabs.length;
        state.playlistFocus = state.playlistTab;
        renderPlaylistTabs();
        return;
      case 'OK':
        state.playlistFocus = state.playlistTab;
        renderPlaylistTabs();
        // On OK, run the primary action of the tab
        if (state.playlistTab === 0) saveUrlPlaylist();
        else if (state.playlistTab === 1) savePastePlaylist();
        else if (state.playlistTab === 2) saveFilePlaylist();
        return;
      case 'BACK':
        goBack();
        return;
    }
  }

  async function saveUrlPlaylist() {
    const url = $('#playlist-url').value.trim();
    const status = $('#pl-status');
    if (!url) { status.className = 'pl-status error'; status.textContent = 'Adres URL jest pusty.'; return; }
    status.className = 'pl-status';
    status.textContent = 'Ładowanie…';
    showLoading(true);
    try {
      const text = await Playlist.fetchText(url);
      const parsed = Playlist.parse(text);
      if (!parsed.length) throw new Error('Brak kanałów w playliście');
      Storage.savePlaylistUrl(url);
      Storage.savePlaylist(parsed);
      state.channels = parsed;
      buildCategories();
      renderChannelList();
      status.textContent = 'Zapisano ' + parsed.length + ' kanałów.';
      showLoading(false);
      setTimeout(() => showView('home'), 800);
    } catch (e) {
      showLoading(false);
      status.className = 'pl-status error';
      status.textContent = 'Błąd: ' + (e.message || 'nie można pobrać playlisty');
    }
  }

  function savePastePlaylist() {
    const text = $('#playlist-paste').value;
    const status = $('#pl-status');
    if (!text.trim()) { status.className = 'pl-status error'; status.textContent = 'Puste pole tekstowe.'; return; }
    const parsed = Playlist.parse(text);
    if (!parsed.length) { status.className = 'pl-status error'; status.textContent = 'Nie znaleziono kanałów.'; return; }
    Storage.savePlaylist(parsed);
    Storage.savePlaylistUrl('');
    state.channels = parsed;
    buildCategories();
    renderChannelList();
    status.className = 'pl-status';
    status.textContent = 'Zapisano ' + parsed.length + ' kanałów.';
    setTimeout(() => showView('home'), 800);
  }

  async function saveFilePlaylist() {
    const input = $('#playlist-file');
    const status = $('#pl-status');
    if (!input.files || !input.files[0]) {
      status.className = 'pl-status error';
      status.textContent = 'Nie wybrano pliku.';
      return;
    }
    try {
      const text = await Playlist.parseFile(input.files[0]);
      const parsed = Playlist.parse(text);
      if (!parsed.length) throw new Error('Brak kanałów');
      Storage.savePlaylist(parsed);
      Storage.savePlaylistUrl('');
      state.channels = parsed;
      buildCategories();
      renderChannelList();
      status.className = 'pl-status';
      status.textContent = 'Zapisano ' + parsed.length + ' kanałów.';
      setTimeout(() => showView('home'), 800);
    } catch (e) {
      status.className = 'pl-status error';
      status.textContent = 'Błąd pliku: ' + (e.message || '');
    }
  }

  // ================== SEARCH ==================
  function resetSearch() {
    state.searchQuery = '';
    state.searchFocusMode = 'keyboard';
    state.searchRow = 0;
    state.searchCol = 0;
    state.searchResultFocus = 0;
    state.searchResults = [];
    renderSearchInput();
    renderKeyboard();
    updateSearchResults();
  }

  function renderSearchInput() {
    $('#search-input').textContent = state.searchQuery || '';
  }

  function renderKeyboard() {
    const kb = $('#keyboard');
    kb.innerHTML = '';
    KB_ROWS.forEach((row, r) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      row.forEach((k, c) => {
        const el = document.createElement('div');
        el.className = 'kb-key' + (k.length > 1 ? ' wide' : '');
        el.textContent = k;
        el.dataset.r = r;
        el.dataset.c = c;
        el.addEventListener('click', () => { state.searchRow = r; state.searchCol = c; activateKey(k); });
        rowEl.appendChild(el);
      });
      kb.appendChild(rowEl);
    });
    refreshKeyboardFocus();
  }

  function refreshKeyboardFocus() {
    const rows = $$('#keyboard .kb-row');
    rows.forEach((row, r) => {
      Array.from(row.children).forEach((el, c) => {
        el.classList.toggle('focused', state.searchFocusMode === 'keyboard' && r === state.searchRow && c === state.searchCol);
      });
    });
    if (state.searchFocusMode === 'results') {
      const items = $$('#search-results .ch-item');
      items.forEach((el, i) => el.classList.toggle('focused', i === state.searchResultFocus));
    }
  }

  function updateSearchResults() {
    const q = state.searchQuery.trim().toLowerCase();
    const box = $('#search-results');
    box.innerHTML = '';

    if (!q) { state.searchResults = []; return; }
    const filtered = state.channels.filter(c => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (String(c.number).includes(q)) return true;
      if ((c.group || '').toLowerCase().includes(q)) return true;
      return false;
    }).slice(0, 200);
    state.searchResults = filtered;

    filtered.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'ch-item';
      const num = state.settings.showNumbers
        ? '<div class="ch-num">' + String(c.number).padStart(3,'0') + '</div>'
        : '';
      let logoHtml = '<div class="ch-logo">' + initials(c.name) + '</div>';
      if (state.settings.showLogos && c.logo) {
        logoHtml = '<div class="ch-logo"><img src="' + escapeAttr(c.logo) + '" alt=""></div>';
      }
      el.innerHTML =
        num + logoHtml +
        '<div class="ch-name">' + escapeHtml(c.name) + '</div>' +
        '<div class="ch-group">' + escapeHtml(c.group || '') + '</div>';
      const img = el.querySelector('.ch-logo img');
      if (img) img.onerror = () => { img.parentElement.innerHTML = initials(c.name); };
      el.dataset.index = i;
      box.appendChild(el);
    });
    refreshKeyboardFocus();
  }

  function handleSearch(action) {
    if (state.searchFocusMode === 'keyboard') {
      const row = KB_ROWS[state.searchRow];
      switch (action) {
        case 'LEFT':  state.searchCol = (state.searchCol - 1 + row.length) % row.length; refreshKeyboardFocus(); return;
        case 'RIGHT': state.searchCol = (state.searchCol + 1) % row.length; refreshKeyboardFocus(); return;
        case 'UP':    state.searchRow = (state.searchRow - 1 + KB_ROWS.length) % KB_ROWS.length;
                      state.searchCol = Math.min(state.searchCol, KB_ROWS[state.searchRow].length - 1);
                      refreshKeyboardFocus(); return;
        case 'DOWN':
          if (state.searchRow === KB_ROWS.length - 1) {
            if (state.searchResults.length) {
              state.searchFocusMode = 'results';
              state.searchResultFocus = 0;
              refreshKeyboardFocus();
            }
          } else {
            state.searchRow++;
            state.searchCol = Math.min(state.searchCol, KB_ROWS[state.searchRow].length - 1);
          }
          refreshKeyboardFocus(); return;
        case 'OK':
          activateKey(row[state.searchCol]);
          return;
        case 'BACK':
          goBack(); return;
      }
    } else {
      // results mode
      switch (action) {
        case 'UP':
          if (state.searchResultFocus === 0) {
            state.searchFocusMode = 'keyboard';
            state.searchRow = KB_ROWS.length - 1;
            state.searchCol = Math.min(state.searchCol, KB_ROWS[state.searchRow].length - 1);
          } else {
            state.searchResultFocus--;
          }
          refreshKeyboardFocus(); scrollSearchTo(); return;
        case 'DOWN':
          if (state.searchResultFocus < state.searchResults.length - 1) state.searchResultFocus++;
          refreshKeyboardFocus(); scrollSearchTo(); return;
        case 'OK': {
          const ch = state.searchResults[state.searchResultFocus];
          if (ch) {
            const idx = state.channels.findIndex(c => c.id === ch.id);
            if (idx >= 0) {
              state.currentIndex = idx;
              playCurrent();
              showView('playing');
            }
          }
          return;
        }
        case 'BACK':
          state.searchFocusMode = 'keyboard';
          refreshKeyboardFocus(); return;
      }
    }
  }

  function scrollSearchTo() {
    const items = $$('#search-results .ch-item');
    if (items[state.searchResultFocus]) items[state.searchResultFocus].scrollIntoView({ block:'center' });
  }

  function activateKey(k) {
    if (k === 'SPACJA') state.searchQuery += ' ';
    else if (k === 'USUŃ') state.searchQuery = state.searchQuery.slice(0, -1);
    else if (k === 'CZYŚĆ') state.searchQuery = '';
    else if (k === 'ZAMKNIJ') { goBack(); return; }
    else state.searchQuery += k;
    renderSearchInput();
    updateSearchResults();
  }

  // ================== CLOCK / SCREENSAVER ==================
  function startClock() {
    const tick = () => {
      const t = formatTime(new Date());
      $('#clock').textContent = t;
      $('#ss-clock').textContent = t;
    };
    tick();
    state.clockTimer = setInterval(tick, 15000);
  }

  function resetScreensaver() {
    if (state.screensaverTimer) clearTimeout(state.screensaverTimer);
    hideScreensaver();
    const t = state.settings.screensaverTime || 0;
    if (t > 0 && state.view !== 'screensaver') {
      state.screensaverTimer = setTimeout(showScreensaver, t);
    }
  }
  function showScreensaver() {
    if (state.view === 'screensaver') return;
    state.prevView = state.view;
    state.view = 'screensaver';
    $('#screensaver').classList.remove('hidden');
  }
  function hideScreensaver() {
    if (!$('#screensaver').classList.contains('hidden')) {
      $('#screensaver').classList.add('hidden');
      if (state.view === 'screensaver') {
        state.view = state.prevView || (state.playing ? 'playing' : 'home');
      }
    }
  }

  // ================== HELPERS ==================
  function buildCategories() {
    const set = new Set();
    state.channels.forEach(c => { if (c.group) set.add(c.group); });
    state.categories = Array.from(set).sort();
  }

  function restoreLastChannel() {
    const last = Storage.getLastChannel();
    if (last && last.id) {
      const idx = state.channels.findIndex(c => c.id === last.id);
      if (idx >= 0) { state.currentIndex = idx; return; }
    }
    if (state.channels.length) state.currentIndex = 0;
  }

  function pushHistory(ch) {
    const entry = { id: ch.id, number: ch.number, name: ch.name, ts: Date.now() };
    state.history = state.history.filter(h => h.id !== ch.id);
    state.history.unshift(entry);
    if (state.history.length > 40) state.history.length = 40;
    Storage.saveHistory(state.history);
  }

  function toggleFavorite() {
    const ch = state.channels[state.currentIndex];
    if (!ch) return;
    const idx = state.favorites.indexOf(ch.id);
    if (idx >= 0) state.favorites.splice(idx, 1);
    else state.favorites.push(ch.id);
    Storage.saveFavorites(state.favorites);
    renderChannelList();
    showInfoBar();
  }

  function formatTime(d) {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }

  function initials(name) {
    if (!name) return 'TV';
    const parts = name.replace(/[^\p{L}\p{N} ]+/gu, ' ').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 3).toUpperCase();
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function escapeAttr(s) { return escapeHtml(s); }

  function promptSafe(message, def) {
    try { return window.prompt(message, def); }
    catch (e) { return null; }
  }

  // ================== GLOBAL START ==================
  window.addEventListener('DOMContentLoaded', () => {
    try { init(); }
    catch (e) {
      // Minimal fallback – never leave user with white screen
      document.body.innerHTML =
        '<div style="color:#fff;background:#000;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:32px">BŁĄD INICJALIZACJI</div>';
    }
  });

  // Public (debug) API
  return {
    get state() { return state; },
    showView
  };
})();
