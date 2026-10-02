'use strict';

function $(id) {
  return document.getElementById(id);
}

function load() {
  chrome.storage.sync.get({ language: 'en', enabled: true }, function (s) {
    $('enabled').checked = !!s.enabled;
    $('language').value = s.language;
  });
}

$('enabled').addEventListener('change', function (e) {
  chrome.storage.sync.set({ enabled: e.target.checked });
});

$('language').addEventListener('change', function (e) {
  chrome.storage.sync.set({ language: e.target.value });
});

$('rescan').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: 'rescan' }, function () {});
  });
});

$('options').addEventListener('click', function () {
  chrome.runtime.openOptionsPage();
});

load();
