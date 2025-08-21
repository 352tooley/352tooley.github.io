
(function () {
  'use strict';

  // Grab elements
  var areaSel     = document.getElementById('areaSelect');
  var regionSel   = document.getElementById('regionSelect');
  var districtSel = document.getElementById('districtSelect');
  var storeSel    = document.getElementById('storeSelect');
  var goBtn       = document.getElementById('goBtn');

  function elMissing() {
    return !(areaSel && regionSel && districtSel && storeSel && goBtn);
  }

  if (elMissing()) {
    console.warn('[app] Selection UI elements not found on this page.');
    window.__APP_READY__ = true;
    return;
  }

  // ---------- Helpers ----------
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
  function uniqSort(arr) {
    var seen = Object.create(null);
    var out = [];
    (arr || []).forEach(function(x){
      var k = String(x || '').trim();
      if (!k) return;
      if (k.toLowerCase() === 'nan') return;
      if (!seen[k]) { seen[k] = true; out.push(k); }
    });
    out.sort(function(a,b){ return a.localeCompare(b); });
    return out;
  }

  // ---------- Sanitize locations.json structure ----------
  var DROP_KEYS = { 'total':1, 'no filters applied':1, 'nan':1 };
  function isDropKey(k) { return !!DROP_KEYS[String(k||'').toLowerCase()]; }

  function sanitizeNode(node) {
    if (Array.isArray(node)) {
      return uniqSort(node);
    }
    if (node && typeof node === 'object') {
      var clean = {};
      Object.keys(node).forEach(function(key){
        if (isDropKey(key)) return;
        var child = sanitizeNode(node[key]);
        // drop empties
        var keep = false;
        if (Array.isArray(child)) keep = child.length > 0;
        else if (child && typeof child === 'object') keep = Object.keys(child).length > 0;
        else keep = !!child;
        if (keep) clean[key] = child;
      });
      return clean;
    }
    // primitives: drop 'nan' or falsy
    if (!node) return null;
    var s = String(node).trim();
    if (!s || s.toLowerCase() === 'nan') return null;
    return s;
  }

  // ---------- Data accessors ----------
  var TREE = null;
  function keys(obj) { return obj ? Object.keys(obj) : []; }
  function getAreaNames() { return uniqSort(keys(TREE)); }
  function getRegionNames(area) { return uniqSort(keys(TREE && TREE[area])); }
  function getDistrictNames(area, region) { return uniqSort(keys(TREE && TREE[area] && TREE[area][region])); }
  function getStores(area, region, district) {
    var v = TREE && TREE[area] && TREE[area][region] && TREE[area][region][district];
    if (Array.isArray(v)) return uniqSort(v);
    if (v && typeof v === 'object') return uniqSort(Object.keys(v));
    return [];
  }

  // ---------- Change handlers ----------
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
    if (!regions.length) console.warn('[app] No regions under area:', a);
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
    if (!districts.length) console.warn('[app] No districts under', a, '→', r);
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
    if (!stores.length) console.warn('[app] No stores under', a, '→', r, '→', d);
    fill(storeSel, stores, 'Select Store'); setDisabled(storeSel, stores.length === 0);
    localStorage.removeItem('sel_store');
    updateGoBtn();
  }

  function onStore() { save(); updateGoBtn(); }

  function updateGoBtn() {
    var enabled = !!storeSel.value;
    if (goBtn) goBtn.disabled = !enabled;
  }

  areaSel.addEventListener('change', onArea);
  regionSel.addEventListener('change', onRegion);
  districtSel.addEventListener('change', onDistrict);
  storeSel.addEventListener('change', onStore);

  // ---------- Load JSON with fallbacks + cache-bust ----------
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

      return fetchJSON(next).then(function (raw) {
        var clean = sanitizeNode(raw) || {};
        console.log('[app] Loaded locations from', next, 'Areas:', Object.keys(clean).length);
        return clean;
      }).catch(function (e) {
        console.warn('[app] Failed loading', next, e);
        return tryNext();
      });
    }
    return tryNext();
  }

  // ---------- Initialize ----------
  function initUI() {
    fill(areaSel, [], 'Select Area');
    fill(regionSel, [], 'Select Region'); setDisabled(regionSel, true);
    fill(districtSel, [], 'Select District'); setDisabled(districtSel, true);
    fill(storeSel, [], 'Select Store'); setDisabled(storeSel, true);
    updateGoBtn();

    loadLocations().then(function (tree) {
      TREE = tree;

      var areas = getAreaNames();
      fill(areaSel, areas, 'Select Area');
      setDisabled(areaSel, areas.length === 0);
      if (!areas.length) console.warn('[app] No areas found in locations.json after sanitize.');

      // Restore chain if possible
      var sel = restore();
      if (sel.a && TREE[sel.a]) {
        areaSel.value = sel.a; onArea();
        if (sel.r && TREE[sel.a] && TREE[sel.a][sel.r]) {
          regionSel.value = sel.r; onRegion();
          if (sel.d && TREE[sel.a][sel.r] && TREE[sel.a][sel.r][sel.d]) {
            districtSel.value = sel.d; onDistrict();
            if (sel.s) {
              var exists = Array.prototype.some.call(storeSel.options, function (o) { return o.value === sel.s; });
              if (exists) storeSel.value = sel.s;
            }
          }
        }
      }
      updateGoBtn();
    }).catch(function (e) {
      console.error('[app] locations.json failed completely:', e);
    }).finally(function () {
      window.__APP_READY__ = true;
    });
  }

  // ---------- DORT navigation ----------
  if (goBtn) {
    goBtn.addEventListener('click', function () {
      // Save explicitly before navigation
      save();
      // If we're already under /app/, use hash to proceed (your SPA router)
      var path = (location.pathname || '');
      if (path.indexOf('/app') === 0 || path.endsWith('/app/')) {
        location.hash = '#dort';
      } else {
        // Otherwise go to /app/ which hosts the rest of the screens
        var target = '/app/?v=' + Date.now() + '#dort';
        location.assign(target);
      }
    });
  }

  initUI();
})();
