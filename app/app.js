/* =========================================================
   Sales Tracker - app/app.js  (Company Tree + App Logic)
   =========================================================

   - Cascading dropdowns (Area → Region → District → Store)
   - Saves/restores selections in localStorage
   - OneSignal “Enable Notifications” (+ “No thanks”)
   - DORT button routes to the full app at the ROOT (/index.html)
   - DATA_TREE embedded: expand/adjust as needed when you have the full list
*/

/* ------------------ COMPANY TREE ------------------
   Format:
   {
     "Area": {
       "Region": {
         "District": ["Store A", "Store B", ...]
       }
     }
   }
   NOTE: You can safely add/remove keys and stores here later.
*/
const DATA_TREE = {
  "West": {
    "SOUTHWEST": {
      "DFW WEST": [
        "Cleburne",
        "Rufe Snow",
        "Chisholm Trail",
        "28th Street",
        "Clifford",
        "Golden Triangle",
        "Granbury",
        "Stephenville",
        "Weatherford"
      ],
      "DFW NORTH": [
        "Custer",
        "Dallas Pkwy",
        "Independence Pkwy",
        "Richardson TX",
        "Stonebrook",
        "Walnut"
      ],
      "UTAH/CO": [
        "Draper",
        "Glenwood Springs",
        "Grand Junction",
        "Layton",
        "Lehi",
        "Vernal"
      ],
      "AZ-WEST": [
        "303 & Waddell",
        "99th Avenue",
        "Central",
        "Desert",
        "Laveen",
        "Mcdowell",
        "Northern Avenue",
        "Union"
      ],
      "AZ-EAST": [
        "Apache",
        "Combs",
        "Coolidge",
        "Power",
        "Red Mountain",
        "Stapley",
        "Talking"
      ],
      "COLORADO": [
        "Cheyenne",
        "Dillon",
        "Falcon",
        "Fountain",
        "Frontier",
        "Highpointe",
        "Northgate",
        "Peoria"
      ],
      "DESERT MOUNTAIN": [
        "Farmington",
        "Flagstaff",
        "Highway 89",
        "Prescott Valley East",
        "Sedona"
      ]
    },
    "GULF COAST": {
      "HOUSTON SOUTH": [
        "Alice",
        "Angleton",
        "Bay City",
        "Beeville",
        "Bellaire",
        "Highway 6",
        "Lake Jackson",
        "Mason",
        "Parkwood",
        "River Oaks",
        "Texas City",
        "Victoria",
        "Waterview"
      ],
      "HOUSTON NORTH": [
        "529",
        "Crosby",
        "Cypress",
        "Eva Plaza",
        "HEB-Mont Belvieu",
        "Huntsville",
        "Kingwood",
        "Louetta",
        "Magnolia",
        "Mont Belvieu",
        "Sawdust",
        "Tomball",
        "Tuckerton",
        "Willis"
      ],
      "SATX NORTH": [
        "Cibolo",
        "Kerrville",
        "La Cantera",
        "Schertz",
        "Seguin",
        "South Main",
        "Spring Branch",
        "Thousand Oaks"
      ],
      "SATX SOUTH": [
        "Eagle Pass",
        "HEB-Lytle",
        "Kingsville",
        "Marbach",
        "Palo Alto",
        "Rigsby Avenue",
        "SW Military",
        "South Bibb",
        "South Park Mall",
        "Uvalde",
        "Valley Hi"
      ],
      "SOUTH TEXAS": [
        "Alice",
        "Beeville",
        "Elsa",
        "North Conway",
        "Ocean Blvd",
        "Portland",
        "Rockport",
        "Stegner",
        "Viejo"
      ]
    },
    "MIDWEST": {
      "KENTUCKY": [
        "Evansville Burk",
        "Jeffersonville",
        "La Grange",
        "Maysville",
        "Mt Washington",
        "New Circle",
        "Owensboro",
        "Springhurst",
        "Winchester"
      ],
      "NEBRASKA": [
        "180th Street",
        "Altoona",
        "Ames",
        "Center",
        "Council Bluffs",
        "Grand Island",
        "King Lane",
        "Maple"
      ],
      "MISSISSIPPI RIVER VALLEY": [
        "12th Street",
        "Dubuque",
        "Hannibal",
        "Jeff City",
        "Osage",
        "Paducah",
        "Rolla",
        "Virginia Avenue"
      ],
      "OKC": [
        "Ardmore",
        "Bartlesville",
        "Chickasha",
        "Garth Brooks Blvd",
        "Market Place",
        "Mustang",
        "Owen Garriott",
        "Wrangler"
      ],
      "ARKANSAS": [
        "Hot Springs",
        "Little Rock",
        "Pine Bluff",
        "Russellville",
        "Searcy",
        "Van Buren"
      ],
      "KANSAS": [
        "Broken Arrow",
        "George Washington",
        "Peoria Ave",
        "Ponca City",
        "Riverside Pkwy",
        "Sapulpa",
        "Schilling"
      ]
    }
  },

  "South": {
    "SOUTH CENTRAL": {
      "ATX CENTRAL": [
        "Belterra",
        "Bryan",
        "Buda",
        "College Station",
        "Creekside",
        "New Braunfels",
        "Texas Ave",
        "West Woods"
      ],
      "ATX NORTH": [
        "Copperas Cove",
        "Killeen",
        "Killeen Mall",
        "Manor",
        "Marble Falls",
        "Round Rock",
        "Taylor"
      ],
      "DFW CENTRAL": [
        "28th Street",
        "Cooper Street",
        "Duncanville",
        "Ennis",
        "Golden Triangle",
        "Red Oak",
        "Rufe Snow"
      ],
      "DFW NORTH": [
        "Custer",
        "Dallas Pkwy",
        "Independence Pkwy",
        "Richardson TX",
        "Stonebrook",
        "Walnut"
      ],
      "DFW WEST": [
        "Bedford",
        "Chisholm Trail",
        "Clifford",
        "Eastchase",
        "Weatherford"
      ],
      "SATX NORTH": [
        "Cibolo",
        "Kerrville",
        "La Cantera",
        "Schertz",
        "Seguin",
        "Thousand Oaks"
      ],
      "SATX SOUTH": [
        "HEB-Lytle",
        "Kingsville",
        "Marbach",
        "Palo Alto",
        "Rigsby Avenue",
        "SW Military",
        "South Park Mall",
        "Valley Hi"
      ]
    },
    "GULF COAST": {
      "ATLANTA": [
        "Commerce",
        "Dacula",
        "Epps Bridge",
        "Locust Grove",
        "Peachtree City",
        "Winder",
        "Wrightsboro"
      ],
      "ATLANTIC COAST": [
        "Beaufort",
        "Brunswick",
        "Lowes Village",
        "Macclenny",
        "Savannah Crossing"
      ],
      "FLORIDA": [
        "Andover",
        "Apopka",
        "Granada",
        "Ocala",
        "Rolling Oaks",
        "Seminole"
      ],
      "NORTH GEORGIA": [
        "Athens",
        "Cartersville",
        "Chapel Hill",
        "Dalton",
        "Marietta",
        "Rome",
        "Smyrna",
        "Villa Rica"
      ],
      "HOUSTON NORTH": [
        "Crosby",
        "Eva Plaza",
        "Huntsville",
        "Louetta",
        "Magnolia",
        "Mont Belvieu",
        "Sawdust",
        "Tomball",
        "Willis"
      ],
      "HOUSTON SOUTH": [
        "529",
        "Angleton",
        "Bay City",
        "Cypress",
        "Lake Jackson",
        "Mason",
        "River Oaks",
        "Texas City",
        "Waterview"
      ],
      "LOUISIANA EAST": [
        "Airline",
        "Claiborne",
        "Covington",
        "Gentilly",
        "Hammond",
        "Rangeline",
        "Ridgeland",
        "Thibodaux",
        "Uptown",
        "Veterans"
      ],
      "LOUISIANA WEST": [
        "Alexandria",
        "Denham Springs",
        "Hammond",
        "Lafayette",
        "New Iberia",
        "North Mall",
        "Oneal",
        "Pinhook",
        "Prairieville"
      ],
      "KANSAS": [
        "Broken Arrow",
        "George Washington",
        "Peoria Ave",
        "Ponca City",
        "Riverside Pkwy",
        "Sapulpa",
        "Schilling"
      ]
    },
    "SOUTHWEST": {
      "ARIZONA SOUTH": [
        "Central",
        "Cochise",
        "Grant Road",
        "Harrison Plaza",
        "Las Plazas",
        "Nogales South",
        "Tucson Fashion Park"
      ],
      "OKC": [
        "Chickasha",
        "Garth Brooks Blvd",
        "Market Place",
        "Mustang",
        "Owen Garriott",
        "Plainview",
        "S. Georgia",
        "Wrangler"
      ],
      "UTAH/CO": [
        "Draper",
        "Glenwood Springs",
        "Grand Junction",
        "Layton",
        "Lehi",
        "Vernal"
      ]
    }
  }
};
/* ------------------ end COMPANY TREE ------------------ */


/* ------------------ UTILITIES ------------------ */
const $ = (id) => document.getElementById(id);
const areaSel     = $("areaSelect");
const regionSel   = $("regionSelect");
const districtSel = $("districtSelect");
const storeSel    = $("storeSelect");
const btnDORT     = $("dortBtn") || $("btnDort") || $("enableBtn");
const notifBtn    = $("enableBtn");
const skipBtn     = $("skipBtn");
const notifStatus = $("notifStatus");

function fillSelect(selectEl, items, placeholder){
  selectEl.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = placeholder;
  opt0.disabled = true;
  opt0.selected = true;
  selectEl.appendChild(opt0);
  (items || []).forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
  selectEl.disabled = items.length === 0;
}

function saveSelections(){
  localStorage.setItem("sel_area", areaSel.value || "");
  localStorage.setItem("sel_region", regionSel.value || "");
  localStorage.setItem("sel_district", districtSel.value || "");
  localStorage.setItem("sel_store", storeSel.value || "");
}

function restoreSelections(){
  // Areas
  const areas = Object.keys(DATA_TREE || {});
  fillSelect(areaSel, areas, "Select Area");

  const a = localStorage.getItem("sel_area");
  const r = localStorage.getItem("sel_region");
  const d = localStorage.getItem("sel_district");
  const s = localStorage.getItem("sel_store");

  if (a && DATA_TREE[a]) {
    areaSel.value = a;
    onAreaChange(false);

    if (r && DATA_TREE[a][r]) {
      regionSel.value = r;
      onRegionChange(false);

      if (d && DATA_TREE[a][r][d]) {
        districtSel.value = d;
        onDistrictChange(false);

        const exists = Array.from(storeSel.options).some(o => o.value === s);
        if (s && exists) storeSel.value = s;
      }
    }
  }
}

function onAreaChange(save=true){
  const a = areaSel.value;
  const regions = a ? Object.keys(DATA_TREE[a] || {}) : [];
  fillSelect(regionSel, regions, "Select Region");
  fillSelect(districtSel, [], "Select District");
  fillSelect(storeSel, [], "Select Store");
  if (save) {
    localStorage.removeItem("sel_region");
    localStorage.removeItem("sel_district");
    localStorage.removeItem("sel_store");
    saveSelections();
  }
}

function onRegionChange(save=true){
  const a = areaSel.value;
  const r = regionSel.value;
  const districts = (a && r) ? Object.keys((DATA_TREE[a]||{})[r] || {}) : [];
  fillSelect(districtSel, districts, "Select District");
  fillSelect(storeSel, [], "Select Store");
  if (save) {
    localStorage.removeItem("sel_district");
    localStorage.removeItem("sel_store");
    saveSelections();
  }
}

function onDistrictChange(save=true){
  const a = areaSel.value;
  const r = regionSel.value;
  const d = districtSel.value;
  const stores = (a && r && d) ? (((DATA_TREE[a]||{})[r]||{})[d] || []) : [];
  fillSelect(storeSel, stores, "Select Store");
  if (save) {
    localStorage.removeItem("sel_store");
    saveSelections();
  }
}

function onStoreChange(){ saveSelections(); }


/* ------------------ Notifications ------------------ */
/* Keeping the simple in-app prompt style + "No thanks" */
enableBtn?.addEventListener("click", async () => {
  try {
    const permission = await Notification.requestPermission();
    notifStatus.textContent = permission === "granted"
      ? "Notifications enabled!"
      : "Permission denied.";
  } catch (err) {
    notifStatus.textContent = "Error: " + err;
  }
});

skipBtn?.addEventListener("click", () => {
  notifStatus.textContent = "Notifications skipped.";
});


/* ------------------ Start ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  areaSel.addEventListener("change", onAreaChange);
  regionSel.addEventListener("change", onRegionChange);
  districtSel.addEventListener("change", onDistrictChange);
  storeSel.addEventListener("change", onStoreChange);

  restoreSelections();

  // Route to the full app at the ROOT when clicking DORT
  if (btnDORT) {
    btnDORT.addEventListener("click", () => {
      window.location.href = "/index.html";
    });
  }
});

// Avoid horizontal scroll on iOS
document.documentElement.style.overflowX = "hidden";
document.body.style.overflowX = "hidden";
