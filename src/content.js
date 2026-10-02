// OSIRIS Translate — content script.
// Scans the page for known Dutch UI strings and swaps them for the chosen
// language. Falls back to a self-hosted translation endpoint when enabled.
(function () {
  'use strict';

  var NORM = self.__OSIRIS_NORM__ || {};
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, TEXTAREA: 1, CODE: 1, PRE: 1 };
  var ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
  var INPUT_TYPES = /^(button|submit|reset|text|search|email)$/i;

  var cfg = { language: 'en', enabled: true, online: false, endpoint: '' };
  var onlineCache = {};
  var queue = [];
  var flushTimer = null;
  var walkTimer = null;
  var observer = null;

  function normalize(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  function caseFit(orig, trans) {
    if (!trans) return trans;
    if (!/[A-Za-z]/.test(trans)) return trans; // CJK has no case
    if (orig === orig.toUpperCase() && orig.length > 1) return trans.toUpperCase();
    if (orig.charAt(0) === orig.charAt(0).toUpperCase()) {
      return trans.charAt(0).toUpperCase() + trans.slice(1);
    }
    return trans;
  }

  function lookup(text) {
    var key = normalize(text);
    if (!key) return null;
    var table = NORM[cfg.language];
    return table && table[key] ? table[key] : null;
  }

  function enqueue(full, write) {
    if (!cfg.online || !cfg.endpoint) return;
    var trimmed = (full || '').trim();
    if (trimmed.length < 4) return;
    if (!/[a-z]/i.test(trimmed)) return;
    var pre = full.slice(0, full.length - full.trimStart().length);
    var post = full.slice(full.trimEnd().length);
    queue.push({
      key: normalize(trimmed),
      trimmed: trimmed,
      apply: function (translated) { write(pre + translated + post); }
    });
  }

  function translateTextNode(node) {
    var full = node.nodeValue;
    if (!full || !full.trim()) return;
    var hit = lookup(full);
    if (hit) {
      node.nodeValue = caseFit(full, hit);
      return;
    }
    enqueue(full, function (v) { node.nodeValue = v; });
  }

  function translateElement(el) {
    if (el.tagName === 'INPUT' && INPUT_TYPES.test(el.type) && el.value) {
      var hit = lookup(el.value);
      if (hit) {
        el.value = caseFit(el.value, hit);
      } else {
        enqueue(el.value, function (v) { el.value = v; });
      }
    }
    for (var i = 0; i < ATTRS.length; i++) {
      if (!el.hasAttribute(ATTRS[i])) continue;
      var cur = el.getAttribute(ATTRS[i]);
      var h = lookup(cur);
      if (h) el.setAttribute(ATTRS[i], caseFit(cur, h));
    }
  }

  function accept(node) {
    if (node.nodeType === 3) {
      var p = node.parentElement;
      if (!p || SKIP[p.tagName] || p.tagName === 'INPUT' || p.tagName === 'TEXTAREA') {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
    if (node.nodeType === 1) {
      if (SKIP[node.tagName]) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
    return NodeFilter.FILTER_REJECT;
  }

  function walk(root) {
    if (!root) return;
    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      { acceptNode: accept }
    );
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].nodeType === 3) translateTextNode(nodes[i]);
      else translateElement(nodes[i]);
    }
    scheduleFlush();
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flush();
    }, 200);
  }

  function sendTranslate(texts) {
    return new Promise(function (resolve) {
      var done = false;
      function finish(result) {
        if (done) return;
        done = true;
        resolve(result || texts.map(function () { return null; }));
      }
      try {
        chrome.runtime.sendMessage(
          { type: 'translate', texts: texts, target: cfg.language, endpoint: cfg.endpoint },
          function (resp) {
            if (chrome.runtime.lastError) return finish(null);
            if (resp && resp.ok && Array.isArray(resp.result)) finish(resp.result);
            else finish(null);
          }
        );
      } catch (e) {
        finish(null);
      }
    });
  }

  function flush() {
    if (!queue.length) return;
    var batch = queue;
    queue = [];
    var byKey = {};
    var pending = [];
    var seen = {};

    batch.forEach(function (item) {
      if (onlineCache[item.key]) {
        item.apply(onlineCache[item.key]);
      } else if (seen[item.trimmed]) {
      } else {
        seen[item.trimmed] = true;
        pending.push(item.trimmed);
        (byKey[item.key] = byKey[item.key] || []).push(item);
      }
    });

    if (!pending.length) return;

    sendTranslate(pending).then(function (results) {
      pending.forEach(function (t, i) {
        var key = normalize(t);
        var tr = results[i];
        if (!tr) return;
        onlineCache[key] = tr;
        (byKey[key] || []).forEach(function (item) { item.apply(tr); });
      });
    });
  }

  function scheduleWalk() {
    if (walkTimer) return;
    walkTimer = setTimeout(function () {
      walkTimer = null;
      walk(document.body);
    }, 150);
  }

  function observe() {
    if (observer) return;
    observer = new MutationObserver(function () {
      if (cfg.enabled) scheduleWalk();
    });
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }

  function start() {
    walk(document.body);
    observe();
  }

  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg && msg.type === 'rescan') {
      onlineCache = {};
      walk(document.body);
    }
  });

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== 'sync') return;
    if (changes.language) {
      cfg.language = changes.language.newValue;
      onlineCache = {};
      if (cfg.enabled) walk(document.body);
    }
    if (changes.enabled) {
      cfg.enabled = changes.enabled.newValue;
      if (cfg.enabled) walk(document.body);
    }
    if (changes.online) cfg.online = changes.online.newValue;
    if (changes.endpoint) {
      cfg.endpoint = changes.endpoint.newValue;
      onlineCache = {};
    }
  });

  chrome.storage.sync.get(
    { language: 'en', enabled: true, online: false, endpoint: '' },
    function (settings) {
      cfg = settings || cfg;
      if (cfg.enabled) start();
    }
  );
})();
