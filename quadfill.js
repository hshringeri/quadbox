// quadfill — injected into a game tab; pins the video player to fill the window.
// Full-bleed video, no page chrome. Retries until a playable video exists.
(function () {
  if (window.__quadfill) return 'already';
  window.__quadfill = true;

  function biggestVideo() {
    let best = null, bestArea = 0;
    document.querySelectorAll('video').forEach(function (v) {
      const r = v.getBoundingClientRect();
      const area = r.width * r.height;
      if (area > bestArea) { best = v; bestArea = area; }
    });
    return best;
  }

  // climb to the player wrapper so the site's own controls stay usable
  function playerRoot(video) {
    let el = video, r = video.getBoundingClientRect();
    for (let p = video.parentElement; p && p !== document.body; p = p.parentElement) {
      const pr = p.getBoundingClientRect();
      if (pr.width > r.width * 1.3 || pr.height > r.height * 1.3) break;
      el = p; r = pr;
    }
    return el;
  }

  function pin() {
    // only in quad-sized windows; never hijack a normal full-width browser window
    if (window.outerWidth > screen.width * 0.6) return 'skip:window-too-wide';
    const v = biggestVideo();
    if (!v || v.getBoundingClientRect().width < 50) return 'skip:no-video';
    const el = playerRoot(v);
    if (el.dataset.quadfill === '1' && document.contains(el)) return 'pinned';
    el.dataset.quadfill = '1';
    const CSS_FIXED = 'position:fixed!important;left:0!important;top:0!important;' +
      'width:100vw!important;height:100vh!important;max-width:100vw!important;' +
      'max-height:100vh!important;margin:0!important;padding:0!important;' +
      'transform:none!important;z-index:2147483646!important;background:#000!important';
    document.documentElement.style.setProperty('background', '#000', 'important');
    if (document.body) document.body.style.setProperty('overflow', 'hidden', 'important');
    if (el.tagName === 'VIDEO') {
      el.style.cssText = CSS_FIXED + 'object-fit:contain!important';
    } else {
      el.style.cssText = CSS_FIXED;
      const vid = el.querySelector('video');
      if (vid) vid.style.cssText = 'position:absolute!important;left:0!important;top:0!important;' +
        'width:100%!important;height:100%!important;object-fit:contain!important;background:#000!important';
    }
    return 'pinned';
  }

  setInterval(pin, 2000); // re-pin if the SPA rebuilds the player
  return pin();
})();
