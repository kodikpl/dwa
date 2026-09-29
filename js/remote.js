const Remote = (() => {
  const handlers = {};

  // Map keyCodes used by common Smart TV browsers / HbbTV / Tizen / webOS
  const KEY_MAP = {
    37:'LEFT', 38:'UP', 39:'RIGHT', 40:'DOWN',
    13:'OK', 27:'BACK', 8:'BACK', 461:'BACK', 10009:'BACK',
    179:'PLAYPAUSE', 415:'PLAY', 19:'PAUSE', 10252:'PLAYPAUSE',
    18:'MENU', 457:'MENU', 77:'MENU', 104:'MENU',
    427:'CH_UP', 428:'CH_DOWN', 33:'CH_UP', 34:'CH_DOWN',
    48:'NUM0', 49:'NUM1', 50:'NUM2', 51:'NUM3', 52:'NUM4',
    53:'NUM5', 54:'NUM6', 55:'NUM7', 56:'NUM8', 57:'NUM9',
    96:'NUM0', 97:'NUM1', 98:'NUM2', 99:'NUM3', 100:'NUM4',
    101:'NUM5', 102:'NUM6', 103:'NUM7', 104:'NUM8', 105:'NUM9'
  };

  const STRING_MAP = {
    'ArrowUp':'UP','ArrowDown':'DOWN','ArrowLeft':'LEFT','ArrowRight':'RIGHT',
    'Enter':'OK','Escape':'BACK','Backspace':'BACK',' ':'PLAYPAUSE',
    'MediaPlayPause':'PLAYPAUSE','MediaPlay':'PLAY','MediaPause':'PAUSE',
    'ContextMenu':'MENU','m':'MENU','M':'MENU',
    'PageUp':'CH_UP','PageDown':'CH_DOWN'
  };

  function on(action, fn) {
    if (!handlers[action]) handlers[action] = [];
    handlers[action].push(fn);
  }

  function emit(action, ev) {
    const list = handlers[action];
    if (!list) return;
    for (let i = 0; i < list.length; i++) {
      try { list[i](ev); } catch (e) { /* keep UI alive */ }
    }
  }

  function resolveAction(ev) {
    let a = KEY_MAP[ev.keyCode];
    if (!a && ev.key && STRING_MAP[ev.key]) a = STRING_MAP[ev.key];
    if (!a && ev.key && ev.key.length === 1 && /[0-9]/.test(ev.key)) {
      a = 'NUM' + ev.key;
    }
    return a;
  }

  function init() {
    document.addEventListener('keydown', (ev) => {
      const action = resolveAction(ev);
      if (action) {
        ev.preventDefault();
        ev.stopPropagation();
        emit(action, ev);
      }
    }, true);
  }

  return { init, on, emit };
})();
