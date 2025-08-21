
(function () {
  'use strict';

  // Elements
  var areaSel     = document.getElementById('areaSelect');
  var regionSel   = document.getElementById('regionSelect');
  var districtSel = document.getElementById('districtSelect');
  var storeSel    = document.getElementById('storeSelect');
  var goBtn       = document.getElementById('goBtn');

  if (!areaSel || !regionSel || !districtSel || !storeSel) {
    console.warn('[app] dropdown elements not found on this page.');
    window.__APP_READY__ = true;
    return;
  }

  // Helpers
  function setDisabled(el, on) { el.disabled = !!on; el.style.opacity = on ? 0.85 : 1; }
  function fill(el, arr, placeholder) {
    el.innerHTML = '';
    var opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = placeholder;
    el.appendChild(opt0);
    (arr || []).forEach(function (v) {
      var o = document.createElement('option');
      o.value = v;
      o.textContent = v;
      el.appendChild(o);
    });
  }
  function save() {
    localStorage.setItem('sel_area', areaSel.value || '');
    localStorage.setItem('sel_region', regionSel.value || '');
    localStorage.setItem('sel_district', districtSel.value || '');
    localStorage.setItem('sel_store', storeSel.value || '');
  }
  function restore() {
    return {
      a: localStorage.getItem('sel_area') || '',
      r: localStorage.getItem('sel_region') || '',
      d: localStorage.getItem('sel_district') || '',
      s: localStorage.getItem('sel_store') || ''
    };
  }

  // Data (loaded from JSON)
  var TREE = null;

  // Flexible getters in case the JSON has unexpected casing or extra nesting
  function keys(obj) { return obj ? Object.keys(obj) : []; }
  function getAreaNames() { return keys(TREE); }
  function getRegionNames(area) { return keys(TREE && TREE[area]); }
  function getDistrictNames(area, region) { return keys(TREE && TREE[area] && TREE[area][region]); }
  function getStores(area, region, district) {
    var v = TREE && TREE[area] && TREE[area][region] && TREE[area][region][district];
    if (Array.isArray(v)) return v;
    // If not an array but an object, return its keys
    if (v && typeof v === 'object') return Object.keys(v);
    return [];
  }

  // Change handlers
  function onArea() {
    var a = areaSel.value;
    save();
    if (!a) {
      fill(regionSel, [], 'Select Region'); setDisabled(regionSel, true);
      fill(districtSel, [], 'Select District'); setDisabled(districtSel, true);
      fill(storeSel, [], 'Select Store'); setDisabled(storeSel, true);
      updateGoBtn();
      return;
    }
    var regions = getRegionNames(a);
    fill(regionSel, regions, 'Select Region'); setDisabled(regionSel, regions.length === 0);
    fill(districtSel, [], 'Select District'); setDisabled(districtSel, true);
    fill(storeSel, [], 'Select Store'); setDisabled(storeSel, true);
    localStorage.removeItem('sel_region'); localStorage.removeItem('sel_district'); localStorage.removeItem('sel_store');
    updateGoBtn();
  }

  function onRegion() {
    var a = areaSel.value, r = regionSel.value;
    save();
    if (!a || !r) {
      fill(districtSel, [], 'Select District'); setDisabled(districtSel, true);
      fill(storeSel, [], 'Select Store'); setDisabled(storeSel, true);
      updateGoBtn();
      return;
    }
    var districts = getDistrictNames(a, r);
    fill(districtSel, districts, 'Select District'); setDisabled(districtSel, districts.length === 0);
    fill(storeSel, [], 'Select Store'); setDisabled(storeSel, true);
    localStorage.removeItem('sel_district'); localStorage.removeItem('sel_store');
    updateGoBtn();
  }

  function onDistrict() {
    var a = areaSel.value, r = regionSel.value, d = districtSel.value;
    save();
    if (!a || !r || !d) {
      fill(storeSel, [], 'Select Store'); setDisabled(storeSel, true);
      updateGoBtn();
      return;
    }
    var stores = getStores(a, r, d);
    fill(storeSel, stores, 'Select Store'); setDisabled(storeSel, stores.length === 0);
    localStorage.removeItem('sel_store');
    updateGoBtn();
  }

  function onStore() {
    save();
    updateGoBtn();
  }

  function updateGoBtn() {
    var enabled = !!storeSel.value;
    if (goBtn) goBtn.disabled = !enabled;
  }

  // Wire listeners
  areaSel.addEventListener('change', onArea);
  regionSel.addEventListener('change', onRegion);
  districtSel.addEventListener('change', onDistrict);
  storeSel.addEventListener('change', onStore);

  // Fetch JSON with multiple fallbacks
  function fetchJSON(url) {
    var bust = (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + Date.now();
    return fetch(url + bust, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function loadLocations() {
    var tried = [];
    function tryNext() {
      var next =
        tried.length === 0 ? 'locations.json' :
        tried.length === 1 ? '/locations.json' :
        tried.length === 2 ? '/app/locations.json' : null;

      if (!next) throw new Error('All location paths failed');

      tried.push(next);
      return fetchJSON(next).then(function (data) {
        return data;
      }).catch(function () {
        return tryNext();
      });
    }
    return tryNext();
  }

  function initUI() {
    // Initial placeholders
    fill(areaSel, [], 'Select Area');
    fill(regionSel, [], 'Select Region'); setDisabled(regionSel, true);
    fill(districtSel, [], 'Select District'); setDisabled(districtSel, true);
    fill(storeSel, [], 'Select Store'); setDisabled(storeSel, true);
    updateGoBtn();

    // Load data
    loadLocations().then(function (data) {
      TREE = data;

      // Populate areas
      var areas = getAreaNames();
      fill(areaSel, areas, 'Select Area');
      setDisabled(areaSel, areas.length === 0);

      // Restore selections in order
      var sel = restore();
      if (sel.a && TREE[sel.a]) {
        areaSel.value = sel.a;
        onArea();
        if (sel.r && TREE[sel.a] && TREE[sel.a][sel.r]) {
          regionSel.value = sel.r;
          onRegion();
          if (sel.d && TREE[sel.a][sel.r] && TREE[sel.a][sel.r][sel.d]) {
            districtSel.value = sel.d;
            onDistrict();
            if (sel.s) {
              // check if store exists
              var exists = Array.prototype.some.call(storeSel.options, function (o) { return o.value === sel.s; });
              if (exists) storeSel.value = sel.s;
            }
          }
        }
      }
      updateGoBtn();
    }).catch(function (e) {
      console.error('[app] Failed to load locations.json from all paths:', e);
      // Leave the placeholders so the UI isn't broken.
    }).finally(function () {
      window.__APP_READY__ = true;
    });
  }

  // DORT button behavior (let existing app handle routing later)
  if (goBtn) {
    goBtn.addEventListener('click', function () {
      // Keep as no-op for SPA; enable for visual feedback
      // If you want a simple hash navigation, uncomment:
      // location.hash = '#dort';
    });
  }

  // Boot
  initUI();
})();
