// Handle Notifications + Skip Button
document.addEventListener("DOMContentLoaded", () => {
  const enableBtn = document.getElementById("enableBtn");
  const skipBtn = document.getElementById("skipBtn");
  const notifStatus = document.getElementById("notifStatus");

  enableBtn.addEventListener("click", async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        notifStatus.textContent = "Notifications enabled ✅";
      } else {
        notifStatus.textContent = "Notifications blocked ❌";
      }
    } catch (err) {
      notifStatus.textContent = "Error enabling notifications";
    }
  });

  skipBtn.addEventListener("click", () => {
    notifStatus.textContent = "Notifications skipped";
  });

  // Dropdown data (placeholder, replace with full dataset from Excel later)
  const data = {
    "South": {
      "Gulf Coast": {
        "District 1": ["Store A", "Store B"],
        "District 2": ["Store C"]
      }
    }
  };

  const areaSelect = document.getElementById("areaSelect");
  const regionSelect = document.getElementById("regionSelect");
  const districtSelect = document.getElementById("districtSelect");
  const storeSelect = document.getElementById("storeSelect");

  // Populate Area
  Object.keys(data).forEach(area => {
    const option = document.createElement("option");
    option.value = area;
    option.textContent = area;
    areaSelect.appendChild(option);
  });

  areaSelect.addEventListener("change", () => {
    regionSelect.innerHTML = '<option disabled selected>Select Region</option>';
    districtSelect.innerHTML = '<option disabled selected>Select District</option>';
    storeSelect.innerHTML = '<option disabled selected>Select Store</option>';
    regionSelect.disabled = false;
    Object.keys(data[areaSelect.value]).forEach(region => {
      const option = document.createElement("option");
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
  });

  regionSelect.addEventListener("change", () => {
    districtSelect.innerHTML = '<option disabled selected>Select District</option>';
    storeSelect.innerHTML = '<option disabled selected>Select Store</option>';
    districtSelect.disabled = false;
    Object.keys(data[areaSelect.value][regionSelect.value]).forEach(district => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  });

  districtSelect.addEventListener("change", () => {
    storeSelect.innerHTML = '<option disabled selected>Select Store</option>';
    storeSelect.disabled = false;
    data[areaSelect.value][regionSelect.value][districtSelect.value].forEach(store => {
      const option = document.createElement("option");
      option.value = store;
      option.textContent = store;
      storeSelect.appendChild(option);
    });
  });
});
