(function () {
  const SAMPLE_TREE = {
    "West": {
      "SOUTHWEST": {
        "DFW WEST": ["Chisholm Trail", "Clifford", "Weatherford", "Granbury", "Cleburne"],
        "DFW NORTH": ["Richardson TX", "Dallas Pkwy", "Stonebrook"],
        "UTAH/CO": ["Draper", "Lehi", "Layton"]
      }
    }
  };
  const TREE = (typeof window.DATA_TREE === "object" && window.DATA_TREE) ? window.DATA_TREE : SAMPLE_TREE;

  const areaSel    = document.getElementById('areaSelect');
  const regionSel  = document.getElementById('regionSelect');
  const districtSel= document.getElementById('districtSelect');
  const storeSel   = document.getElementById('storeSelect');
  const goBtn      = document.getElementById('goDORT');

  function populate(sel, options) {
    sel.innerHTML = '';
    const def = document.createElement('option');
    def.value = ''; def.textContent = 'Select ' + sel.getAttribute('aria-label').split(' ')[1];
    sel.appendChild(def);
    options.forEach(v => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v; sel.appendChild(o);
    });
    sel.disabled = false;
  }

  areaSel.addEventListener('change', () => {
    const area = areaSel.value;
    if (!area) return;
    populate(regionSel, Object.keys(TREE[area] || {}));
    districtSel.disabled = storeSel.disabled = true;
    goBtn.disabled = true;
  });

  regionSel.addEventListener('change', () => {
    const area = areaSel.value, region = regionSel.value;
    if (!area || !region) return;
    populate(districtSel, Object.keys(TREE[area][region] || {}));
    storeSel.disabled = true; goBtn.disabled = true;
  });

  districtSel.addEventListener('change', () => {
    const area = areaSel.value, region = regionSel.value, dist = districtSel.value;
    if (!area || !region || !dist) return;
    populate(storeSel, TREE[area][region][dist] || []);
    goBtn.disabled = true;
  });

  storeSel.addEventListener('change', () => {
    goBtn.disabled = !storeSel.value;
  });

  goBtn.addEventListener('click', () => {
    if (!areaSel.value || !regionSel.value || !districtSel.value || !storeSel.value) return;
    localStorage.setItem('selectedArea', areaSel.value);
    localStorage.setItem('selectedRegion', regionSel.value);
    localStorage.setItem('selectedDistrict', districtSel.value);
    localStorage.setItem('selectedStore', storeSel.value);
    window.location.href = '/app/index.html';
  });

  populate(areaSel, Object.keys(TREE));
})();
