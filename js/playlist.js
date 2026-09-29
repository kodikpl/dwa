const Playlist = (() => {

  function parseAttrString(meta) {
    const attrs = {};
    const re = /([a-zA-Z0-9_\-]+)\s*=\s*"([^"]*)"/g;
    let m;
    while ((m = re.exec(meta)) !== null) {
      attrs[m[1].toLowerCase()] = m[2];
    }
    const re2 = /([a-zA-Z0-9_\-]+)\s*=\s*'([^']*)'/g;
    while ((m = re2.exec(meta)) !== null) {
      attrs[m[1].toLowerCase()] = m[2];
    }
    return attrs;
  }

  function parseExtinf(line) {
    const result = { name:'', logo:'', group:'', tvgId:'', tvgName:'', chno:'' };
    const commaIdx = line.indexOf(',');
    const metaPart = commaIdx >= 0 ? line.substring(0, commaIdx) : line;
    const namePart = commaIdx >= 0 ? line.substring(commaIdx + 1).trim() : '';
    const attrs = parseAttrString(metaPart);

    result.tvgId   = attrs['tvg-id']    || '';
    result.tvgName = attrs['tvg-name']  || '';
    result.logo    = attrs['tvg-logo']  || '';
    result.group   = attrs['group-title'] || '';
    result.chno    = attrs['tvg-chno']  || '';
    result.name    = namePart || result.tvgName || '';
    return result;
  }

  function parse(text) {
    if (!text || typeof text !== 'string') return [];
    const lines = text.split(/\r?\n/);
    const channels = [];
    let pending = null;
    let auto = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith('#EXTINF')) {
        pending = parseExtinf(line);
      } else if (line.startsWith('#EXTGRP')) {
        if (pending) pending.group = pending.group || line.substring(7).trim().replace(/^:/, '');
      } else if (line.startsWith('#')) {
        continue;
      } else {
        if (!pending) continue;
        auto++;
        const url = line;
        const num = parseInt(pending.chno, 10) || auto;
        channels.push({
          id: 'ch_' + auto + '_' + Math.random().toString(36).slice(2, 7),
          number: num,
          name: (pending.name || ('Kanał ' + auto)).trim(),
          logo: pending.logo || '',
          url: url,
          group: (pending.group || 'Inne').trim(),
          epgId: pending.tvgId || '',
          hidden: false
        });
        pending = null;
      }
    }

    // If numbers conflict, keep playlist order stable
    channels.sort((a, b) => a.number - b.number);
    return channels;
  }

  function toM3U(channels) {
    let out = '#EXTM3U\n';
    channels.forEach(c => {
      out += `#EXTINF:-1 tvg-id="${c.epgId||''}" tvg-name="${c.name}" tvg-logo="${c.logo||''}" group-title="${c.group||''}",${c.name}\n`;
      out += c.url + '\n';
    });
    return out;
  }

  function parseFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  async function fetchText(url) {
    const res = await fetch(url, { method:'GET', mode:'cors' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.text();
  }

  return { parse, toM3U, parseFile, fetchText };
})();
