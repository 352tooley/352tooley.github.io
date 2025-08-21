/* app/app.js — multi-screen flow
   - Starts at DORT (uses saved store from root)
   - Screens: DORT → SORT → Revenue → CSAT → T-Life → Daily Goals → Summary
   - No store re-selection here; if missing, link back to root
*/

(function(){
  const byId = (id)=>document.getElementById(id);
  const app = byId('app');

  // Ensure store exists from root
  const store = localStorage.getItem('selectedStore') || localStorage.getItem('sel_store');
  const area  = localStorage.getItem('selectedArea')  || localStorage.getItem('sel_area');
  const region= localStorage.getItem('selectedRegion')|| localStorage.getItem('sel_region');
  const dist  = localStorage.getItem('selectedDistrict')|| localStorage.getItem('sel_district');
  if(!store){ byId('warnRoot').style.display='block'; }

  const state = { cfg:{ p360:60, tlife:70, vaf:19 } };

  const num = v => parseFloat(v||0) || 0;
  const int = v => parseInt(v||0) || 0;
  const money = v => '$' + (num(v).toFixed(2));
  const pct = (a,b)=> b>0 ? Math.round((a/b)*100) : 0;
  const bandPct = p => (p>=90?'ok':(p>=60?'warn':'bad'));
  const bandGap = g => (g<=0?'ok':'bad'));
  function inputRow(label, id1, ph1, id2, ph2){
    return `<div class="sec">
      <label>${label}</label>
      <div class="pair">
        <input id="${id1}" type="number" placeholder="${ph1}" value="${localStorage.getItem(id1)||''}" oninput="localStorage.setItem('${id1}',this.value)">
        <input id="${id2}" type="number" placeholder="${ph2}" value="${localStorage.getItem(id2)||''}" oninput="localStorage.setItem('${id2}',this.value)">
      </div>
    </div>`;
  }
  function header(title){
    return `<h1>${area||'—'} • ${region||'—'} • ${dist||'—'} • ${store||'—'}</h1><h2>${title}</h2>`;
  }
  function nav(prev,next, prevLabel,nextLabel){
    return `<div class="buttons">
      ${prev ? `<button class="btn back" onclick="${prev}">← ${prevLabel}</button>`:''}
      ${next ? `<button class="btn next" onclick="${next}">${nextLabel} →</button>`:''}
    </div>`;
  }

  window.showDORT = function(){
    app.innerHTML = header('DORT')+
      inputRow('Voice','d_v_att','Attainment','d_v_goal','Goal')+
      inputRow('BTS','d_b_att','Attainment','d_b_goal','Goal')+
      inputRow('TFB','d_t_att','Attainment','d_t_goal','Goal')+
      inputRow('Accessories','d_a_att','Attainment','d_a_goal','Goal')+
      nav('', 'showSORT()','', 'SORT');
  };
  window.showSORT = function(){
    app.innerHTML = header('SORT')+
      inputRow('Voice','s_v_att','Attainment','s_v_goal','Goal')+
      inputRow('BTS','s_b_att','Attainment','s_b_goal','Goal')+
      inputRow('TFB','s_t_att','Attainment','s_t_goal','Goal')+
      inputRow('Accessories','s_a_att','Attainment','s_a_goal','Goal')+
      nav('showDORT()','showRevenue()','DORT','Revenue');
  };
  window.showRevenue = function(){
    app.innerHTML = header('Revenue')+
      inputRow('P360','p_opp','Opportunities','p_pct','Attach %')+
      inputRow('VAF','v_opp','Opportunities','v_total','Total Revenue')+
      nav('showSORT()','showCSAT()','SORT','CSAT');
  };
  window.showCSAT = function(){
    app.innerHTML = header('CSAT')+
      inputRow('CSAT','c_score','Current Score (0–10)','c_surveys','Surveys Taken')+
      nav('showRevenue()','showTLife()','Revenue','T‑Life');
  };
  window.showTLife = function(){
    app.innerHTML = header('T‑Life')+
      inputRow('T‑Life','t2_att','Attainment %','t2_opp','Opportunities')+
      nav('showCSAT()','showGoals()','CSAT','Daily Goals');
  };
  window.showGoals = function(){
    app.innerHTML = header('Daily Goals')+`
      <div class="sec"><label>Voice</label><input id="g_voice" type="number" placeholder="Voice Goal" value="${localStorage.getItem('g_voice')||''}" oninput="localStorage.setItem('g_voice',this.value)"></div>
      <div class="sec"><label>BTS</label><input id="g_bts" type="number" placeholder="BTS Goal" value="${localStorage.getItem('g_bts')||''}" oninput="localStorage.setItem('g_bts',this.value)"></div>
      <div class="sec"><label>Accessories</label><input id="g_acc" type="number" placeholder="Accessories Goal" value="${localStorage.getItem('g_acc')||''}" oninput="localStorage.setItem('g_acc',this.value)"></div>
      <div class="sec"><label>TFB</label><input id="g_tfb" type="number" placeholder="TFB Goal" value="${localStorage.getItem('g_tfb')||''}" oninput="localStorage.setItem('g_tfb',this.value)"></div>
    `+
      nav('showTLife()','showSummary()','T‑Life','Summary');
  };

  function pill(content, cls){ return `<span class="status ${cls}">${content}</span>`; }

  window.showSummary = function(){
    // combine
    function comb(aD,gD,aS,gS){ const att=int(localStorage.getItem(aD))+int(localStorage.getItem(aS)); const goal=int(localStorage.getItem(gD))+int(localStorage.getItem(gS)); return {att,goal,pct:pct(att,goal),gap:goal-att}; }
    const voice = comb('d_v_att','d_v_goal','s_v_att','s_v_goal');
    const bts   = comb('d_b_att','d_b_goal','s_b_att','s_b_goal');
    const tfb   = comb('d_t_att','d_t_goal','s_t_att','s_t_goal');
    const acc   = comb('d_a_att','d_a_goal','s_a_att','s_a_goal');

    // p360
    const pOpp=int(localStorage.getItem('p_opp')); const pPct=Math.max(0,Math.min(100,num(localStorage.getItem('p_pct')))); const pAtt=Math.round(pOpp*(pPct/100)); const tP=0.60; const pNeed=Math.max(0, Math.ceil((tP*pOpp - pAtt) / (1 - tP)));

    // csat
    const cAvg=num(localStorage.getItem('c_score')); const cN=int(localStorage.getItem('c_surveys')); const cNeed=(cAvg>=9.5)?0:Math.max(0, Math.ceil(2*cN*(9.5-cAvg)));

    // tlife
    const tlPct=Math.max(0, Math.min(100, num(localStorage.getItem('t2_att')))); const tlOpp=int(localStorage.getItem('t2_opp')); const tlSuc=Math.round(tlOpp*(tlPct/100)); const tT=0.70; const tlNeed=Math.max(0, Math.ceil((tT*tlOpp - tlSuc) / (1 - tT)));

    // vaf
    const vOpp=int(localStorage.getItem('v_opp')); const vTot=num(localStorage.getItem('v_total')); const vTarget=19; const needTotal=vTarget*vOpp; const vGap=Math.max(0, needTotal - vTot); const mrc=vOpp>0?(vTot/vOpp):0;

    app.innerHTML = header('Summary')+`
      <div class="sum-grid">
        <div class="sec"><strong>DORT + SORT</strong>
          <div class="kv"><span>Voice</span><span>${pill('Gap: '+(voice.gap>0?('+'+voice.gap):voice.gap), bandGap(voice.gap))} ${pill(voice.pct+'%', bandPct(voice.pct))}</span></div>
          <div class="kv"><span>BTS</span><span>${pill('Gap: '+(bts.gap>0?('+'+bts.gap):bts.gap), bandGap(bts.gap))} ${pill(bts.pct+'%', bandPct(bts.pct))}</span></div>
          <div class="kv"><span>TFB</span><span>${pill('Gap: '+(tfb.gap>0?('+'+tfb.gap):tfb.gap), bandGap(tfb.gap))} ${pill(tfb.pct+'%', bandPct(tfb.pct))}</span></div>
          <div class="kv"><span>Accessories</span><span>${pill('Gap: '+(acc.gap>0?('+'+acc.gap):acc.gap), bandGap(acc.gap))} ${pill(acc.pct+'%', bandPct(acc.pct))}</span></div>
        </div>
        <div class="sec"><strong>Daily Goals</strong>
          <div class="kv"><span>Voice</span><span><b>${localStorage.getItem('g_voice')||'—'}</b></span></div>
          <div class="kv"><span>BTS</span><span><b>${localStorage.getItem('g_bts')||'—'}</b></span></div>
          <div class="kv"><span>TFB</span><span><b>${localStorage.getItem('g_tfb')||'—'}</b></span></div>
          <div class="kv"><span>Accessories</span><span><b>${localStorage.getItem('g_acc')||'—'}</b></span></div>
        </div>
        <div class="sec"><strong>P360</strong>
          <div class="kv"><span>% to Goal</span><span>${pill(Math.round(pPct)+'%', bandPct(Math.round(pPct)))}</span></div>
          <div class="kv"><span>Target</span><span>60%</span></div>
          <div class="kv"><span>Needed</span><span>${pill(pNeed+' tx', pNeed===0?'ok':'bad')}</span></div>
        </div>
        <div class="sec"><strong>CSAT</strong>
          <div class="kv"><span>Score</span><span>${pill(isNaN(cAvg)?'—':cAvg, (cAvg>=9.5?'ok':(cAvg>=9?'warn':'bad')))}</span></div>
          <div class="kv"><span>Target</span><span>9.5</span></div>
          <div class="kv"><span>Needed</span><span>${pill(cNeed+' perfect 10s', cNeed===0?'ok':'bad')}</span></div>
        </div>
        <div class="sec"><strong>T‑Life</strong>
          <div class="kv"><span>Attainment</span><span>${pill(Math.round(tlPct)+'%', bandPct(Math.round(tlPct)))}</span></div>
          <div class="kv"><span>Target</span><span>70%</span></div>
          <div class="kv"><span>Needed</span><span>${pill(tlNeed+' opportunities', tlNeed===0?'ok':'bad')}</span></div>
        </div>
        <div class="sec"><strong>VAF</strong>
          <div class="kv"><span>MRC</span><span>${pill(money(mrc), (mrc>=19?'ok':((19-mrc)<=1?'warn':'bad')))}</span></div>
          <div class="kv"><span>Target</span><span>$19/op</span></div>
          <div class="kv"><span>Gap</span><span>${pill(money(vGap), vGap<=0?'ok':'bad')}</span></div>
        </div>
      </div>
      <div class="buttons" style="margin-top:14px">
        <button class="btn back" onclick="showGoals()">← Daily Goals</button>
        <button class="btn back" onclick="window.print()">🖨 Print</button>
      </div>
    `;
  };

  // Start at DORT
  window.showDORT();
})();