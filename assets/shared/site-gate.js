/* ───────────────────────────────────────────────────────────────
   Site gate — asks for a password before any page is shown.

   This is a soft gate, not security. The password is in this file
   and the page content is in the HTML, so anyone who views source
   or fetches the file directly can get past it. It keeps casual
   visitors and scrapers out; it does not protect secrets.

   Must be loaded as the FIRST script in <head> on every page so the
   lock lands before the body paints.
   ─────────────────────────────────────────────────────────────── */
(function () {
  var PASSWORD = "enter2026";
  var STORAGE_KEY = "site_unlocked_v1";

  // Already unlocked this browser — render nothing.
  try {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
  } catch (e) { /* storage blocked — fall through and show the gate */ }

  // Hide everything except the overlay. Applied to <html> immediately,
  // before <body> exists, so there is no flash of the page underneath.
  var hideStyle = document.createElement("style");
  hideStyle.id = "siteGateHideStyle";
  hideStyle.textContent = [
    "html.is-site-locked body > *:not(#siteGateOverlay) { visibility: hidden !important; }",
    "html.is-site-locked, html.is-site-locked body { overflow: hidden !important; }",
    "@keyframes siteGateShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}"
  ].join("\n");
  document.head.appendChild(hideStyle);
  document.documentElement.classList.add("is-site-locked");

  function mount() {
    // Match whichever theme the visitor would otherwise land on.
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) {}
    var dark = saved
      ? saved === "dark"
      : !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

    var bg        = dark ? "#111010" : "#ffffff";
    var text      = dark ? "#F0EDE8" : "#040202";
    var secondary = dark ? "#777370" : "#6F767E";
    var border    = dark ? "#2A2826" : "#e0deda";
    var field     = dark ? "#1A1918" : "#F0EFED";
    var UI        = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";
    var DISPLAY   = "'Instrument Serif',Georgia,'Times New Roman',serif";

    var overlay = document.createElement("div");
    overlay.id = "siteGateOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "siteGateTitle");
    overlay.style.cssText = [
      "position:fixed", "inset:0", "z-index:2147483647",
      "background:" + bg, "color:" + text,
      "display:flex", "align-items:center", "justify-content:center",
      "padding:24px", "font-family:" + UI,
      // Opaque from the first paint. A fade-in here would depend on a frame
      // callback or animation tick, and if either is throttled the visitor
      // gets a blank page: content hidden, gate invisible.
      "visibility:visible", "opacity:1"
    ].join(";");

    overlay.innerHTML = ''
      + '<div style="width:100%;max-width:420px;text-align:center;">'
      +   '<p style="font-family:' + UI + ';font-size:9.9px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:' + secondary + ';margin:0 0 20.9px;">Puru Bhardwaj &middot; Product Designer</p>'
      +   '<h1 id="siteGateTitle" style="font-family:' + DISPLAY + ';font-size:clamp(34px,6vw,52px);font-weight:400;letter-spacing:-0.02em;line-height:1.1;margin:0 0 12.9px;">This portfolio is private.</h1>'
      +   '<p style="font-size:15px;line-height:1.618;color:' + secondary + ';margin:0 0 33.9px;">Much of this work is covered by an NDA, so the site is password-protected. If you don\'t have the password, email me at <a href="mailto:purubhardwaj99@gmail.com" style="color:' + text + ';text-decoration:underline;text-underline-offset:3px;">purubhardwaj99@gmail.com</a> and I\'ll send it over.</p>'
      +   '<form id="siteGateForm" autocomplete="off" novalidate>'
      +     '<label for="siteGatePass" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;">Password</label>'
      +     '<input id="siteGatePass" type="password" autocomplete="current-password" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Password" '
      +       'style="width:100%;padding:15px 18px;font-family:' + UI + ';font-size:15px;letter-spacing:0.08em;background:' + field + ';color:' + text + ';border:1.5px solid ' + border + ';border-radius:10px;outline:none;text-align:center;transition:border-color .2s;">'
      +     '<p id="siteGateErr" role="alert" style="min-height:20px;margin:12.9px 0 0;font-family:' + UI + ';font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#E0533C;opacity:0;transition:opacity .2s;">That password is not right</p>'
      +     '<button type="submit" style="margin-top:8px;width:100%;padding:14px 20px;font-family:' + UI + ';font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;background:' + text + ';color:' + bg + ';border:none;border-radius:10px;cursor:pointer;transition:transform .15s ease,opacity .15s ease;">Enter &rarr;</button>'
      +   '</form>'
      + '</div>';

    document.body.appendChild(overlay);

    var input = overlay.querySelector("#siteGatePass");
    var errEl = overlay.querySelector("#siteGateErr");
    var form  = overlay.querySelector("#siteGateForm");
    var btn   = overlay.querySelector("button");

    input.addEventListener("focus", function () { input.style.borderColor = text; });
    input.addEventListener("blur",  function () { input.style.borderColor = border; });
    input.addEventListener("input", function () { errEl.style.opacity = "0"; });
    btn.addEventListener("mousedown",  function () { btn.style.transform = "scale(0.985)"; });
    btn.addEventListener("mouseup",    function () { btn.style.transform = "scale(1)"; });
    btn.addEventListener("mouseleave", function () { btn.style.transform = "scale(1)"; });

    setTimeout(function () { input.focus(); }, 50);

    // Keep focus inside the gate while it is up.
    overlay.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = [input, btn];
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if ((input.value || "").trim() === PASSWORD) {
        try { localStorage.setItem(STORAGE_KEY, "1"); } catch (err) {}
        overlay.style.transition = "opacity .3s ease";
        overlay.style.opacity = "0";
        setTimeout(function () {
          document.documentElement.classList.remove("is-site-locked");
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          var s = document.getElementById("siteGateHideStyle");
          if (s && s.parentNode) s.parentNode.removeChild(s);
        }, 350);
      } else {
        errEl.style.opacity = "1";
        input.value = "";
        input.style.animation = "none";
        void input.offsetHeight; // reflow so the shake can replay
        input.style.animation = "siteGateShake .4s ease";
        input.focus();
      }
    });
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
