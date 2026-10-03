// quadfill content script — pins the page's video to fill the window.
// Runs on every site but only activates in quad-sized windows (< 60% of
// screen width), so normal browsing is never touched.
//
// Two cases:
//  - page has a <video> (YouTube, NFL+, ESPN, Prime...): pin its player wrapper
//  - page embeds the player in an <iframe> (streameast-style aggregators):
//    pin the biggest iframe in the top page; this script also runs inside the
//    frame (all_frames) and pins the <video> there to fill the iframe
(function () {
  if (window.__quadfill) return;
  window.__quadfill = true;

  const CSS_FIXED = 'position:fixed!important;left:0!important;top:0!important;' +
    'width:100vw!important;height:100vh!important;max-width:100vw!important;' +
    'max-height:100vh!important;margin:0!important;padding:0!important;' +
    'transform:none!important;z-index:2147483646!important;background:#000!important';
  const CSS_VIDEO = 'position:absolute!important;left:0!important;top:0!important;' +
    'width:100%!important;height:100%!important;object-fit:contain!important;background:#000!important';

  function biggestByArea(selector) {
    let best = null, bestArea = 0;
    document.querySelectorAll(selector).forEach(function (el) {
      const r = el.getBoundingClientRect();
      const area = r.width * r.height;
      if (area > bestArea) { best = el; bestArea = area; }
    });
    return { el: best, area: bestArea };
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

  function pinElement(el) {
    if (el.dataset.quadfill === '1' && document.contains(el)) return;
    el.dataset.quadfill = '1';
    document.documentElement.style.setProperty('background', '#000', 'important');
    if (document.body) document.body.style.setProperty('overflow', 'hidden', 'important');
    if (el.tagName === 'VIDEO') {
      el.style.cssText = CSS_FIXED + 'object-fit:contain!important';
    } else {
      el.style.cssText = CSS_FIXED;
      const vid = el.tagName === 'IFRAME' ? null : el.querySelector('video');
      if (vid) vid.style.cssText = CSS_VIDEO;
    }
  }

  function pin() {
    if (window.outerWidth > screen.width * 0.6) return; // not a quad window
    const v = biggestByArea('video');
    if (v.el && v.el.getBoundingClientRect().width >= 50) {
      pinElement(playerRoot(v.el));
      return;
    }
    if (window === window.top) {
      const f = biggestByArea('iframe');
      if (f.el && f.area > 20000) pinElement(f.el); // ignore tiny ad iframes
    }
  }

  setInterval(pin, 2000); // retries until player exists; re-pins if SPA rebuilds
  pin();
})();
