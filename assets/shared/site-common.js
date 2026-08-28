(function () {
  window.__USE_SHARED_THEME__ = true;
  window.__USE_SHARED_FLOATING_NAV__ = true;
  function getConfig() {
    return window.PORTFOLIO_CONFIG || {};
  }

  function setTheme(theme, toggle) {
    document.documentElement.setAttribute("data-theme", theme);
    if (!toggle) return;
    var moon = toggle.querySelector(".icon-moon");
    var sun = toggle.querySelector(".icon-sun");
    if (!moon || !sun) return;
    if (theme === "dark") {
      moon.style.display = "none";
      sun.style.display = "block";
    } else {
      moon.style.display = "block";
      sun.style.display = "none";
    }
  }

  function initThemeToggle() {
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    var saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved, toggle);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark", toggle);
    } else {
      setTheme("light", toggle);
    }

    toggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      setTheme(next, toggle);
    });
  }

  function inferSections() {
    var inferred = [];
    var rows = Array.from(document.querySelectorAll('[id^="s-"]'));
    rows.forEach(function (section) {
      var label = "";
      var labelEl = section.querySelector(".cs-row-tag");
      if (labelEl) {
        label = labelEl.textContent.trim();
      } else {
        var heading = section.querySelector("h2, h3");
        label = heading ? heading.textContent.trim() : section.id.replace("s-", "");
      }
      inferred.push({ id: section.id, label: label });
    });
    return inferred;
  }

  function createFloatingNav(sections) {
    if (!sections.length) return null;
    var nav = document.createElement("nav");
    nav.className = "cs-sidenav";
    nav.id = "csSidenav";
    nav.setAttribute("aria-label", "Section navigation");
    var ul = document.createElement("ul");
    sections.forEach(function (s) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "csn-link";
      a.href = "#" + s.id;
      a.setAttribute("data-s", s.id);
      a.innerHTML = '<span class="csn-dot"></span><span>' + s.label + "</span>";
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);
    return nav;
  }

  function initFloatingSideNav() {
    var config = getConfig();
    var sections = Array.isArray(config.floatingSections) && config.floatingSections.length
      ? config.floatingSections
      : inferSections();

    if (!sections.length) return;

    var sidenav = document.getElementById("csSidenav");
    if (!sidenav) {
      sidenav = createFloatingNav(sections);
      if (!sidenav) return;
      var mount = document.getElementById("siteShellMount");
      if (mount && mount.parentNode) {
        mount.parentNode.insertBefore(sidenav, mount.nextSibling);
      } else {
        document.body.insertBefore(sidenav, document.body.firstChild);
      }
    }

    var links = Array.from(sidenav.querySelectorAll(".csn-link"));
    var sectionEls = links
      .map(function (l) {
        return document.getElementById(l.getAttribute("data-s"));
      })
      .filter(Boolean);
    if (!sectionEls.length) return;

    var anchorId = config.heroAnchorId || "cs-top";
    var hero = document.getElementById(anchorId) || sectionEls[0];
    var heroBottom = 0;
    function updateHeroBottom() {
      heroBottom = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 250;
    }
    updateHeroBottom();

    var current = "";
    function onScroll() {
      if (window.scrollY > heroBottom - 120) {
        sidenav.classList.add("is-visible");
      } else {
        sidenav.classList.remove("is-visible");
      }

      var scrollMid = window.scrollY + window.innerHeight * 0.42;
      var active = sectionEls[0];
      sectionEls.forEach(function (s) {
        if (s.offsetTop <= scrollMid) active = s;
      });
      var id = active ? active.id : "";
      if (id !== current) {
        current = id;
        links.forEach(function (l) {
          l.classList.toggle("active", l.getAttribute("data-s") === id);
        });
      }
    }

    window.addEventListener("resize", updateHeroBottom);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function applyNavState() {
    var config = getConfig();
    var navActive = config.navActive;
    if (!navActive) return;
    var activeLink = document.querySelector('.nav-link[data-nav-key="' + navActive + '"]');
    if (activeLink) activeLink.classList.add("active");
  }

  function applyBrandHref() {
    var config = getConfig();
    var brand = document.querySelector("[data-shell-brand]");
    if (!brand) return;
    if (config.brandHref) {
      brand.setAttribute("href", config.brandHref);
    }
  }

  function injectShell() {
    var mount = document.getElementById("siteShellMount");
    if (!mount) return Promise.resolve();

    return fetch("assets/shared/site-shell.html")
      .then(function (response) {
        if (!response.ok) throw new Error("Shell load failed");
        return response.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
      })
      .catch(function () {
        mount.innerHTML = "";
      });
  }

  function initScrollProgress() {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;
    function update() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectShell().then(function () {
      applyBrandHref();
      applyNavState();


  // ── Skills modal ──────────────────────────────────────────────
  function initInfoModal() {
    var modal = document.getElementById('csInfoModal');
    var openBtn = document.getElementById('csInfoOpen');
    var closeBtn = document.getElementById('csInfoClose');
    if (!modal || !openBtn || !closeBtn) return;
    var lastFocus = null;

    function onKey(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function open() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      requestAnimationFrame(function () { modal.classList.add('open'); });
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
      document.addEventListener('keydown', onKey);
    }
    function close() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      setTimeout(function () { modal.hidden = true; }, 260);
      if (lastFocus) lastFocus.focus();
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) close();
    });
  }

      initThemeToggle();
      initFloatingSideNav();
      initScrollProgress();
      initInfoModal();
      initAskLLM();
    });
  });

  // ── Text-selection pill that opens the Chatbase widget with the
  //    selected text pre-sent. Falls back to clipboard + toast if
  //    Chatbase's programmatic sendMessage isn't reachable. ──
  function initAskLLM() {
    // Bail on touch — mobile has its own selection UI.
    if (matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    var MIN_LEN = 6;

    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'ask-llm-pill';
    pill.setAttribute('aria-label', "Ask Puru's LLM about the selected text");
    pill.innerHTML =
      '<svg class="ask-llm-pill__icon" viewBox="0 0 12 12" aria-hidden="true">' +
        '<path d="M6 0L7.4 4.6 12 6 7.4 7.4 6 12 4.6 7.4 0 6 4.6 4.6z"/>' +
      '</svg>' +
      "<span>Ask Puru's LLM</span>";
    document.body.appendChild(pill);

    var toast = document.createElement('div');
    toast.className = 'ask-llm-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    var toastTimer;

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove('is-visible');
      }, 4200);
    }

    function inEditable(node) {
      while (node && node !== document.body) {
        if (node.nodeType === 1) {
          var tag = node.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
          if (node.isContentEditable) return true;
          if (node.classList && (node.classList.contains('ask-llm-pill') ||
                                 node.classList.contains('ask-llm-toast'))) {
            return true;
          }
        }
        node = node.parentNode;
      }
      return false;
    }

    function hide() { pill.classList.remove('is-visible'); }

    function updateForSelection() {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed) return hide();
      var text = sel.toString().trim();
      if (text.length < MIN_LEN) return hide();

      var range = sel.getRangeAt(0);
      // If the selection lives inside an editable field or inside
      // the pill itself, don't offer to send it.
      if (inEditable(range.commonAncestorContainer)) return hide();

      var rect = range.getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) return hide();

      var margin = 12;
      var cx = rect.left + rect.width / 2 + window.scrollX;
      var cy = rect.top + window.scrollY - 44;
      // If there isn't room above, drop the pill below the selection.
      if (rect.top < 56) cy = rect.bottom + window.scrollY + margin;

      // Clamp horizontally so the pill never runs off-screen.
      var half = 90;
      cx = Math.max(half + 8 + window.scrollX,
             Math.min(cx, window.scrollX + window.innerWidth - half - 8));

      pill.style.left = cx + 'px';
      pill.style.top  = cy + 'px';
      pill.classList.add('is-visible');
    }

    // 'selectionchange' fires more often than we need, so debounce
    // through requestAnimationFrame.
    var raf = null;
    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        updateForSelection();
      });
    }

    document.addEventListener('selectionchange', schedule);
    document.addEventListener('mouseup', schedule);
    window.addEventListener('scroll', function () {
      if (pill.classList.contains('is-visible')) updateForSelection();
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (pill.classList.contains('is-visible')) updateForSelection();
    });

    // Preserve the selection when the pill is pressed — otherwise
    // mousedown on the button would clear it.
    pill.addEventListener('mousedown', function (e) { e.preventDefault(); });

    pill.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var text = (window.getSelection() || '').toString().trim();
      if (!text) return;
      hide();

      // Reliable path: copy first (guaranteed), then open the chat.
      // Every Chatbase release accepts a pasted message, and only
      // some accept a programmatic send — so we lean on paste as
      // the primary UX and treat send as a nice-to-have.
      copyToClipboard(text);

      // Open the widget.
      try { if (typeof window.chatbase === 'function') window.chatbase('open'); } catch (_) {}

      // Nice-to-have: try every known Chatbase send payload shape
      // in parallel. Any that lands will win; failures are silent.
      setTimeout(function () { attemptDirectSend(text); }, 320);
      setTimeout(function () { attemptDirectSend(text); }, 900);

      // Toast the user with the reliable instruction — cmd on
      // Mac-shaped user agents, ctrl elsewhere.
      var mod = /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘' : 'Ctrl';
      showToast('Copied — press ' + mod + ' V in the chat, then Enter');
    });

    function attemptDirectSend(text) {
      // Try every Chatbase command-bus shape shipped across releases.
      try { window.chatbase('sendMessage', text); } catch (_) {}
      try { window.chatbase({ type: 'sendMessage', message: text }); } catch (_) {}
      try { window.chatbase('setPrefilledMessage', text); } catch (_) {}
      try { window.chatbase.sendMessage && window.chatbase.sendMessage(text); } catch (_) {}

      // Also try postMessage into the Chatbase iframe directly
      // using the message shapes their widget code has accepted.
      try {
        var frames = document.querySelectorAll('iframe[src*="chatbase.co"], iframe[src*="chatbase.com"]');
        for (var i = 0; i < frames.length; i++) {
          var w = frames[i].contentWindow;
          if (!w) continue;
          [
            { action: 'chatbase-send-message', message: text },
            { type:   'chatbase.sendMessage', message: text },
            { type:   'sendMessage',          message: text },
            { type:   'setInputValue',        value:   text },
            { type:   'prefilledMessage',     value:   text }
          ].forEach(function (payload) {
            try { w.postMessage(payload, '*'); } catch (_) {}
          });
        }
      } catch (_) {}
    }

    function copyToClipboard(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
          return true;
        }
      } catch (_) {}
      // Legacy fallback for Safari/older browsers.
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px;top:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch (_) { return false; }
    }
  }
})();
