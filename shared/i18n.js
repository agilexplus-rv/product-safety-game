/* Shared language handling for the Product Safety Games.
 * Language choice persists in localStorage and is shared by the hub and both games. */
(function () {
  var KEY = 'psg-lang';

  function getLang() {
    var l = null;
    try { l = localStorage.getItem(KEY); } catch (e) { /* storage may be blocked */ }
    return (l === 'mt' || l === 'en') ? l : 'en';
  }

  function setLang(l) {
    if (l !== 'mt' && l !== 'en') return;
    try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
    document.documentElement.setAttribute('lang', l);
  }

  /* Build a translate function bound to a strings object of shape
   * { en: {key: "..."}, mt: {key: "..."} }. Falls back to English, then the key. */
  function makeT(strings) {
    return function (key) {
      var lang = getLang();
      var s = (strings[lang] && strings[lang][key]);
      if (s === undefined) s = strings.en && strings.en[key];
      return s === undefined ? key : s;
    };
  }

  /* Wire up any element with [data-lang-btn] as a toggle, and translate
   * all elements carrying [data-i18n="key"] using the given strings. */
  function applyStatic(strings) {
    var t = makeT(strings);
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    var btns = document.querySelectorAll('[data-lang-btn]');
    for (var j = 0; j < btns.length; j++) {
      var b = btns[j];
      b.classList.toggle('active', b.getAttribute('data-lang-btn') === getLang());
      if (!b._psgBound) {
        b._psgBound = true;
        b.addEventListener('click', function () {
          setLang(this.getAttribute('data-lang-btn'));
          location.reload();
        });
      }
    }
    document.documentElement.setAttribute('lang', getLang());
  }

  window.PSG = { getLang: getLang, setLang: setLang, makeT: makeT, applyStatic: applyStatic };
})();
