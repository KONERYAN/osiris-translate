'use strict';

function $(id) {
  return document.getElementById(id);
}

function normalizeOrigins(text) {
  return text
    .split(/[\n,]+/)
    .map(function (s) { return s.trim(); })
    .filter(Boolean)
    .map(function (s) {
      var u = s.replace(/\/+$/, '');
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      return u;
    });
}

function load() {
  chrome.storage.sync.get(
    { online: false, endpoint: '', customOrigins: [] },
    function (s) {
      $('online').checked = !!s.online;
      $('endpoint').value = s.endpoint || '';
      $('origins').value = (s.customOrigins || []).join('\n');
    }
  );
}

$('save').addEventListener('click', function () {
  var origins = normalizeOrigins($('origins').value);
  var permOrigins = origins.map(function (o) { return o + '/*'; });

  chrome.storage.sync.set(
    {
      online: $('online').checked,
      endpoint: $('endpoint').value.trim(),
      customOrigins: origins
    },
    function () {
      chrome.permissions.request({ origins: permOrigins }, function (granted) {
        $('status').textContent = granted
          ? '已保存。'
          : '已保存，但部分域名权限未授予，那些站点不会翻译。';
      });
    }
  );
});

load();
