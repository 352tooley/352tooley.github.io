// app/app.js — dropdowns + notifications (OneSignal v16)
(function(){
  // ----- Notifications (restore original look/feel + "No thanks") -----
  const APP_ID = "5ecaba08-de2f-44b8-a4f0-369508265505";
  const btnEnable = document.getElementById('enableBtn');
  const btnSkip = document.getElementById('skipBtn');
  const status = document.getElementById('notifStatus');
  const SKIP_KEY = 'push_skip';

  function setStatus(msg, tone){
    if(!status) return;
    status.textContent = msg || '';
    status.style.color = tone==='ok' ? '#0a7a0a' : tone==='warn' ? '#b85d00' : '#666';
  }
  function setEnable(disabled, label){
    if(!btnEnable) return;
    btnEnable.disabled = !!disabled;
    if(label) btnEnable.textContent = label;
  }
  function skipped(){ return localStorage.getItem(SKIP_KEY) === '1'; }
  function setSkipped(v){ localStorage.setItem(SKIP_KEY, v ? '1' : '0'); }

  if(btnEnable && btnSkip && status){
    if(skipped()){
      setEnable(true, 'Notifications Off');
      setStatus('You chose not to enable notifications.', 'warn');
    }else{
      setStatus('Notifications are optional.', null);
    }

    btnEnable.addEventListener('click', async () => {
      try{
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(async function(OneSignal) {
          await OneSignal.init({ appId: APP_ID });
          try{
            await OneSignal.Slidedown.promptPush();
            const optedIn = await OneSignal.User.PushSubscription.optedIn;
            if(optedIn){
              setStatus('Subscribed — you will receive reminders.', 'ok');
              setEnable(true, 'Notifications Enabled');
            }else{
              setStatus('Not subscribed — permission was not granted.', 'warn');
            }
          }catch(e){
            setStatus('Prompt error: ' + (e && e.message ? e.message : e), 'warn');
          }
        });
      }catch(e){
        setStatus('Init error: ' + (e && e.message ? e.message : e), 'warn');
      }
    });

    btnSkip.addEventListener('click', () => {
      setSkipped(true);
      setEnable(true, 'Notifications Off');
      setStatus('You chose not to enable notifications.', 'warn');
    });
  }

  // ----- Cascading dropdowns (Area → Region → District → Store) -----
  const DATA_TREE = {"East":{"NORTHEAST":{"HUDSON":["County Road","Frederick","Hamburg","Lakeview","Moger","Morris","North Broadway","Route 9","Washington"],"LAKESHORE":["Alliance","Ashtabula","Clifton","Fremont","Garfield Heights","Green","Independence","Solon","Stow","Streetsboro","Twinsburg"],"LONG ISLAND":["Baisley Blvd","Bethpage","Commack","East Islip","Hempstead","Jericho","New York Avenue","Rockaway","West Islip"],"MASSACHUSETTS":["Albany Turnpike","Billerica","Harwich","Haverhill","Malden","Methuen","North Street","River Road","Spencer"],"MID ATLANTIC":["Bristow","Buckeystown","Damascus","Lexington","Marlboro","Montanus","Salisbury Blvd","Village Center","West Ruark"],"MID ATLANTIC EAST":["Big Elk","Marlboro","Middletown","Newark DE","Salisbury Blvd","West Ruark"],"MID ATLANTIC WEST":["Bristow","Buckeystown","Damascus","Lexington","Montanus","Village Center"],"PHILADELPHIA":["Big Elk","Commons","County Road","Crossing","Dilworthtown","Middletown","Newark DE","Route 9","Summit Square","Yard Ville"],"QUEENS":["8th Avenue","Broadway","College Point","Elmont","Glen Oaks","Horace","Linden","Main Street","Ozone Park","Ridgewood","Springfield Blvd"],"STEEL VALLEY":["Alliance","Beaver Falls","Cambridge","Coshocton","Countryside","Hermitage","St Clairsville","Steubenville","Triadelphia","Uniontown","Youngstown","Zanesville"]},"OHIO VALLEY":{"CENTRAL OHIO EAST":["Canal Winchester","Circleville","Heath","Hillsboro","London","Newark","Pataskala","Reynoldsburg","Sunbury","Sycamore Plaza","Washington Court House"],"CINCINNATI SOUTH":["Centennial","Eastgate","Fairfield","Harrison Avenue","Hebron","Highland Heights","Lawrenceburg","Newport","North Bend"],"INDY CITY":["Anderson","Carmel","Frankfort","Hazel Dell","Heartland","Marion","Muncie","Noblesville","West Lafayette","Zionsville"],"INDY GP":["Bargersville","Bloomington","Greenfield","Keystone","Martinsville","New Castle","Nora","Norgate","Rushville","Seymour","Shelbyville"],"MI/IN":["Chapel Ridge","Dupont","Elkhart","Kendallville","Milford","Rochester Hills","South Lyon","Warsaw"],"MICHIGAN":["Allendale","Big Rapids","Grand Haven","Grand Rapids","Greenville","Knapps Corner","Ludington","Muskegon","Northland","Three Rivers","Walker","West 48th"],"MID OHIO":["Ashland","Bellefontaine","Bucyrus","Delaware","Fremont","Marysville","Mt. Gilead","Mt. Vernon","Norwalk","Ontario","Westfield"],"OHIO SOUTHWEST":["Brandt Pike","Centerville","Hamilton","Lebanon","Oxford","Piqua","Sidney","South Main Street","Springboro","Springfield","Urbana","Wilmington","Xenia"]},"SOUTHEAST":{"ATLANTA":["Commerce","Dacula","Epps Bridge","Locust Grove","Peachtree City","Winder","Wrightsboro"],"ATLANTIC COAST":["Beaufort","Brunswick","Lowes Village","Macclenny","Savannah Crossing"],"CAROLINA EAST":["31st Ave","Clayton","Coastal Grand Mall","East Hanes","Fordham","Morehead City","Samet","Thomasville"],"CAROLINA WEST":["Augusta","Boiling Springs","Columbia","Gaffney","Kernersville","greenwood"],"FLORIDA":["Andover","Apopka","Granada","Ocala","Rolling Oaks","Seminole"],"NORTH GEORGIA":["Athens","Cartersville","Chapel Hill","Dalton","Marietta","Rome","Smyrna","Villa Rica"],"TN/VA":["Asheville","Elizabethton","Exit Seven","Kingston Pike","Knoxville","Morristown","Oak Ridge"]}},"North":{"NORTH CENTRAL":{"ATLANTA SOUTH":["Commerce","Dacula","Epps Bridge","Locust Grove","Peachtree City","Winder","Wrightsboro"],"CAROLINA EAST":["31st Ave","Clayton","Coastal Grand Mall","East Hanes","Fordham","Morehead City","Samet","Thomasville"],"CAROLINA WEST":["Augusta","Boiling Springs","Columbia","Gaffney","Kernersville","greenwood"],"FAYETTEVILLE":["31st Ave","Clayton","Coastal Grand Mall","East Hanes","Fordham","Morehead City","Samet","Thomasville"],"LAKESHORE":["Ashtabula","Clifton","Fremont","Garfield Heights","Green","Independence","Norwalk","Solon","Stow","Streetsboro","Twinsburg"],"MI/IN":["Chapel Ridge","Dupont","Elkhart","Kendallville","Milford","Rochester Hills","South Lyon","Warsaw"],"MICHIGAN":["Allendale","Big Rapids","Grand Haven","Grand Rapids","Greenville","Knapps Corner","Ludington","Muskegon","Northland","Three Rivers","Walker","West 48th"],"MID OHIO":["Ashland","Bellefontaine","Bucyrus","Delaware","Marysville","Mt. Gilead","Mt. Vernon","Ontario","Sunbury","Westfield","Zanesville"],"NORTH GEORGIA":["Athens","Cartersville","Chapel Hill","Dalton","Marietta","Rome","Smyrna","Villa Rica"],"STEEL VALLEY":["Alliance","Beaver Falls","Cambridge","Coshocton","Countryside","Hermitage","Triadelphia","Uniontown","Youngstown","Zanesville"],"TN/VA":["Asheville","Elizabethton","Exit Seven","Kingston Pike","Knoxville","Morristown","Oak Ridge"],"WINSTON-SALEM":["Augusta","Boiling Springs","Columbia","Gaffney","Kernersville","greenwood"]},"NORTHEAST":{"HUDSON":["Frederick","Hamburg","Lakeview","Moger","Morris","North Broadway","Washington"],"LONG ISLAND":["Baisley Blvd","Bethpage","Commack","East Islip","Hempstead","Jericho","New York Avenue","Rockaway","West Islip"],"MASSACHUSETTS":["Albany Turnpike","Billerica","Harwich","Haverhill","Malden","Methuen","North Street","River Road","Spencer"],"MID ATLANTIC EAST":["Big Elk","Marlboro","Middletown","Newark DE","Salisbury Blvd","West Ruark"],"MID ATLANTIC WEST":["Bristow","Buckeystown","Damascus","Lexington","Montanus","Village Center"],"PHILADELPHIA":["Commons","County Road","Crossing","Dilworthtown","Highway 35","Route 9","Summit Square","Yard Ville"],"QUEENS":["8th Avenue","Broadway","College Point","Elmont","Glen Oaks","Horace","Linden","Main Street","Ozone Park","Ridgewood","Springfield Blvd"],"STEEL VALLEY":["Alliance","Beaver Falls","Cambridge","Coshocton","Countryside","Hermitage","St Clairsville","Steubenville","Triadelphia","Uniontown","Youngstown"]},"OHIO VALLEY":{"CENTRAL OHIO EAST":["Bellefontaine","Canal Winchester","Chapel Ridge","Circleville","Dupont","Heath","Hillsboro","Kendallville","London","Mt. Vernon","Newark","Pataskala","Reynoldsburg","Sunbury","Sycamore Plaza","Washington Court House"],"CINCINNATI":["Centennial","Eastgate","Fairfield","Harrison Avenue","Hebron","Highland Heights","Lawrenceburg","Newport","North Bend"],"CINCINNATI SOUTH":["Centennial","Eastgate","Fairfield","Harrison Avenue","Hebron","Highland Heights","Jeffersonville","La Grange","Lawrenceburg","Mt Washington","New Circle","Newport","North Bend","Springhurst"],"COLUMBUS":["Bellefontaine","Canal Winchester","Circleville","Heath","Hillsboro","London","Newark","Pataskala","Reynoldsburg","Sycamore Plaza","Washington Court House"],"INDIANAPOLIS":["Evansville Burk","Frankfort","Hazel Dell","Heartland","Marion","Muncie","Nora","Norgate","Owensboro","Zionsville"],"INDY CITY":["Anderson","Carmel","Frankfort","Hazel Dell","Heartland","Marion","Muncie","Noblesville","West Lafayette","Zionsville"],"INDY GP":["Bargersville","Bloomington","Greenfield","Keystone","Martinsville","New Castle","Nora","Norgate","Rushville","Seymour","Shelbyville"],"KENTUCKY":["Evansville Burk","Jeffersonville","La Grange","Maysville","Mt Washington","New Circle","Owensboro","Springhurst","Winchester"],"MICHIGAN":["Big Rapids","Elkhart","Grand Haven","Greenville","Ludington","Muskegon","Northland","Rochester Hills","Three Rivers","Warsaw","West 48th"],"MISSISSIPPI RIVER VALLEY":["12th Street","Dubuque","Hannibal","Jeff City","Osage","Paducah","Rolla","Virginia Avenue"],"NEBRASKA":["180th Street","Altoona","Ames","Center","Council Bluffs","Grand Island","King Lane","Maple"],"OHIO SOUTHWEST":["Brandt Pike","Centerville","Hamilton","Hillsboro","Lebanon","Oxford","Piqua","Sidney","South Main Street","Springboro","Springfield","Urbana","Wilmington","Xenia"]}},"South":{"GULF COAST":{"ARKANSAS":["Hot Springs","Little Rock","Pine Bluff","Russellville","Searcy","Van Buren"],"ATLANTA":["Commerce","Dacula","Epps Bridge","Locust Grove","Peachtree City","Winder","Wrightsboro"],"ATLANTIC COAST":["Beaufort","Brunswick","Lowes Village","Macclenny","Savannah Crossing"],"FLORIDA":["Andover","Apopka","Granada","Ocala","Rolling Oaks","Seminole"],"HOUSTON NORTH":["Crosby","Eva Plaza","Huntsville","Louetta","Magnolia","Mont Belvieu","Sawdust","Tomball","Willis"],"HOUSTON SOUTH":["529","Angleton","Bay City","Cypress","Lake Jackson","Mason","River Oaks","Texas City","Waterview"],"KANSAS":["Broken Arrow","George Washington","Peoria Ave","Ponca City","Riverside Pkwy","Sapulpa","Schilling"],"LOUISIANA EAST":["Airline","Claiborne","Covington","Gentilly","Hammond","Rangeline","Ridgeland","Thibodaux","Uptown","Veterans"],"LOUISIANA WEST":["Alexandria","Denham Springs","Hammond","Lafayette","New Iberia","North Mall","Oneal","Pinhook","Prairieville"],"NORTH GEORGIA":["Athens","Cartersville","Chapel Hill","Dalton","Marietta","Rome","Smyrna","Villa Rica"]},"SOUTH CENTRAL":{"ATX CENTRAL":["Belterra","Bryan","Buda","College Station","Creekside","New Braunfels","Texas Ave","West Woods"],"ATX NORTH":["Copperas Cove","Killeen","Killeen Mall","Manor","Marble Falls","Round Rock","Taylor"],"DFW CENTRAL":["28th Street","Cooper Street","Duncanville","Ennis","Golden Triangle","Red Oak","Rufe Snow"],"DFW NORTH":["Custer","Dallas Pkwy","Independence Pkwy","Richardson TX","Stonebrook","Walnut"],"DFW WEST":["Bedford","Chisholm Trail","Clifford","Eastchase","Weatherford"],"SATX NORTH":["Cibolo","Kerrville","La Cantera","Schertz","Seguin","Thousand Oaks"],"SATX SOUTH":["HEB-Lytle","Kingsville","Marbach","Palo Alto","Rigsby Avenue","SW Military","South Park Mall","Valley Hi"]},"SOUTHWEST":{"ARIZONA SOUTH":["Central","Cochise","Grant Road","Harrison Plaza","Las Plazas","Nogales South","Tucson Fashion Park"],"AZ-EAST":["Apache","Combs","Coolidge","Power","Red Mountain","Stapley","Talking"],"AZ-WEST":["303 & Waddell","99th Avenue","Central","Desert","Laveen","Mcdowell","Northern Avenue","Union"],"COLORADO":["Cheyenne","Dillon","Falcon","Fountain","Frontier","Highpointe","Northgate","Peoria"],"DESERT MOUNTAIN":["Farmington","Flagstaff","Highway 89","Prescott Valley East","Sedona"],"KANSAS":["Broken Arrow","George Washington","Peoria Ave","Ponca City","Riverside Pkwy","Sapulpa","Schilling"],"OKC":["Chickasha","Garth Brooks Blvd","Market Place","Mustang","Owen Garriott","Plainview","S. Georgia","Wrangler"],"UTAH/CO":["Draper","Glenwood Springs","Grand Junction","Layton","Lehi","Vernal"]}},"West":{"GULF COAST":{"ATX CENTRAL":["Belterra","Bryan","Buda","College Station","Creekside","Highway 71","New Braunfels","Texas Ave","West Woods"],"ATX NORTH":["Copperas Cove","Killeen","Killeen Mall","Manor","Marble Falls","Round Rock","Taylor"],"HOUSTON NORTH":["529","Crosby","Cypress","Eva Plaza","HEB-Mont Belvieu","Huntsville","Kingwood","Louetta","Magnolia","Mont Belvieu","Sawdust","Tomball","Tuckerton","Willis"],"HOUSTON SOUTH":["Alice","Angleton","Bay City","Beeville","Bellaire","Highway 6","Lake Jackson","Mason","Parkwood","River Oaks","Texas City","Victoria","Waterview"],"LOUISIANA EAST":["Airline","Claiborne","Covington","Gentilly","Hammond","Rangeline","Ridgeland","Thibodaux","Uptown","Veterans"],"LOUISIANA WEST":["Alexandria","Denham Springs","Lafayette","New Iberia","North Mall","Oneal","Pinhook","Prairieville"],"SATX NORTH":["Cibolo","Kerrville","La Cantera","Schertz","Seguin","South Main","Spring Branch","Thousand Oaks"],"SATX SOUTH":["Eagle Pass","HEB-Lytle","Kingsville","Marbach","Palo Alto","Rigsby Avenue","SW Military","South Bibb","South Park Mall","Uvalde","Valley Hi"],"SOUTH TEXAS":["Alice","Beeville","Elsa","North Conway","Ocean Blvd","Portland","Rockport","Stegner","Viejo"]},"MIDWEST":{"ARKANSAS":["Hot Springs","Little Rock","Pine Bluff","Russellville","Searcy","Van Buren"],"KANSAS":["Broken Arrow","George Washington","Peoria Ave","Ponca City","Riverside Pkwy","Sapulpa","Schilling"],"KENTUCKY":["Evansville Burk","Jeffersonville","La Grange","Maysville","Mt Washington","New Circle","Owensboro","Springhurst","Winchester"],"MISSISSIPPI RIVER VALLEY":["12th Street","Dubuque","Hannibal","Jeff City","Osage","Paducah","Rolla","Virginia Avenue"],"NEBRASKA":["180th Street","Altoona","Ames","Center","Council Bluffs","Grand Island","King Lane","Maple"],"OKC":["Ardmore","Bartlesville","Chickasha","Garth Brooks Blvd","Market Place","Mustang","Owen Garriott","Wrangler"]},"SOUTHWEST":{"ARIZONA SOUTH":["Cochise","Grant Road","Harrison Plaza","Las Plazas","Nogales South","Tucson Fashion Park"],"AZ-EAST":["Apache","Combs","Coolidge","Power","Red Mountain","Stapley","Talking"],"AZ-WEST":["303 & Waddell","99th Avenue","Central","Desert","Laveen","Mcdowell","Northern Avenue","Union"],"COLORADO":["Cheyenne","Dillon","Falcon","Fountain","Frontier","Highpointe","Northgate","Peoria"],"DESERT MOUNTAIN":["Farmington","Flagstaff","Highway 89","Prescott Valley East","Sedona"],"DFW NORTH":["Custer","Dallas Pkwy","Independence Pkwy","Jefferson","Pines Road","Richardson TX","Stonebrook","Walnut","Wesley"],"DFW SOUTH":["Bedford","Cooper Street","Corsicana Hwy","Duncanville","Eastchase","Ennis","Red Oak","Seventh Ave"],"DFW WEST":["28th Street","Chisholm Trail","Cleburne","Clifford","Golden Triangle","Granbury","Rufe Snow","Stephenville","Weatherford"],"PAN HANDLE":["Big Spring","Midland","Odessa","Olton","Plainview","S. Georgia","Walmart Court"],"UTAH/CO":["Draper","Glenwood Springs","Grand Junction","Layton","Lehi","Vernal"]}}};

  const areaSel    = document.getElementById('areaSelect');
  const regionSel  = document.getElementById('regionSelect');
  const districtSel= document.getElementById('districtSelect');
  const storeSel   = document.getElementById('storeSelect');
  const goDort     = document.getElementById('goDort');

  function fill(el, arr, ph){
    if(!el) return;
    el.innerHTML = `<option disabled selected>${ph||'Select'}</option>`;
    (arr||[]).forEach(v=> el.insertAdjacentHTML('beforeend', `<option value="${v}">${v}</option>`));
  }
  function setDisabled(el, on){
    if(!el) return;
    el.disabled = !!on;
    el.style.opacity = on ? 0.85 : 1;
  }
  function saveSel(){
    if(areaSel) localStorage.setItem('sel_area', areaSel.value || '');
    if(regionSel) localStorage.setItem('sel_region', regionSel.value || '');
    if(districtSel) localStorage.setItem('sel_district', districtSel.value || '');
    if(storeSel) localStorage.setItem('sel_store', storeSel.value || '');
  }

  function onArea(){
    saveSel();
    const a = areaSel.value;
    if(!a){
      fill(regionSel, [], 'Select Region'); setDisabled(regionSel,true);
      fill(districtSel, [], 'Select District'); setDisabled(districtSel,true);
      fill(storeSel, [], 'Select Store'); setDisabled(storeSel,true);
      if(goDort) goDort.disabled = true;
      return;
    }
    const regions = Object.keys(DATA_TREE[a] || {});
    fill(regionSel, regions, 'Select Region'); setDisabled(regionSel, regions.length===0);
    fill(districtSel, [], 'Select District'); setDisabled(districtSel, true);
    fill(storeSel, [], 'Select Store'); setDisabled(storeSel, true);
    localStorage.removeItem('sel_region'); localStorage.removeItem('sel_district'); localStorage.removeItem('sel_store');
    if(goDort) goDort.disabled = true;
  }

  function onRegion(){
    saveSel();
    const a = areaSel.value, r = regionSel.value;
    if(!a || !r){
      fill(districtSel, [], 'Select District'); setDisabled(districtSel,true);
      fill(storeSel, [], 'Select Store'); setDisabled(storeSel,true);
      if(goDort) goDort.disabled = true;
      return;
    }
    const districts = Object.keys((DATA_TREE[a] && DATA_TREE[a][r]) || {});
    fill(districtSel, districts, 'Select District'); setDisabled(districtSel, districts.length===0);
    fill(storeSel, [], 'Select Store'); setDisabled(storeSel, true);
    localStorage.removeItem('sel_district'); localStorage.removeItem('sel_store');
    if(goDort) goDort.disabled = true;
  }

  function onDistrict(){
    saveSel();
    const a = areaSel.value, r = regionSel.value, d = districtSel.value;
    if(!a || !r || !d){
      fill(storeSel, [], 'Select Store'); setDisabled(storeSel,true);
      if(goDort) goDort.disabled = true;
      return;
    }
    const stores = (DATA_TREE[a] && DATA_TREE[a][r] && DATA_TREE[a][r][d]) ? DATA_TREE[a][r][d] : [];
    fill(storeSel, stores, 'Select Store'); setDisabled(storeSel, stores.length===0);
    localStorage.removeItem('sel_store');
    if(goDort) goDort.disabled = true;
  }

  function onStore(){
    saveSel();
    if(goDort){
      goDort.disabled = !storeSel.value;
    }
  }

  function restore(){
    const areas = Object.keys(DATA_TREE);
    fill(areaSel, areas, 'Select Area');
    setDisabled(areaSel, areas.length===0);

    const a = localStorage.getItem('sel_area');
    const r = localStorage.getItem('sel_region');
    const d = localStorage.getItem('sel_district');
    const s = localStorage.getItem('sel_store');

    if (a && DATA_TREE[a]) {
      areaSel.value = a; onArea();
      if (r && DATA_TREE[a][r]) {
        regionSel.value = r; onRegion();
        if (d && (DATA_TREE[a][r][d])) {
          districtSel.value = d; onDistrict();
          if (s) {
            const exists = Array.from(storeSel.options).some(o => o.value===s);
            if (exists) { storeSel.value = s; if(goDort) goDort.disabled = false; }
          }
        }
      }
    }
  }

  if(areaSel) areaSel.addEventListener('change', onArea);
  if(regionSel) regionSel.addEventListener('change', onRegion);
  if(districtSel) districtSel.addEventListener('change', onDistrict);
  if(storeSel) storeSel.addEventListener('change', onStore);

  restore();
})();