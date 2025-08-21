
/* app_js_inline.js
   Populates Area → Region → District → Store dropdowns from DATA_TREE,
   saves selections in localStorage, and restores on reload.
*/

(function(){
  // ---------- Inline company tree (representative subset) ----------
  // NOTE: You can expand this object with the full tree as needed.
  const DATA_TREE = {
    "West": {
      "SOUTHWEST": {
        "DFW WEST": [
          "28th Street","Chisholm Trail","Cleburne","Clifford",
          "Golden Triangle","Granbury","Rufe Snow","Stephenville","Weatherford"
        ],
        "DFW NORTH": [
          "Custer","Dallas Pkwy","Independence Pkwy","Richardson TX","Stonebrook","Walnut"
        ],
        "AZ-WEST": [
          "303 & Waddell","99th Avenue","Central","Desert","Laveen","Mcdowell","Northern Avenue","Union"
        ],
        "UTAH/CO": [
          "Draper","Glenwood Springs","Grand Junction","Layton","Lehi","Vernal"
        ]
      },
      "GULF COAST": {
        "HOUSTON NORTH": [
          "Crosby","Eva Plaza","Huntsville","Louetta","Magnolia","Mont Belvieu","Sawdust","Tomball","Willis"
        ],
        "HOUSTON SOUTH": [
          "Angleton","Bay City","Lake Jackson","Mason","River Oaks","Texas City","Waterview"
        ],
        "SATX SOUTH": [
          "HEB-Lytle","Kingsville","Marbach","Palo Alto","Rigsby Avenue","SW Military","South Park Mall","Valley Hi"
        ]
      }
    },
    "South": {
      "GULF COAST": {
        "LOUISIANA EAST": [
          "Airline","Claiborne","Covington","Gentilly","Hammond","Rangeline","Ridgeland","Thibodaux","Uptown","Veterans"
        ],
        "LOUISIANA WEST": [
          "Alexandria","Denham Springs","Lafayette","New Iberia","North Mall","Oneal","Pinhook","Prairieville"
        ],
        "FLORIDA": ["Andover","Apopka","Granada","Ocala","Rolling Oaks","Seminole"]
      },
      "SOUTH CENTRAL": {
        "ATX CENTRAL": ["Belterra","Bryan","Buda","College Station","Creekside","New Braunfels","Texas Ave","West Woods"],
        "ATX NORTH": ["Copperas Cove","Killeen","Killeen Mall","Manor","Marble Falls","Round Rock","Taylor"],
        "DFW CENTRAL": ["28th Street","Cooper Street","Duncanville","Ennis","Golden Triangle","Red Oak","Rufe Snow"],
        "SATX NORTH": ["Cibolo","Kerrville","La Cantera","Schertz","Seguin","Thousand Oaks"]
      }
    },
    "East": {
      "NORTHEAST": {
        "QUEENS": ["8th Avenue","Broadway","College Point","Elmont","Glen Oaks","Linden","Main Street","Ozone Park","Ridgewood","Springfield Blvd"],
        "LONG ISLAND": ["Baisley Blvd","Bethpage","Commack","East Islip","Hempstead","Jericho","New York Avenue","Rockaway","West Islip"],
        "MASSACHUSETTS": ["Albany Turnpike","Billerica","Harwich","Haverhill","Malden","Methuen","North Street","River Road","Spencer"]
      },
      "OHIO VALLEY": {
        "MI/IN": ["Chapel Ridge","Dupont","Elkhart","Kendallville","Milford","Rochester Hills","South Lyon","Warsaw"],
        "MICHIGAN": ["Allendale","Big Rapids","Grand Haven","Grand Rapids","Greenville","Knapps Corner","Ludington","Muskegon","Northland","Three Rivers","Walker","West 48th"],
        "MID OHIO": ["Ashland","Bellefontaine","Bucyrus","Delaware","Fremont","Marysville","Mt. Gilead","Mt. Vernon","Norwalk","Ontario","Westfield"]
      }
    },
    "North": {
      "NORTH CENTRAL": {
        "NORTH GEORGIA": ["Athens","Cartersville","Chapel Hill","Dalton","Marietta","Rome","Smyrna","Villa Rica"],
        "STEEL VALLEY": ["Alliance","Beaver Falls","Cambridge","Coshocton","Countryside","Hermitage","Triadelphia","Uniontown","Youngstown","Zanesville"],
        "TN/VA": ["Asheville","Elizabethton","Exit Seven","Kingston Pike","Knoxville","Morristown","Oak Ridge"]
      }
    }
  };

  // Expose for debugging (optional)
  window.__DATA_TREE__ = DATA_TREE;

  // ---------- Utility helpers ----------
  const $ = (id) => document.getElementById(id);
  const areaSel = $("areaSelect");
  const regionSel = $("regionSelect");
  const districtSel = $("districtSelect");
  const storeSel = $("storeSelect");
  const dortBtn = $("dortBtn");

  function setDisabled(el, on) {
    if (!el) return;
    el.disabled = !!on;
    el.style.opacity = on ? 0.7 : 1;
  }

  function fillSelect(el, list, placeholder) {
    if (!el) return;
    el.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = placeholder;
    ph.disabled = true;
    ph.selected = true;
    el.appendChild(ph);
    (list || []).forEach((label) => {
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      el.appendChild(opt);
    });
  }

  function saveState() {
    localStorage.setItem("sel_area", areaSel.value || "");
    localStorage.setItem("sel_region", regionSel.value || "");
    localStorage.setItem("sel_district", districtSel.value || "");
    localStorage.setItem("sel_store", storeSel.value || "");
  }

  function restoreState() {
    // Areas
    const areas = Object.keys(DATA_TREE).sort();
    fillSelect(areaSel, areas, "Select Area");
    setDisabled(areaSel, areas.length === 0);

    const a = localStorage.getItem("sel_area");
    const r = localStorage.getItem("sel_region");
    const d = localStorage.getItem("sel_district");
    const s = localStorage.getItem("sel_store");

    if (a && DATA_TREE[a]) {
      areaSel.value = a;
      onAreaChange();
      if (r && DATA_TREE[a][r]) {
        regionSel.value = r;
        onRegionChange();
        if (d && DATA_TREE[a][r][d]) {
          districtSel.value = d;
          onDistrictChange();
          // store
          if (s) {
            const exists = Array.from(storeSel.options).some(o => o.value === s);
            if (exists) storeSel.value = s;
          }
        }
      }
    }
    updateDortState();
  }

  function onAreaChange() {
    saveState();
    const a = areaSel.value;
    if (!a || !DATA_TREE[a]) {
      fillSelect(regionSel, [], "Select Region");
      fillSelect(districtSel, [], "Select District");
      fillSelect(storeSel, [], "Select Store");
      setDisabled(regionSel, true);
      setDisabled(districtSel, true);
      setDisabled(storeSel, true);
      updateDortState();
      return;
    }
    const regions = Object.keys(DATA_TREE[a]).sort();
    fillSelect(regionSel, regions, "Select Region");
    setDisabled(regionSel, regions.length === 0);
    fillSelect(districtSel, [], "Select District");
    setDisabled(districtSel, true);
    fillSelect(storeSel, [], "Select Store");
    setDisabled(storeSel, true);
    localStorage.removeItem("sel_region");
    localStorage.removeItem("sel_district");
    localStorage.removeItem("sel_store");
    updateDortState();
  }

  function onRegionChange() {
    saveState();
    const a = areaSel.value, r = regionSel.value;
    if (!a || !r || !DATA_TREE[a] || !DATA_TREE[a][r]) {
      fillSelect(districtSel, [], "Select District");
      setDisabled(districtSel, true);
      fillSelect(storeSel, [], "Select Store");
      setDisabled(storeSel, true);
      updateDortState();
      return;
    }
    const dists = Object.keys(DATA_TREE[a][r]).sort();
    fillSelect(districtSel, dists, "Select District");
    setDisabled(districtSel, dists.length === 0);
    fillSelect(storeSel, [], "Select Store");
    setDisabled(storeSel, true);
    localStorage.removeItem("sel_district");
    localStorage.removeItem("sel_store");
    updateDortState();
  }

  function onDistrictChange() {
    saveState();
    const a = areaSel.value, r = regionSel.value, d = districtSel.value;
    if (!a || !r || !d || !DATA_TREE[a] || !DATA_TREE[a][r] || !DATA_TREE[a][r][d]) {
      fillSelect(storeSel, [], "Select Store");
      setDisabled(storeSel, true);
      updateDortState();
      return;
    }
    const stores = DATA_TREE[a][r][d].slice().sort();
    fillSelect(storeSel, stores, "Select Store");
    setDisabled(storeSel, stores.length === 0);
    localStorage.removeItem("sel_store");
    updateDortState();
  }

  function onStoreChange() {
    saveState();
    updateDortState();
  }

  function updateDortState() {
    if (!dortBtn) return;
    const enabled = !!(areaSel.value && regionSel.value && districtSel.value && storeSel.value);
    dortBtn.disabled = !enabled;
  }

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", function(){
    // Wire handlers
    if (areaSel) areaSel.addEventListener("change", onAreaChange);
    if (regionSel) regionSel.addEventListener("change", onRegionChange);
    if (districtSel) districtSel.addEventListener("change", onDistrictChange);
    if (storeSel) storeSel.addEventListener("change", onStoreChange);
    if (dortBtn) {
      dortBtn.addEventListener("click", function(){
        // Navigate to app flow (DORT) if needed; currently just saves and stays
        saveState();
        // Example: window.location.href = "/app/index.html#dort";
      });
    }
    restoreState();
  });
})();
