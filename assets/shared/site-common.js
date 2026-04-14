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
      sun.style.display = "";
    } else {
      moon.style.display = "";
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

  document.addEventListener("DOMContentLoaded", function () {
    injectShell().then(function () {
      applyBrandHref();
      applyNavState();
      initThemeToggle();
      initFloatingSideNav();
    });
  });
})();
