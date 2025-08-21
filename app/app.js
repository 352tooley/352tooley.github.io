/* Goals & Gaps Tracker - Store selection bootstrap
   Loads locations from (1) window.DATA_TREE, (2) /app/locations.json, (3) fallback sample.
   Always lands on Store Selection first. */

(function(){
  const el = id => document.getElementById(id);
  const sel = {
    area: el('areaSelect'),
    region: el('regionSelect'),
    district: el('districtSelect'),
    store: el('storeSelect'),
    dort: el('dortBtn'),
    warn: document.getElementById('warn')
  };

  // Helpers
  function fillSelect(select, items, placeholder){
    select.innerHTML = '';
    const opt0 = document.createElement('option');
    opt0.value = ''; opt0.textContent = placeholder;
    select.appendChild(opt0);
    (items||[]).forEach(v => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v;
      select.appendChild(o);
    });
    select.disabled = !items || items.length===0;
  }
  function saveKeys(){ try{
    localStorage.setItem('sel_area', sel.area.value||'');
    localStorage.setItem('sel_region', sel.region.value||'');
    localStorage.setItem('sel_district', sel.district.value||'');
    localStorage.setItem('sel_store', sel.store.value||'');
  }catch(e){} }

  // Data loader chain
  async function loadData(){
    if (window.DATA_TREE && Object.keys(window.DATA_TREE).length){
      return window.DATA_TREE;
    }
    try{
      const res = await fetch('/app/locations.json',{cache:'no-store'});
      if (res.ok){
        const json = await res.json();
        return json;
      } else {
        throw new Error('locations.json not found');
      }
    }catch(e){
      // Fallback minimal data so UI is never empty
      sel.warn.classList.add('show');
      sel.warn.textContent = 'Location data file not found. Using a small fallback list.';
      return {
        "West": {
          "SOUTHWEST": {
            "DFW WEST": ["Cleburne","Weatherford","Stephenville"]
          }
        },
        "South": {
          "GULF COAST": {
            "LOUISIANA WEST": ["Pinhook","Lafayette"]
          }
        }
      };
    }
  }

  let TREE = {};
  function populateAreas(){
    const areas = Object.keys(TREE);
    fillSelect(sel.area, areas, 'Select Area');
    // try restore
    const a = localStorage.getItem('sel_area'); if (a && TREE[a]) { sel.area.value = a; onArea(); }
    const r = localStorage.getItem('sel_region'); if (r && sel.region.querySelector(`[value="${CSS.escape(r)}"]`)){ sel.region.value = r; onRegion(); }
    const d = localStorage.getItem('sel_district'); if (d && sel.district.querySelector(`[value="${CSS.escape(d)}"]`)){ sel.district.value = d; onDistrict(); }
    const s = localStorage.getItem('sel_store'); if (s && sel.store.querySelector(`[value="${CSS.escape(s)}"]`)){ sel.store.value = s; onStore(); }
  }

  function onArea(){
    const a = sel.area.value;
    saveKeys();
    if (!a){ fillSelect(sel.region, [], 'Select Region'); fillSelect(sel.district, [], 'Select District'); fillSelect(sel.store, [], 'Select Store'); sel.dort.disabled = true; return;}
    const regions = Object.keys(TREE[a]||{});
    fillSelect(sel.region, regions, 'Select Region');
    fillSelect(sel.district, [], 'Select District');
    fillSelect(sel.store, [], 'Select Store');
    sel.dort.disabled = true;
  }

  function onRegion(){
    const a = sel.area.value, r = sel.region.value;
    saveKeys();
    if (!a || !r){ fillSelect(sel.district, [], 'Select District'); fillSelect(sel.store, [], 'Select Store'); sel.dort.disabled = true; return;}
    const districts = Object.keys((TREE[a]||{})[r]||{});
    fillSelect(sel.district, districts, 'Select District');
    fillSelect(sel.store, [], 'Select Store');
    sel.dort.disabled = true;
  }

  function onDistrict(){
    const a = sel.area.value, r = sel.region.value, d = sel.district.value;
    saveKeys();
    if (!a || !r || !d){ fillSelect(sel.store, [], 'Select Store'); sel.dort.disabled = true; return;}
    const stores = (((TREE[a]||{})[r]||{})[d]||[]);
    fillSelect(sel.store, stores, 'Select Store');
    sel.dort.disabled = true;
  }

  function onStore(){
    saveKeys();
    sel.dort.disabled = !sel.store.value;
  }

  sel.area.addEventListener('change', onArea);
  sel.region.addEventListener('change', onRegion);
  sel.district.addEventListener('change', onDistrict);
  sel.store.addEventListener('change', onStore);

  sel.dort.addEventListener('click', function(e){
    e.preventDefault();
    if (!sel.store.value) return;
    // Navigate to DORT (keep current behavior/path your app expects)
    // If your DORT screen is /app/index.html?dort or /app/dort.html adjust below:
    const params = new URLSearchParams({
      area: sel.area.value, region: sel.region.value, district: sel.district.value, store: sel.store.value
    });
    window.location.href = '/app/index.html#dort?' + params.toString();
  });

  // init
  loadData().then(tree => { TREE = tree || {}; populateAreas(); });
})();
