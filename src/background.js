// Background service worker.
// - Relays online translation requests to a user-provided endpoint
//   (LibreTranslate-compatible: POST {q, source, target, format}).
// - Injects the content script on user-added OSIRIS domains.
(function () {
  'use strict';

  function translate(texts, target, endpoint) {
    if (!endpoint) return Promise.reject(new Error('no endpoint configured'));
    var targetCode = { en: 'en', zh: 'zh', nl: 'nl' }[target] || 'en';
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, source: 'nl', target: targetCode, format: 'text' })
    }).then(function (resp) {
      if (!resp.ok) throw new Error('translation request failed: ' + resp.status);
      return resp.json();
    }).then(function (data) {
      if (Array.isArray(data)) return data.map(function (d) { return d.translatedText; });
      return [data.translatedText];
    });
  }

  function originMatches(origin, url) {
    if (!url) return false;
    if (url.indexOf(origin) !== 0) return false;
    var c = url.charAt(origin.length);
    return c === '' || c === '/' || c === '?';
  }

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg || msg.type !== 'translate') return;
    translate(msg.texts, msg.target, msg.endpoint)
      .then(function (result) { sendResponse({ ok: true, result: result }); })
      .catch(function (err) { sendResponse({ ok: false, error: String(err) }); });
    return true; // keep the message channel open for the async response
  });

  chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    if (info.status !== 'complete') return;
    chrome.storage.sync.get({ customOrigins: [] }, function (c) {
      var origins = c.customOrigins || [];
      if (!origins.some(function (o) { return originMatches(o, tab.url); })) return;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [
          'src/dictionaries/en.js',
          'src/dictionaries/zh.js',
          'src/dictionaries/index.js',
          'src/content.js'
        ]
      }).catch(function () { /* tab may not be ready */ });
    });
  });
})();
