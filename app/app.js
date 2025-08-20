/* =============================
   Sales Tracker - app/app.js (v6)
   =============================

   - Cascading dropdowns (Area → Region → District → Store)
   - Saves/restores selections in localStorage
   - OneSignal notifications (Enable / No thanks)
   - DORT button now routes to the full app at the ROOT (/index.html)
*/

/* ---------- COMPANY TREE (sample) ----------
   Replace with your full data when ready.
*/
const DATA_TREE = {
  "West": {
    "SOUTHWEST": {
      "DFW WEST": ["Cleburne","Clifford","Chisholm Trail","Eastchase","Granbury","Rufe Snow","Weatherford","Stephenville"],
      "DFW NORTH": ["Custer","Dallas Pkwy","Independence Pkwy","Richardson TX","Stonebrook","Walnut"]
    },
    "GULF COAST": {
      "HOUSTON SOUTH": ["Angleton","Bay City","Lake Jackson","Mason","River Oaks","Texas City","Waterview"],
      "HOUSTON NORTH": ["Crosby","Huntsville","Louetta","Magnolia","Mont Belvieu","Sawdust","Tomball","Willis"]
    }
  },
  "South": {
    "SOUTH CENTRAL": {
      "ATX CENTRAL": ["Belterra","Bryan","Buda","College Station","Creekside","New Braunfels","Texas Ave","West Woods"],
      "SATX SOUTH": ["HEB-Lytle","Kingsville","Marbach","Palo Alto","Rigsby Avenue","SW Military","South Park Mall","Valley Hi"]
    }
  }
};
/* ---------- end sample ---------- */

const $ = (id) => document.getElementById(id);
const areaSel     = $("areaSelect");
const regionSel   = $("regionSelect");
const districtSel = $("districtSelect");
const storeSel    = $("storeSelect");
const btnDORT     = $("btnDort") || $("enableBtn");
const notifBtn    = $("notifBtn") || $("btnEnable");
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

function onStoreChange(){
  saveSelections();
}

/* ---------- OneSignal ---------- */
const ONESIGNAL_APP_ID = "5ecaba08-de2f-44b8-a4f0-369508265505";
function setNotifUI(status){
  if (!notifBtn || !notifStatus) return;
  if (status === "on") {
    notifBtn.textContent = "Notifications On";
    notifBtn.disabled = true;
    notifStatus.textContent = "Subscribed";
  } else if (status === "blocked") {
    notifBtn.textContent = "Notifications Blocked";
    notifBtn.disabled = true;
    notifStatus.textContent = "Notifications are blocked at the browser level.";
  } else {
    notifBtn.textContent = "Enable Notifications";
    notifBtn.disabled = false;
    notifStatus.textContent = "";
  }
}
async function initNotifications(){
  if (!window.OneSignalDeferred) window.OneSignalDeferred = [];
  OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({ appId: ONESIGNAL_APP_ID });
    try {
      const optedIn = await OneSignal.User.PushSubscription.optedIn;
      setNotifUI(optedIn ? "on" : "off");
    } catch(e){
      setNotifUI("off");
    }
    if (notifBtn) {
      notifBtn.addEventListener("click", async () => {
        try {
          await OneSignal.Slidedown.promptPush();
          const enabled = await OneSignal.User.PushSubscription.optedIn;
          setNotifUI(enabled ? "on" : "off");
        } catch(e){ console.warn("Notification prompt error:", e); }
      });
    }
  });
}
if (skipBtn) {
  skipBtn.addEventListener("click", () => {
    localStorage.setItem("notif_opt_out", "1");
    setNotifUI("off");
  });
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", () => {
  areaSel.addEventListener("change", onAreaChange);
  regionSel.addEventListener("change", onRegionChange);
  districtSel.addEventListener("change", onDistrictChange);
  storeSel.addEventListener("change", onStoreChange);

  restoreSelections();

  if (!localStorage.getItem("notif_opt_out")) {
    initNotifications();
  } else {
    setNotifUI("off");
  }

  // Route to the full app at the ROOT
  if (btnDORT) {
    btnDORT.addEventListener("click", () => {
      window.location.href = "/index.html";
    });
  }
});

// Prevent horizontal scroll
document.documentElement.style.overflowX = "hidden";
document.body.style.overflowX = "hidden";
