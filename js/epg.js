const EPG = (() => {
  const programs = {};   // epgId -> [ { start, stop, title, desc } ]
  let loaded = false;

  function parseXmltvTime(s) {
    if (!s) return 0;
    const m = s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+\-]\d{4})?/);
    if (!m) return 0;
    const [, y, mo, d, h, mi, se, tz] = m;
    const tzStr = tz ? (tz.substring(0,3) + ':' + tz.substring(3)) : '+0000';
    const iso = `${y}-${mo}-${d}T${h}:${mi}:${se||'00'}${tzStr.substring(0,3)}:${tzStr.substring(3)}`;
    const t = Date.parse(iso);
    return isNaN(t) ? 0 : t;
  }

  function parseXMLTV(text) {
    if (!text) return;
    try {
      const doc = new DOMParser().parseFromString(text, 'text/xml');
      const list = doc.querySelectorAll('programme');
      list.forEach(p => {
        const ch = p.getAttribute('channel');
        if (!ch) return;
        const start = parseXmltvTime(p.getAttribute('start'));
        const stop  = parseXmltvTime(p.getAttribute('stop'));
        const titleNode = p.querySelector('title');
        const descNode  = p.querySelector('desc');
        const title = titleNode ? titleNode.textContent : '';
        const desc  = descNode ? descNode.textContent : '';
        if (!programs[ch]) programs[ch] = [];
        programs[ch].push({ start, stop, title, desc });
      });
      Object.keys(programs).forEach(k => programs[k].sort((a,b)=>a.start-b.start));
      loaded = true;
    } catch (e) { /* malformed xml */ }
  }

  async function load(url) {
    if (!url) return false;
    try {
      const res = await fetch(url, { mode:'cors' });
      if (!res.ok) return false;
      const text = await res.text();
      parseXMLTV(text);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getNow(epgId) {
    if (!epgId || !programs[epgId]) return null;
    const now = Date.now();
    return programs[epgId].find(p => p.start <= now && p.stop > now) || null;
  }
  function getNext(epgId) {
    if (!epgId || !programs[epgId]) return null;
    const now = Date.now();
    return programs[epgId].find(p => p.start > now) || null;
  }
  function getRange(epgId, from, to) {
    if (!epgId || !programs[epgId]) return [];
    return programs[epgId].filter(p => p.stop > from && p.start < to);
  }
  function hasData() { return loaded; }

  return { load, getNow, getNext, getRange, hasData };
})();
