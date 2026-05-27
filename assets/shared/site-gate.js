(function () {
  var PASSWORD = "enter2026";
  var STORAGE_KEY = "site_unlocked_v1";

  // Already unlocked — bail out without rendering anything.
  try {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
  } catch (e) { /* localStorage blocked — fall through and show gate */ }

  // Hide page until user authenticates. Inserted as soon as the script runs
  // (must be loaded synchronously in <head> before <body>).
  var styleHide = document.createElement("style");
  styleHide.id = "siteGateHideStyle";
  styleHide.textContent = "html.is-locked body { visibility: hidden !important; }";
  document.head.appendChild(styleHide);
  document.documentElement.classList.add("is-locked");

  function mount() {
    // Detect preferred theme
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) {}
    var prefersDark = saved
      ? saved === "dark"
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

    var bg = prefersDark ? "#111010" : "#ffffff";
    var text = prefersDark ? "#F0EDE8" : "#040202";
    var secondary = prefersDark ? "#777370" : "#6F767E";
    var border = prefersDark ? "#2A2826" : "#e0deda";
    var inputBg = prefersDark ? "#1A1918" : "#F0EFED";

    var overlay = document.createElement("div");
    overlay.id = "siteGateOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Password protected");
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:2147483647",
      "background:" + bg,
      "color:" + text,
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "padding:24px",
      "font-family:'Plus Jakarta Sans',-apple-system,sans-serif",
      "opacity:0",
      "transition:opacity .35s ease"
    ].join(";");

    overlay.innerHTML = ''
      + '<div style="width:100%;max-width:420px;text-align:center;">'
      +   '<div style="font-family:\'Space Mono\',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:' + secondary + ';margin-bottom:24px;">Puru Bhardwaj &middot; Portfolio</div>'
      +   '<h1 style="font-family:\'Space Mono\',monospace;font-size:clamp(28px,5vw,42px);font-weight:700;letter-spacing:-0.02em;line-height:1.1;margin:0 0 16px;">This site is password protected.</h1>'
      +   '<p style="font-size:15px;line-height:1.6;color:' + secondary + ';margin:0 0 36px;">Enter the password to continue. If you don\'t have it, reach out at <a href="mailto:purubhardwaj99@gmail.com" style="color:' + text + ';text-decoration:underline;text-underline-offset:3px;">purubhardwaj99@gmail.com</a>.</p>'
      +   '<form id="siteGateForm" autocomplete="off" novalidate>'
      +     '<input id="siteGatePass" type="password" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Password" '
      +       'style="width:100%;padding:16px 18px;font-family:\'Space Mono\',monospace;font-size:15px;letter-spacing:0.08em;background:' + inputBg + ';color:' + text + ';border:1.5px solid ' + border + ';border-radius:10px;outline:none;text-align:center;transition:border-color .2s;">'
      +     '<div id="siteGateErr" style="min-height:20px;margin-top:14px;font-family:\'Space Mono\',monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#E0533C;opacity:0;transition:opacity .2s;">Incorrect password</div>'
      +     '<button type="submit" style="margin-top:18px;width:100%;padding:14px 20px;font-family:\'Space Mono\',monospace;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;background:' + text + ';color:' + bg + ';border:none;border-radius:10px;cursor:pointer;transition:transform .15s ease, opacity .15s ease;">Enter site &rarr;</button>'
      +   '</form>'
      + '</div>';

    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(function () { overlay.style.opacity = "1"; });

    var input = overlay.querySelector("#siteGatePass");
    var errEl = overlay.querySelector("#siteGateErr");
    var form = overlay.querySelector("#siteGateForm");
    var btn = overlay.querySelector("button");

    input.addEventListener("focus", function () { input.style.borderColor = text; });
    input.addEventListener("blur", function () { input.style.borderColor = border; });
    input.addEventListener("input", function () { errEl.style.opacity = "0"; });
    btn.addEventListener("mousedown", function () { btn.style.transform = "scale(0.98)"; });
    btn.addEventListener("mouseup", function () { btn.style.transform = "scale(1)"; });
    btn.addEventListener("mouseleave", function () { btn.style.transform = "scale(1)"; });

    setTimeout(function () { input.focus(); }, 50);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      if (val === PASSWORD) {
        try { localStorage.setItem(STORAGE_KEY, "1"); } catch (err) {}
        overlay.style.opacity = "0";
        setTimeout(function () {
          document.documentElement.classList.remove("is-locked");
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          var s = document.getElementById("siteGateHideStyle");
          if (s && s.parentNode) s.parentNode.removeChild(s);
        }, 350);
      } else {
        errEl.style.opacity = "1";
        input.value = "";
        // Shake animation
        input.style.animation = "none";
        input.offsetHeight; // reflow
        input.style.animation = "siteGateShake 0.4s ease";
        input.focus();
      }
    });

    // Shake keyframes
    var kf = document.createElement("style");
    kf.textContent = "@keyframes siteGateShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}";
    document.head.appendChild(kf);
  }

  // Mount as soon as body is ready
  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
