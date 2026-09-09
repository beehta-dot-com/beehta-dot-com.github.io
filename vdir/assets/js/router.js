/* ============================================================
   ROUTER.JS
   beehta.com

   Every page on this site is a real, complete HTML file. Open one
   directly and it works with JavaScript switched off.

   When JavaScript is running, this intercepts clicks on internal
   links, fetches the target page, and swaps only what is inside
   <main>. The header, the footer and the tile field are never
   touched, so the background arrangement and the scroll position
   of the header survive navigation.

   Page specific setup is registered on window.beehtaPages, keyed
   by the data-page attribute on <main>. The router calls the
   matching entry after every swap, and once on first load.
============================================================ */

window.beehtaPages = window.beehtaPages || {};

(function () {
  "use strict";

  var main = document.getElementById("main");
  if (!main) return;

  var cache = new Map();
  var current = location.pathname;

  /* ---------- page hooks ---------- */

  var teardown = null;

  function startPage() {
    var name = main.dataset.page;
    var init = window.beehtaPages[name];
    // A page hook may return a function to undo itself. Anything
    // holding a timer or a window listener should use it.
    teardown = (typeof init === "function") ? init(main) : null;
    markNav();
  }

  function stopPage() {
    if (typeof teardown === "function") teardown();
    teardown = null;
  }

  function markNav() {
    var here = location.pathname.replace(/\/index\.html$/, "/");
    var links = document.querySelectorAll(".site-nav a");
    for (var i = 0; i < links.length; i++) {
      var target = new URL(links[i].getAttribute("href"), location.href)
        .pathname.replace(/\/index\.html$/, "/");
      if (target === here) links[i].setAttribute("aria-current", "page");
      else links[i].removeAttribute("aria-current");
    }
  }

  /* ---------- fetching ---------- */

  function load(url) {
    if (cache.has(url)) return Promise.resolve(cache.get(url));

    return fetch(url, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var incoming = doc.getElementById("main");
        if (!incoming) throw new Error("no main element");

        var page = {
          title: doc.title,
          description: metaOf(doc, "description"),
          name: incoming.dataset.page || "",
          html: incoming.innerHTML
        };
        cache.set(url, page);
        return page;
      });
  }

  function metaOf(doc, name) {
    var tag = doc.querySelector('meta[name="' + name + '"]');
    return tag ? tag.getAttribute("content") : "";
  }

  /* ---------- swapping ---------- */

  function swap(url, hash, push) {
    return load(url).then(function (page) {
      stopPage();

      main.classList.add("is-leaving");

      return new Promise(function (done) {
        // Just long enough to cover the repaint. Reduced motion
        // collapses the transition, so this is the only wait.
        setTimeout(function () {
          main.innerHTML = page.html;
          main.dataset.page = page.name;

          document.title = page.title;
          var desc = document.querySelector('meta[name="description"]');
          if (desc && page.description) desc.setAttribute("content", page.description);

          if (push) history.pushState({}, "", url + hash);
          current = location.pathname;

          startPage();
          main.classList.remove("is-leaving");

          if (hash) {
            var anchor = document.getElementById(hash.slice(1));
            if (anchor) anchor.scrollIntoView();
            else window.scrollTo(0, 0);
          } else {
            window.scrollTo(0, 0);
          }

          // Send the reader, and a screen reader, to the top of
          // the new content rather than leaving focus on a link
          // that no longer exists.
          var heading = main.querySelector("h1");
          if (heading) {
            heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: true });
          }

          done();
        }, 120);
      });
    }).catch(function () {
      // Offline, a bad path, or the page opened over file:// where
      // fetch is blocked. Let the browser do it the ordinary way.
      location.href = url + hash;
    });
  }

  /* ---------- link handling ---------- */

  function handled(link, e) {
    if (e.defaultPrevented) return false;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (link.target && link.target !== "_self") return false;
    if (link.hasAttribute("download")) return false;
    if (link.dataset.noRouter !== undefined) return false;

    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return false;          // in-page anchor
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^https?:/i.test(href)) return false;  // mailto:, tel:

    var url = new URL(href, location.href);
    if (url.origin !== location.origin) return false;
    if (!/\.html$|\/$/.test(url.pathname)) return false;        // an asset, not a page

    return url;
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link) return;

    var url = handled(link, e);
    if (!url) return;

    e.preventDefault();

    // Same page, different anchor: no need to fetch anything.
    if (url.pathname === location.pathname) {
      if (url.hash) {
        var anchor = document.getElementById(url.hash.slice(1));
        if (anchor) {
          history.pushState({}, "", url.pathname + url.hash);
          anchor.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    swap(url.pathname + url.search, url.hash, true);
  });

  window.addEventListener("popstate", function () {
    if (location.pathname === current) return;   // hash-only change
    swap(location.pathname + location.search, location.hash, false);
  });

  startPage();
})();
