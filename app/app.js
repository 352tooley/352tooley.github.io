
/* Goals & Gaps Tracker – Full Locations + dropdown wiring
   - This file embeds the full Area → Region → District → Store tree
   - Persists user selections in localStorage
   - Enables the DORT button when a store is selected
*/

// ---- Full Company Hierarchy (auto-generated) ----
const companyTree = {"EAST": {"NORTHEAST": {"HUDSON": ["County Road", "Frederick", "Hamburg", "Lakeview", "Moger", "Morris", "North Broadway", "Route 9", "Washington"], "LAKESHORE": ["Alliance", "Ashtabula", "Clifton", "Garfield Heights", "Green", "Independence", "Solon", "Stow", "Streetsboro", "Twinsburg"], "LONG ISLAND": ["Baisley Blvd", "Bethpage", "Commack", "East Islip", "Hempstead", "Jericho", "New York Avenue", "Rockaway", "West Islip"], "MASSACHUSETTS": ["Albany Turnpike", "Billerica", "Harwich", "Haverhill", "Malden", "Methuen", "North Street", "River Road", "Spencer"], "MID ATLANTIC": ["Bristow", "Buckeystown", "Damascus", "Lexington", "Marlboro", "Montanus", "Salisbury Blvd", "Village Center", "West Ruark"], "PHILADELPHIA": ["Big Elk", "Commons", "Crossing", "Dilworthtown", "Middletown", "Newark DE", "Summit Square", "Yard Ville"], "QUEENS": ["8th Avenue", "Broadway", "College Point", "Elmont", "Glen Oaks", "Horace", "Linden", "Main Street", "Ozone Park", "Ridgewood", "Springfield Blvd"], "STEEL VALLEY": ["Beaver Falls", "Cambridge", "Coshocton", "Countryside", "Hermitage", "St Clairsville", "Steubenville", "Triadelphia", "Uniontown", "Youngstown", "Zanesville"]}, "OHIO VALLEY": {"CENTRAL OHIO EAST": ["Canal Winchester", "Circleville", "Heath", "Hillsboro", "London", "Newark", "Pataskala", "Reynoldsburg", "Sunbury", "Sycamore Plaza", "Washington Court House"], "CINCINNATI SOUTH": ["Centennial", "Eastgate", "Fairfield", "Harrison Avenue", "Hebron", "Highland Heights", "Lawrenceburg", "Newport", "North Bend"], "INDY CITY": ["Anderson", "Carmel", "Frankfort", "Hazel Dell", "Heartland", "Marion", "Muncie", "Noblesville", "West Lafayette", "Zionsville"], "INDY GP": ["Bargersville", "Bloomington", "Greenfield", "Keystone", "Martinsville", "New Castle", "Nora", "Norgate", "Rushville", "Seymour", "Shelbyville"], "MI/IN": ["Chapel Ridge", "Dupont", "Elkhart", "Kendallville", "Milford", "Rochester Hills", "South Lyon", "Warsaw"], "MICHIGAN": ["Allendale", "Big Rapids", "Grand Haven", "Grand Rapids", "Greenville", "Knapps Corner", "Ludington", "Muskegon", "Northland", "Three Rivers", "Walker", "West 48th"], "MID OHIO": ["Ashland", "Bellefontaine", "Bucyrus", "Delaware", "Fremont", "Marysville", "Mt. Gilead", "Mt. Vernon", "Norwalk", "Ontario", "Westfield"], "OHIO SOUTHWEST": ["Brandt Pike", "Centerville", "Hamilton", "Lebanon", "Oxford", "Piqua", "Sidney", "South Main Street", "Springboro", "Springfield", "Urbana", "Wilmington", "Xenia"]}, "SOUTHEAST": {"ATLANTA": ["Commerce", "Dacula", "Epps Bridge", "Locust Grove", "Peachtree City", "Winder", "Wrightsboro"], "ATLANTIC COAST": ["Beaufort", "Brunswick", "Lowes Village", "Macclenny", "Savannah Crossing"], "CAROLINA EAST": ["31st Ave", "Clayton", "Coastal Grand Mall", "East Hanes", "Fordham", "Morehead City", "Samet", "Thomasville"], "CAROLINA WEST": ["Augusta", "Boiling Springs", "Columbia", "Gaffney", "Greenwood", "Kernersville"], "FLORIDA": ["Andover", "Apopka", "Granada", "Ocala", "Rolling Oaks", "Seminole"], "NORTH GEORGIA": ["Athens", "Cartersville", "Chapel Hill", "Dalton", "Marietta", "Rome", "Smyrna", "Villa Rica"], "TN/VA": ["Asheville", "Elizabethton", "Exit Seven", "Kingston Pike", "Knoxville", "Morristown", "Oak ridge"]}}, "WEST": {"GULF COAST": {"ATX CENTRAL": ["Belterra", "Bryan", "Buda", "College Station", "Creekside", "Highway 71", "New Braunfels", "Texas Ave", "West Woods"], "ATX NORTH": ["Copperas Cove", "Killeen", "Killeen Mall", "Manor", "Marble Falls", "Round Rock", "Taylor"], "HOUSTON NORTH": ["529", "Crosby", "Cypress", "Eva Plaza", "Huntsville", "Kingwood", "Louetta", "Magnolia", "Mont Belvieu", "Sawdust", "Tomball", "Tuckerton", "Willis"], "HOUSTON SOUTH": ["Alice", "Angleton", "Bay City", "Beeville", "Bellaire", "Highway 6", "Lake Jackson", "Mason", "Parkwood", "River Oaks", "Texas City", "Victoria", "Waterview"], "LOUISIANA EAST": ["Airline", "Claiborne", "Covington", "Gentilly", "Hammond", "Rangeline", "Ridgeland", "Thibodaux", "Uptown", "Veterans"], "LOUISIANA WEST": ["Alexandria", "Denham Springs", "Lafayette", "New Iberia", "North Mall", "Oneal", "Pinhook", "Prairieville"], "SATX NORTH": ["Cibolo", "Kerrville", "La Cantera", "Schertz", "Seguin", "South Main", "Spring Branch", "Thousand Oaks"], "SATX SOUTH": ["Eagle Pass", "HEB-Lytle", "Kingsville", "Marbach", "Palo Alto", "Rigsby Avenue", "SW Military", "South Bibb", "South Park Mall", "Uvalde", "Valley Hi"], "SOUTH TEXAS": ["Elsa", "North Conway", "Ocean Blvd", "Portland", "Rockport", "Stegner", "Viejo"]}, "MIDWEST": {"ARKANSAS": ["Hot Springs", "Little Rock", "Pine Bluff", "Russellville", "Searcy", "Van Buren"], "KANSAS": ["Broken Arrow", "George Washington", "Peoria Ave", "Ponca City", "Riverside Pkwy", "Sapulpa", "Schilling"], "KENTUCKY": ["Evansville Burk", "Jeffersonville", "La Grange", "Maysville", "Mt Washington", "New Circle", "Owensboro", "Springhurst", "Winchester"], "MISSISSIPPI RIVER VALLEY": ["12th Street", "Dubuque", "Hannibal", "Jeff City", "Osage", "Paducah", "Rolla", "Virginia Avenue"], "NEBRASKA": ["180th Street", "Altoona", "Ames", "Center", "Council Bluffs", "Grand Island", "King Lane", "Maple"], "OKC": ["Ardmore", "Bartlesville", "Chickasha", "Garth Brooks Blvd", "Market Place", "Mustang", "Owen Garriott", "Wrangler"]}, "SOUTHWEST": {"ARIZONA SOUTH": ["Cochise", "Grant Road", "Harrison Plaza", "Las Plazas", "Nogales South", "Tucson Fashion Park"], "AZ-EAST": ["Apache", "Combs", "Coolidge", "Power", "Red Mountain", "Stapley", "Talking"], "AZ-WEST": ["303 & Waddell", "99th Avenue", "Central", "Desert", "Laveen", "Mcdowell", "Northern Avenue", "Union"], "COLORADO": ["Cheyenne", "Dillon", "Falcon", "Fountain", "Frontier", "Highpointe", "Northgate", "Peoria"], "DESERT MOUNTAIN": ["Farmington", "Flagstaff", "Highway 89", "Prescott Valley East", "Sedona"], "DFW NORTH": ["Custer", "Dallas Pkwy", "Independence Pkwy", "Jefferson", "Pines Road", "Richardson TX", "Stonebrook", "Walnut", "Wesley"], "DFW SOUTH": ["Bedford", "Cooper Street", "Corsicana Hwy", "Duncanville", "Eastchase", "Ennis", "Red Oak", "Seventh Ave"], "DFW WEST": ["28th Street", "Chisholm Trail", "Cleburne", "Clifford", "Golden Triangle", "Granbury", "Rufe Snow", "Stephenville", "Weatherford"], "PAN HANDLE": ["Big Spring", "Midland", "Odessa", "Olton", "Plainview", "S. Georgia", "Walmart Court"], "UTAH/CO": ["Draper", "Glenwood Springs", "Grand Junction", "Layton", "Lehi", "Vernal"]}}};

// ---- DOM helpers ----
const $ = (id) => document.getElementById(id);
const setDisabled = (el, on) => { if (!el) return; el.disabled = !!on; el.style.opacity = on ? 0.65 : 1; };
const fill = (el, items, placeholder) => {
  if (!el) return;
  el.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = placeholder;
  el.appendChild(opt0);
  (items || []).forEach(v => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    el.appendChild(o);
  });
};

function saveSelections() {
  localStorage.setItem("sel_area", $("areaSelect")?.value || "");
  localStorage.setItem("sel_region", $("regionSelect")?.value || "");
  localStorage.setItem("sel_district", $("districtSelect")?.value || "");
  localStorage.setItem("sel_store", $("storeSelect")?.value || "");
}

function restoreSelections() {
  const areaSel = $("areaSelect");
  const regionSel = $("regionSelect");
  const districtSel = $("districtSelect");
  const storeSel = $("storeSelect");

  // Fill areas
  const areas = Object.keys(companyTree);
  fill(areaSel, areas, "Select Area");
  setDisabled(areaSel, areas.length === 0);

  const savedArea = localStorage.getItem("sel_area") || "";
  const savedRegion = localStorage.getItem("sel_region") || "";
  const savedDistrict = localStorage.getItem("sel_district") || "";
  const savedStore = localStorage.getItem("sel_store") || "";

  if (savedArea && companyTree[savedArea]) {
    areaSel.value = savedArea;
    onAreaChange();
    if (savedRegion && companyTree[savedArea][savedRegion]) {
      $("regionSelect").value = savedRegion;
      onRegionChange();
      if (savedDistrict && companyTree[savedArea][savedRegion][savedDistrict]) {
        $("districtSelect").value = savedDistrict;
        onDistrictChange();
        if (savedStore) {
          const exists = Array.from($("storeSelect").options).some(o => o.value === savedStore);
          if (exists) $("storeSelect").value = savedStore;
        }
      }
    }
  }
  updateGoBtn();
}

function onAreaChange() {
  const a = $("areaSelect")?.value || "";
  const regionSel = $("regionSelect");
  const districtSel = $("districtSelect");
  const storeSel = $("storeSelect");

  saveSelections();

  if (!a || !companyTree[a]) {
    fill(regionSel, [], "Select Region"); setDisabled(regionSel, true);
    fill(districtSel, [], "Select District"); setDisabled(districtSel, true);
    fill(storeSel, [], "Select Store"); setDisabled(storeSel, true);
    return;
  }
  const regions = Object.keys(companyTree[a] || {});
  fill(regionSel, regions, "Select Region"); setDisabled(regionSel, regions.length === 0);
  fill(districtSel, [], "Select District"); setDisabled(districtSel, true);
  fill(storeSel, [], "Select Store"); setDisabled(storeSel, true);

  localStorage.removeItem("sel_region");
  localStorage.removeItem("sel_district");
  localStorage.removeItem("sel_store");
  updateGoBtn();
}

function onRegionChange() {
  const a = $("areaSelect")?.value || "";
  const r = $("regionSelect")?.value || "";
  const districtSel = $("districtSelect");
  const storeSel = $("storeSelect");

  saveSelections();

  if (!a || !r || !companyTree[a] || !companyTree[a][r]) {
    fill(districtSel, [], "Select District"); setDisabled(districtSel, true);
    fill(storeSel, [], "Select Store"); setDisabled(storeSel, true);
    return;
  }
  const districts = Object.keys(companyTree[a][r] || {});
  fill(districtSel, districts, "Select District"); setDisabled(districtSel, districts.length === 0);
  fill(storeSel, [], "Select Store"); setDisabled(storeSel, true);

  localStorage.removeItem("sel_district");
  localStorage.removeItem("sel_store");
  updateGoBtn();
}

function onDistrictChange() {
  const a = $("areaSelect")?.value || "";
  const r = $("regionSelect")?.value || "";
  const d = $("districtSelect")?.value || "";
  const storeSel = $("storeSelect");

  saveSelections();

  if (!a || !r || !d || !companyTree[a] || !companyTree[a][r] || !companyTree[a][r][d]) {
    fill(storeSel, [], "Select Store"); setDisabled(storeSel, true);
    return;
  }
  const stores = companyTree[a][r][d] || [];
  fill(storeSel, stores, "Select Store"); setDisabled(storeSel, stores.length === 0);

  localStorage.removeItem("sel_store");
  updateGoBtn();
}

function onStoreChange() {
  saveSelections();
  updateGoBtn();
}

function updateGoBtn() {
  const goBtn = $("goBtn");
  const hasStore = !!($("storeSelect")?.value);
  if (goBtn) {
    goBtn.style.pointerEvents = hasStore ? "auto" : "none";
    goBtn.style.opacity = hasStore ? "1" : "0.5";
  }
}

// Wire up
document.addEventListener("DOMContentLoaded", () => {
  const areaSel = $("areaSelect");
  const regionSel = $("regionSelect");
  const districtSel = $("districtSelect");
  const storeSel = $("storeSelect");

  areaSel && areaSel.addEventListener("change", onAreaChange);
  regionSel && regionSel.addEventListener("change", onRegionChange);
  districtSel && districtSel.addEventListener("change", onDistrictChange);
  storeSel && storeSel.addEventListener("change", onStoreChange);

  restoreSelections();
});

// Expose for debugging
window.__companyTree = companyTree;
