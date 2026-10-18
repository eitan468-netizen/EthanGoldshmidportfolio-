/* Ethan Goldshmid — portfolio interactions */
(function () {
  "use strict";

  // ---- Always open at the top of a page ----
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  function toTop() { if (location.hash) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} } window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }
  window.addEventListener("pageshow", toTop);
  window.addEventListener("load", toTop);
  toTop();
  var moved = false; window.addEventListener("wheel", function () { moved = true; }, { passive: true }); window.addEventListener("touchstart", function () { moved = true; }, { passive: true }); window.addEventListener("keydown", function () { moved = true; });
  ["pointerdown","mousedown"].forEach(function (t) { window.addEventListener(t, function () { moved = true; }, { passive: true }); });
  window.addEventListener("scroll", function () { if (!moved && window.scrollY > 0) window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, { passive: true });
  ["focus", "visibilitychange"].forEach(function (t) { window.addEventListener(t, function () { if (!moved) window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }); });
  [60, 250, 600, 1200, 2500, 5000].forEach(function (d) { setTimeout(function () { if (!moved) window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, d); });

  // ---- Contact form (no backend; confirm in place) ----
  document.addEventListener("submit", function (e) {
    var form = e.target.closest("[data-contact-form]");
    if (!form) return;
    e.preventDefault();
    var ok = document.createElement("div");
    ok.className = "cform__ok";
    ok.innerHTML = "<b>Message received.</b> I'll read it carefully and get back to you, usually within the same day.";
    form.replaceWith(ok);
  });

  // ---- Theme toggle (persists per-viewer; tolerates blocked storage) ----
  var root = document.documentElement;
  function storedTheme() {
    var v = null, q = /[?&]t=(dark|light)/.exec(location.search);
    if (q) return q[1];
    try { v = localStorage.getItem("eg-theme"); } catch (e) {}
    if (!v) try { v = sessionStorage.getItem("eg-theme"); } catch (e) {}
    if (!v) { var m = /egt=(dark|light)/.exec(window.name || ""); v = m && m[1]; }
    return v;
  }
  function saveTheme(v) {
    try { localStorage.setItem("eg-theme", v); } catch (e) {}
    try { sessionStorage.setItem("eg-theme", v); } catch (e) {}
    window.name = (window.name || "").replace(/egt=(dark|light);?/, "") + "egt=" + v + ";";
  }
  var saved = storedTheme();
  root.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
  function tagLinks() {
    var th = root.getAttribute("data-theme");
    document.querySelectorAll("a[href]").forEach(function (l) {
      var h = l.getAttribute("href");
      if (!h || /^(#|mailto:|tel:|https?:)/.test(h) || l.hasAttribute("download") || !/\.html?([?#].*)?$/.test(h)) return;
      var p = h.split("#"), b = p[0].replace(/[?&]t=(dark|light)/, "");
      l.setAttribute("href", b + (b.indexOf("?") > -1 ? "&" : "?") + "t=" + th + (p[1] ? "#" + p[1] : ""));
    });
  }
  tagLinks();
  function syncToggles() {
    var dark = root.getAttribute("data-theme") === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) { b.setAttribute("aria-pressed", dark ? "true" : "false"); });
  }
  syncToggles();
  window.addEventListener("storage", function (e) { if (e.key === "eg-theme" && (e.newValue === "dark" || e.newValue === "light")) { root.setAttribute("data-theme", e.newValue); syncToggles(); tagLinks(); } });

  function currentIsDark() {
    var attr = root.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    return false;
  }

  document.addEventListener("click", function (e) {
    if (!e.isTrusted) return;
    var t = e.target.closest("[data-theme-toggle]");
    if (!t) return;
    e.stopPropagation();
    var next = currentIsDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    saveTheme(next);
    syncToggles();
    tagLinks();
  });

  // ---- Copy-to-clipboard (email) ----
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var text = btn.getAttribute("data-copy");
    var done = function () {
      var old = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("copied");
      setTimeout(function () { btn.textContent = old; btn.classList.remove("copied"); }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  });
  function fallbackCopy(text, cb) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
      cb();
    } catch (e) {}
  }

  // ---- Hero role rotator ----
  var rot = document.querySelector(".hero__rotator");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (rot && !reduceMotion) {
    var roles;
    try { roles = JSON.parse(rot.getAttribute("data-roles") || "[]"); } catch (e) { roles = []; }
    if (roles.length > 1) {
      var i = 0;
      setInterval(function () {
        rot.classList.add("swap");
        setTimeout(function () {
          i = (i + 1) % roles.length;
          rot.textContent = roles[i];
          rot.classList.remove("swap");
        }, 340);
      }, 2400);
    }
  }

  // ---- Smooth fade-out when navigating to another internal page ----
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.target === "_blank" || /^(mailto:|tel:|https?:)/.test(href)) return;
      if (a.hasAttribute("data-theme-toggle")) return;
      if (a.hasAttribute("download") || !/\.html?([?#].*)?$|^#/.test(href)) return;
      e.preventDefault();
      var here = location.pathname.split("/").pop() || "index.html";
      if (href.split("#")[0].split("?")[0] === here) {
        var hid = href.split("#")[1], tgt = hid && document.getElementById(hid);
        if (tgt) tgt.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      document.body.classList.add("leaving");
      setTimeout(function () { window.location.href = href; }, 240);
      setTimeout(function () { document.body.classList.remove("leaving"); }, 2000);
    });
    window.addEventListener("pageshow", function (ev) {
      if (ev.persisted) document.body.classList.remove("leaving");
    });
  }

  // ---- Header hairline on scroll ----
  var header = document.getElementById("header") || document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("stuck", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---- Scroll-spy for the stage rail ----
  var rail = document.querySelector(".stage-rail");
  if (rail && "IntersectionObserver" in window) {
    var links = {};
    rail.querySelectorAll("a[href^='#']").forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
          a.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    document.querySelectorAll(".stage[id]").forEach(function (s) { io.observe(s); });
  }
})();

/* ---- Polish: hero word hover, video autoplay, cursor accent ---- */
(function () {
  var hs = document.querySelector(".hero__sub");
  if (hs) {
    var walk = function (n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) f.appendChild(document.createTextNode(t));
            else { var s = document.createElement("span"); s.className = "w"; s.textContent = t; f.appendChild(s); }
          });
          n.replaceChild(f, c);
        } else if (c.nodeType === 1) walk(c);
      });
    };
    walk(hs);
  }
  var vids = document.querySelectorAll("video[data-autoplay]");
  if (vids.length && "IntersectionObserver" in window) {
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { v.muted = true; v.loop = true; v.playsInline = true; vo.observe(v); });
  }
})();


/* reveal on scroll, shared by all pages */
(function () {
  var els = document.querySelectorAll("[data-rv]");
  if (!els.length) return;
  if (!("IntersectionObserver" in window) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  els.forEach(function (e) { io.observe(e); });
})();

/* theme guard: re-apply the saved choice when restored from bfcache; nothing else may change it */
window.addEventListener("pageshow", function () {
  try { var t = null; try { t = localStorage.getItem("eg-theme"); } catch (x) {} if (!t) try { t = sessionStorage.getItem("eg-theme"); } catch (x) {} if (!t) { var m = /egt=(dark|light)/.exec(window.name || ""); t = m && m[1]; } var r = document.documentElement;
    if ((t === "dark" || t === "light") && r.getAttribute("data-theme") !== t) r.setAttribute("data-theme", t); } catch (e) {}
});

/* single sliding nav indicator: one active item at a time */
(function () {
  var box = document.querySelector(".nav__links");
  if (!box) return;
  var links = Array.prototype.slice.call(box.querySelectorAll("a"));
  var ind = document.createElement("span"); ind.className = "nav__ind"; ind.setAttribute("aria-hidden", "true"); box.appendChild(ind);
  box.classList.add("has-ind");
  var current = box.querySelector('a[aria-current="page"]') || null;
  function place(a) {
    if (!a) { ind.style.opacity = 0; return; }
    var b = a.getBoundingClientRect(), p = box.getBoundingClientRect();
    ind.style.opacity = 1;
    ind.style.transform = "translate3d(" + (b.left - p.left) + "px,0,0) scaleX(" + b.width + ")";
    links.forEach(function (l) { l.classList.toggle("hot", l === a); });
  }
  function rest() { place(null); }
  links.forEach(function (a) {
    a.addEventListener("mouseenter", function () { place(a); });
    a.addEventListener("focus", function () { place(a); });
    a.addEventListener("blur", rest);
  });
  box.addEventListener("mouseleave", rest);
  window.addEventListener("resize", rest);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rest);
  rest();
  // clicking a link on this page keeps one active item
  box.addEventListener("click", function (e) { var a = e.target.closest("a"); if (a) { current = a; links.forEach(function (l) { if (l === a) l.setAttribute("aria-current", "page"); else l.removeAttribute("aria-current"); }); place(a); a.blur(); } });
})();

/* About: view tabs, 3D tilt + flip cards */
(function () {
  var tabs = document.querySelectorAll("[data-ab]");
  if (tabs.length) tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); x.classList.toggle("btn--solid", x === t); });
      document.querySelectorAll("[data-panel]").forEach(function (p) {
        var on = p.getAttribute("data-panel") === t.getAttribute("data-ab");
        p.hidden = !on;
        if (on) p.querySelectorAll("[data-rv]").forEach(function (e) { e.classList.add("in"); });
      });
    });
  });
  var fine = window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".flipc__pills").forEach(function (g) { g.querySelectorAll("span").forEach(function (s, i) { s.style.setProperty("--i", i); }); });
  document.querySelectorAll(".flipc").forEach(function (c) {
    var tilt = c.querySelector(".flipc__tilt"), back = c.querySelector(".flipc__b"), t;
    function set(on) { c.classList.toggle("on", on); back.setAttribute("aria-hidden", on ? "false" : "true"); }
    if (fine) {
      c.addEventListener("mouseenter", function () { t = setTimeout(function () { set(true); }, 140); });
      c.addEventListener("mouseleave", function () { clearTimeout(t); set(false); tilt.style.transform = ""; });
      if (!rm) c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        tilt.style.transform = "perspective(1000px) rotateX(" + (-y * 4).toFixed(2) + "deg) rotateY(" + (x * 5).toFixed(2) + "deg)";
      });
    }
    c.addEventListener("click", function () { if (!fine) set(!c.classList.contains("on")); });
    c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(!c.classList.contains("on")); } if (e.key === "Escape") set(false); });
    c.addEventListener("focus", function () { if (!fine) return; });
  });
})();
