const Storage = (() => {
  const KEYS = {
    playlist:     'iptv.playlist',
    playlistUrl:  'iptv.playlistUrl',
    lastChannel:  'iptv.lastChannel',
    favorites:    'iptv.favorites',
    history:      'iptv.history',
    settings:     'iptv.settings'
  };

  const DEFAULTS = {
    autoplay:           true,
    autoSwitchOnError:  true,
    reconnectAttempts:  3,
    reconnectDelay:     2000,
    rememberLast:       true,
    fullscreen:         false,
    infoBarDuration:    4000,
    animations:         true,
    fontSize:           2,
    panelOpacity:       2,
    screensaverTime:    90000,
    showNumbers:        true,
    showLogos:          true,
    groupChannels:      false,
    sortMode:           0,
    favoritesFirst:     false,
    streamTimeout:      15000,
    autoReconnect:      true,
    dataSaver:          false,
    epgUrl:             ''
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { /* quota / private mode */ }
  }
  function drop(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  return {
    KEYS,
    getSettings() {
      const saved = read(KEYS.settings, null);
      return Object.assign({}, DEFAULTS, saved || {});
    },
    saveSettings(s) { write(KEYS.settings, s); },
    resetSettings() { drop(KEYS.settings); },

    getPlaylist()   { return read(KEYS.playlist, null); },
    savePlaylist(p) { write(KEYS.playlist, p); },
    getPlaylistUrl(){ return read(KEYS.playlistUrl, ''); },
    savePlaylistUrl(u) { write(KEYS.playlistUrl, u); },
    clearPlaylist() {
      drop(KEYS.playlist);
      drop(KEYS.playlistUrl);
    },

    getLastChannel()   { return read(KEYS.lastChannel, null); },
    saveLastChannel(c) { write(KEYS.lastChannel, c); },

    getFavorites()   { return read(KEYS.favorites, []); },
    saveFavorites(f) { write(KEYS.favorites, f); },
    clearFavorites() { drop(KEYS.favorites); },

    getHistory()   { return read(KEYS.history, []); },
    saveHistory(h) { write(KEYS.history, h); },
    clearHistory() { drop(KEYS.history); }
  };
})();
