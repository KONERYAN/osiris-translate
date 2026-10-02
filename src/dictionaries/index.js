// Builds a normalised lookup table from the per-language dictionaries.
// Diacritics and case are stripped so "Cursus" matches "cursus" and
// "Tentamens" matches "tentamen" once normalised by the content script.
(function () {
  'use strict';

  function normalize(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  const raw = self.__OSIRIS_DICTS__ || {};
  const norm = {};

  Object.keys(raw).forEach(function (lang) {
    const table = {};
    const dict = raw[lang];
    Object.keys(dict).forEach(function (key) {
      table[normalize(key)] = dict[key];
    });
    norm[lang] = table;
  });

  self.__OSIRIS_NORM__ = norm;
})();
