/* ========= Sales Tracker App (stable revert) ========= */
const state = { store: localStorage.getItem('sel_store') || '', cfg:{ p360:60, tlife:70, vaf:19 } };
const byId = id => document.getElementById(id);
const setScreen = html => { const el = byId('app'); if (el){ el.innerHTML = html; window.scrollTo({top:0, behavior:'instant'});} };
const num = v => parseFloat(v||0) || 0;
const int = v => parseInt(v||0) || 0;
const money = v => '$' + (num(v).toFixed(2));
const todayStr = () => new Date().toLocaleDateString();

/* If no store is chosen at root, allow user to proceed anyway (no redirect) */
function metric(label,id1,id2,p1='Attainment',p2='Goal'){
  const v1 = localStorage.getItem(id1) || '';
  const v2 = localStorage.getItem(id2) || '';
  return `
    <div class="metric sec">
      <label>${label}</label>
      <div class="pair">
        <input id="${id1}" type="number" placeholder="${p1}" value="${v1}" oninput="localStorage.setItem('${id1}',this.value)">
        <input id="${id2}" type="number" placeholder="${p2}" value="${v2}" oninput="localStorage.setItem('${id2}',this.value)">
      </div>
    </div>`;
}

function showDORT(){
  setScreen(`
    <h2>DORT ${state.store?`— ${state.store}`:''}</h2>
    ${metric('Voice','d_v_att','d_v_goal')}
    ${metric('BTS','d_b_att','d_b_goal')}
    ${metric('TFB','d_t_att','d_t_goal')}
    ${metric('Accessories','d_a_att','d_a_goal')}
    <div class="buttons">
      <button class="back" onclick="location.href='/'">← Store</button>
      <button class="next" onclick="showSORT()">SORT →</button>
    </div>
  `);
}
function showSORT(){
  setScreen(`
    <h2>SORT ${state.store?`— ${state.store}`:''}</h2>
    ${metric('Voice','s_v_att','s_v_goal')}
    ${metric('BTS','s_b_att','s_b_goal')}
    ${metric('TFB','s_t_att','s_t_goal')}
    ${metric('Accessories','s_a_att','s_a_goal')}
    <div class="buttons">
      <button class="back" onclick="showDORT()">← DORT</button>
      <button class="next" onclick="showRevenue()">Revenue →</button>
    </div>
  `);
}
function showRevenue(){
  setScreen(`
    <h2>Revenue ${state.store?`— ${state.store}`:''}</h2>
    ${metric('P360','p_opp','p_pct','Opportunities','Attach %')}
    ${metric('VAF','v_opp','v_total','Opportunities','Total Revenue')}
    <div class="buttons">
      <button class="back" onclick="showSORT()">← SORT</button>
      <button class="next" onclick="showCSAT()">CSAT →</button>
    </div>
  `);
}
function showCSAT(){
  setScreen(`
    <h2>CSAT ${state.store?`— ${state.store}`:''}</h2>
    ${metric('CSAT','c_score','c_surveys','Current Score (0–10)','Surveys Taken')}
    <div class="buttons">
      <button class="back" onclick="showRevenue()">← Revenue</button>
      <button class="next" onclick="showTL()">T-Life →</button>
    </div>
  `);
}
function showTL(){
  setScreen(`
    <h2>T-Life ${state.store?`— ${state.store}`:''}</h2>
    ${metric('T-Life','t2_att','t2_opp','Attainment %','Opportunities')}
    <div class="buttons">
      <button class="back" onclick="showCSAT()">← CSAT</button>
      <button class="next" onclick="showGoals()">Daily Goals →</button>
    </div>
  `);
}
function showGoals(){
  setScreen(`
    <h2>Daily Goals ${state.store?`— ${state.store}`:''}</h2>
    <div class="metric sec"><label>Voice</label><input id="g_voice" type="number" placeholder="Voice Goal" value="${localStorage.getItem('g_voice')||''}" oninput="localStorage.setItem('g_voice',this.value)"></div>
    <div class="metric sec"><label>BTS</label><input id="g_bts" type="number" placeholder="BTS Goal" value="${localStorage.getItem('g_bts')||''}" oninput="localStorage.setItem('g_bts',this.value)"></div>
    <div class="metric sec"><label>Accessories</label><input id="g_acc" type="number" placeholder="Accessories Goal" value="${localStorage.getItem('g_acc')||''}" oninput="localStorage.setItem('g_acc',this.value)"></div>
    <div class="metric sec"><label>TFB</label><input id="g_tfb" type="number" placeholder="TFB Goal" value="${localStorage.getItem('g_tfb')||''}" oninput="localStorage.setItem('g_tfb',this.value)"></div>
    <div class="buttons">
      <button class="back" onclick="showTL()">← T-Life</button>
      <button class="next" onclick="showSummary()">Summary →</button>
    </div>
  `);
}
function showSummary(){
  const dateStr = todayStr();
  const store = state.store || '—';
  const comb = (aD,gD,aS,gS) => {
    const att = int(localStorage.getItem(aD)) + int(localStorage.getItem(aS));
    const goal= int(localStorage.getItem(gD)) + int(localStorage.getItem(gS));
    const pct = goal>0 ? Math.round((att/goal)*100) : 0;
    const gap = goal - att; // original convention
    return {att,goal,pct,gap};
  };
  const voice = comb('d_v_att','d_v_goal','s_v_att','s_v_goal');
  const bts   = comb('d_b_att','d_b_goal','s_b_att','s_b_goal');
  const tfb   = comb('d_t_att','d_t_goal','s_t_att','s_t_goal');
  const acc   = comb('d_a_att','d_a_goal','s_a_att','s_a_goal');
  const pOpp=int(localStorage.getItem('p_opp'));
  const pPctIn=Math.max(0, Math.min(100, num(localStorage.getItem('p_pct'))));
  const pAtt=Math.round(pOpp*(pPctIn/100));
  const tP=(state.cfg.p360)/100;
  const pNeed=Math.max(0, Math.ceil((tP*pOpp - pAtt) / (1 - tP)));
  const pPctRounded = Math.round(pPctIn);
  const cAvg=num(localStorage.getItem('c_score'));
  const cN =int(localStorage.getItem('c_surveys'));
  const cNeed=cAvg>=9.5?0:Math.max(0, Math.ceil(2 * cN * (9.5 - cAvg)));
  const tlPct=Math.max(0, Math.min(100, num(localStorage.getItem('t2_att'))));
  const tlOpp=int(localStorage.getItem('t2_opp'));
  const tlSuc=Math.round(tlOpp*(tlPct/100));
  const tT=(state.cfg.tlife)/100;
  const tlNeed=Math.max(0, Math.ceil((tT*tlOpp - tlSuc) / (1 - tT)));
  const vOpp=int(localStorage.getItem('v_opp'));
  const vTot=num(localStorage.getItem('v_total'));
  const vTarget=state.cfg.vaf;
  const needTotal=vTarget*vOpp;
  const vGap=Math.max(0, needTotal - vTot);
  const mrc=vOpp>0 ? (vTot/vOpp) : 0;

  const bandPct   = p => (num(p)>=90?'ok':(num(p)>=60?'warn':'bad'));
  const bandGap   = g => (num(g)<=0?'ok':'bad');
  const bandScore = s => (num(s)>=9.5?'ok':(num(s)>=9.0?'warn':'bad'));
  const bandNeeded= n => (num(n)===0?'ok':'bad');
  const bandMrc   = (m,t) => (num(m)>=num(t)?'ok':((num(t)-num(m))<=1?'warn':'bad'));
  const fmtGap = v => v>0?`+${v}`:`${v}`;

  const head = `
    <div class="sum-head">
      <div class="sum-date">📅 ${dateStr}</div>
      <div class="sum-store">📍 ${store}</div>
    </div>`;

  const cardTopLeft = `<div class="sec tile tall">
    <div style="font-weight:800; margin-bottom:8px;">DORT + SORT</div>
    <div class="kv"><span>Voice</span>
      <span><span class="status ${bandGap(voice.gap)}">Gap: ${fmtGap(voice.gap)}</span> <span class="status ${bandPct(voice.pct)}">${voice.pct}%</span></span>
    </div>
    <div class="kv"><span>BTS</span>
      <span><span class="status ${bandGap(bts.gap)}">Gap: ${fmtGap(bts.gap)}</span> <span class="status ${bandPct(bts.pct)}">${bts.pct}%</span></span>
    </div>
    <div class="kv"><span>TFB</span>
      <span><span class="status ${bandGap(tfb.gap)}">Gap: ${fmtGap(tfb.gap)}</span> <span class="status ${bandPct(tfb.pct)}">${tfb.pct}%</span></span>
    </div>
    <div class="kv"><span>Accessories</span>
      <span><span class="status ${bandGap(acc.gap)}">Gap: ${fmtGap(acc.gap)}</span> <span class="status ${bandPct(acc.pct)}">${acc.pct}%</span></span>
    </div>
  </div>`;

  const cardTopRight = `<div class="sec tile tall">
    <div style="font-weight:800; margin-bottom:8px;">🎯 Daily Goals</div>
    <div class="kv"><span>Voice</span><span><b>${localStorage.getItem('g_voice') || '—'}</b></span></div>
    <div class="kv"><span>BTS</span><span><b>${localStorage.getItem('g_bts') || '—'}</b></span></div>
    <div class="kv"><span>TFB</span><span><b>${localStorage.getItem('g_tfb') || '—'}</b></span></div>
    <div class="kv"><span>Accessories</span><span><b>${localStorage.getItem('g_acc') || '—'}</b></span></div>
  </div>`;

  const cardP360 = `<div class="sec tile short">
    <div style="font-weight:800; margin-bottom:8px;">💡 P360</div>
    <div class="kv"><span>% to Goal</span><span class="status ${bandPct(pPctRounded)}">${pPctRounded}%</span></div>
    <div class="kv"><span>Target</span><span>${state.cfg.p360}%</span></div>
    <div class="kv"><span>Needed</span><span class="status ${bandNeeded(pNeed)}">${pNeed} tx</span></div>
  </div>`;

  const cardCSAT = `<div class="sec tile short">
    <div style="font-weight:800; margin-bottom:8px;">⭐ CSAT</div>
    <div class="kv"><span>Score</span><span class="status ${bandScore(cAvg)}">${isNaN(cAvg)?'—':cAvg}</span></div>
    <div class="kv"><span>Target</span><span>9.5</span></div>
    <div class="kv"><span>Needed</span><span class="status ${bandNeeded(cNeed)}">${cNeed} perfect 10s</span></div>
  </div>`;

  const cardTLife = `<div class="sec tile short">
    <div style="font-weight:800; margin-bottom:8px;">📱 T-Life</div>
    <div class="kv"><span>Attainment</span><span class="status ${bandPct(tlPct)}">${Math.round(tlPct)}%</span></div>
    <div class="kv"><span>Target</span><span>${state.cfg.tlife}%</span></div>
    <div class="kv"><span>Needed</span><span class="status ${bandNeeded(tlNeed)}">${tlNeed} opportunities</span></div>
  </div>`;

  const cardVAF = `<div class="sec tile short">
    <div style="font-weight:800; margin-bottom:8px;">💵 VAF</div>
    <div class="kv"><span>MRC</span><span class="status ${bandMrc(mrc,vTarget)}">${money(mrc)}</span></div>
    <div class="kv"><span>Target</span><span>${money(vTarget)}/op</span></div>
    <div class="kv"><span>Gap</span><span class="status ${bandGap(vGap)}">${money(vGap)}</span></div>
  </div>`;

  setScreen(`
    ${head}
    <div class="sum-grid">
      ${cardTopLeft}
      ${cardTopRight}
      ${cardP360}
      ${cardCSAT}
      ${cardTLife}
      ${cardVAF}
    </div>
    <div class="buttons">
      <button class="back" onclick="showGoals()">← Daily Goals</button>
      <button class="back" onclick="window.print()">🖨 Print</button>
    </div>
  `);
}

/* Daily reset only (preserves user prefs); leave logic otherwise untouched */
(function init(){
  const todayKey = new Date().toISOString().slice(0,10);
  if(localStorage.getItem('lastDay')!==todayKey){
    for (const k in localStorage) {
      if (k && (k.startsWith('d_') || k.startsWith('s_') || k.startsWith('p_') || k.startsWith('v_') || k.startsWith('c_') || k.startsWith('t2_') || k.startsWith('g_'))) {
        try { localStorage.removeItem(k); } catch(e){}
      }
    }
    localStorage.setItem('lastDay', todayKey);
  }
  showDORT();
})();
