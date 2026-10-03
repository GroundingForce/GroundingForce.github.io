/* Grounding Force — rollout player and nav highlighting. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Rollout player.

     The four clips are 4-7 MB each, so only the selected one gets a
     src: switching tabs loads that clip on first view and leaves the
     others untouched. Playback follows visibility -- a clip plays
     while it is on screen and pauses when it scrolls away -- so the
     page never decodes video nobody is looking at.
     --------------------------------------------------------------- */

  var player = document.querySelector('[data-player]');

  if (player) {
    var tabs = Array.prototype.slice.call(player.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(player.querySelectorAll('[role="tabpanel"]'));
    var onScreen = false;

    // Honour a reduced-motion preference: load the clip, show the first
    // frame, and let the person press play.
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function videoOf(panel) { return panel.querySelector('video'); }

    function load(video) {
      if (!video.getAttribute('src') && video.dataset.src) {
        video.setAttribute('src', video.dataset.src);
      }
    }

    function play(video) {
      load(video);
      if (still) return;
      var p = video.play();
      // Autoplay can still be refused (data saver, battery saver, iOS low
      // power). The clip is muted and the controls are visible, so the
      // person can start it; nothing else needs to happen.
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }

    function current() {
      var i = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
      return panels[i < 0 ? 0 : i];
    }

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;

        var video = videoOf(panels[i]);
        if (on) {
          if (onScreen) play(video); else load(video);
        } else {
          video.pause();
        }
      });
      if (focus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (event) {
        var step = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }[event.key];
        if (step === undefined) return;
        event.preventDefault();
        var next = step === -Infinity ? 0
                 : step === Infinity ? tabs.length - 1
                 : (i + step + tabs.length) % tabs.length;
        select(next, true);
      });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        // Several crossings can be delivered in one callback; the last entry
        // is the current state, the earlier ones are already history.
        onScreen = entries[entries.length - 1].isIntersecting;
        var video = videoOf(current());
        if (onScreen) play(video); else video.pause();
      }, { threshold: 0.25 }).observe(player);
    } else {
      onScreen = true;
      play(videoOf(current()));
    }
  }

  /* ---------------------------------------------------------------
     Mark the nav link for whichever section is currently in view.
     --------------------------------------------------------------- */

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var targets = links
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if (targets.length && 'IntersectionObserver' in window) {
    var ratios = {};

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });

      var bestId = null;
      var bestRatio = 0;
      Object.keys(ratios).forEach(function (id) {
        if (ratios[id] > bestRatio) {
          bestRatio = ratios[id];
          bestId = id;
        }
      });

      links.forEach(function (a) {
        a.classList.toggle('is-current', bestId !== null && a.getAttribute('href') === '#' + bestId);
      });
    }, { threshold: [0, 0.2, 0.5, 0.9], rootMargin: '-15% 0px -45% 0px' });

    targets.forEach(function (target) { observer.observe(target); });
  }
})();
