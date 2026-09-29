const Player = (() => {
  let video = null;
  let hls = null;
  let onError = null;
  let onPlaying = null;
  let onStalled = null;
  let timeoutTimer = null;
  let settings = {};
  let currentUrl = null;
  let stopped = false;

  function init(videoEl) {
    video = videoEl;
    video.addEventListener('playing', () => {
      clearTimeout(timeoutTimer);
      if (onPlaying) onPlaying();
    });
    video.addEventListener('error', () => {
      if (stopped) return;
      if (onError) onError(video.error ? ('ERR ' + (video.error.code || 0)) : 'ERR');
    });
    video.addEventListener('stalled', () => {
      if (stopped) return;
      if (onStalled) onStalled();
    });
    video.addEventListener('abort', () => {});
    video.addEventListener('waiting', () => {});
  }

  function setSettings(s) { settings = s || {}; }
  function setOnError(fn) { onError = fn; }
  function setOnPlaying(fn) { onPlaying = fn; }
  function setOnStalled(fn) { onStalled = fn; }

  function isHlsUrl(url) {
    if (!url) return false;
    if (/\.m3u8(\?|#|$)/i.test(url)) return true;
    if (/^https?:/i.test(url) && !/\.(mp4|webm|ogg|mkv|mov|ts|mp3|aac)(\?|#|$)/i.test(url)) return true;
    return false;
  }

  function stop() {
    stopped = true;
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
    if (hls) {
      try { hls.destroy(); } catch (e) {}
      hls = null;
    }
    if (video) {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch (e) {}
    }
    currentUrl = null;
  }

  function play(url) {
    if (!video || !url) return;
    stopped = false;
    currentUrl = url;

    if (hls) {
      try { hls.destroy(); } catch (e) {}
      hls = null;
    }
    try {
      video.pause();
      video.removeAttribute('src');
      video.load();
    } catch (e) {}

    const wantHls = isHlsUrl(url);
    const nativeHls = video.canPlayType('application/vnd.apple.mpegurl') !== '';

    if (wantHls && !nativeHls && typeof Hls !== 'undefined' && Hls.isSupported()) {
      try {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          manifestLoadingTimeOut: settings.streamTimeout || 15000,
          manifestLoadingMaxRetry: Math.max(1, settings.reconnectAttempts || 3),
          manifestLoadingRetryDelay: settings.reconnectDelay || 2000,
          levelLoadingTimeOut: settings.streamTimeout || 15000,
          fragLoadingTimeOut: settings.streamTimeout || 15000
        });
        hls.on(Hls.Events.ERROR, (evt, data) => {
          if (data && data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                try { hls.startLoad(); } catch (e) { handleFatal(); }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                try { hls.recoverMediaError(); } catch (e) { handleFatal(); }
                break;
              default:
                handleFatal();
            }
          }
        });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          safePlay();
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } catch (e) {
        handleFatal();
        return;
      }
    } else {
      video.src = url;
      safePlay();
    }

    if (settings.streamTimeout) {
      timeoutTimer = setTimeout(() => {
        if (video.readyState < 2) handleFatal();
      }, settings.streamTimeout);
    }
  }

  function safePlay() {
    if (!video) return;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { /* autoplay blocked – user interaction needed */ });
    }
  }

  function handleFatal() {
    if (stopped) return;
    if (onError) onError('FATAL');
  }

  function togglePlay() {
    if (!video || !currentUrl) return;
    if (video.paused) safePlay();
    else video.pause();
  }
  function isPaused() { return !video || video.paused; }
  function toggleMute() { if (video) video.muted = !video.muted; }
  function isMuted()   { return video ? video.muted : false; }
  function volumeUp()  { if (video) { video.volume = Math.min(1, video.volume + 0.1); video.muted = false; } }
  function volumeDown(){ if (video) video.volume = Math.max(0, video.volume - 0.1); }

  function toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const r = el.requestFullscreen || el.webkitRequestFullscreen;
      if (r) { try { r.call(el); } catch (e) {} }
    } else {
      const r = document.exitFullscreen || document.webkitExitFullscreen;
      if (r) { try { r.call(document); } catch (e) {} }
    }
  }

  return {
    init, play, stop,
    togglePlay, isPaused,
    toggleMute, isMuted,
    volumeUp, volumeDown,
    toggleFullscreen,
    setOnError, setOnPlaying, setOnStalled,
    setSettings,
    getCurrentUrl: () => currentUrl
  };
})();
