
/* ========= Sales Tracker App (app.js) ========= */
/* State & utilities */
const AppState = {
  store: localStorage.getItem('sel_store') || '',
  cfg: { p360: 60, tlife: 70, vaf: 19 }
};

const $ = (id) => document.getElementById(id);
const setView = (html) => { const root = $('app'); if (root) { root.innerHTML = html; window.scrollTo({top:0, behavior:'smooth'});} };

const pf = (v) => parseFloat(v || 0) || 0;
const pi = (v) => parseInt(v || 0) || 0;
const pct = (v) => Math.round(pf(v));
const money = (v) => '$' + pf(v).toFixed(2);
const today = () => new Date().toLocaleDateString();

/* Bands for summary pills */
const bandPct   = p => (pf(p)>=90?'ok':(pf(p)>=60?'warn':'bad'));
const bandGap   = g => (pf(g)<=0?'ok':'bad');
const bandScore = s => (pf(s)>=9.5?'ok':(pf(s)>=9.0?'warn':'bad'));
const bandNeed  = n => (pf(n)===0?'ok':'bad');
const bandMRC   = (m,t) => (pf(m)>=pf(t)?'ok':((pf(t)-pf(m))<=1?'warn':'bad'));

/* Gap formatting:
   New rule -> "-" means under (gap), "+" means over (exceed). */
const fmtGap = (v) => {
  if (pf(v) > 0) return '-' + Math.abs(pi(v));       // under goal
  if (pf(v) < 0) return '+' + Math.abs(pi(v));       // over goal
  return '0';
};
const fmtGapMoney = (v) => {
  if (pf(v) > 0) return '-' + money(v);
  if (pf(v) < 0) return '+' + money(Math.abs(v));
  return money(0);
};

/* Metric input block */
function metric(label, id1, id2, p1='Attainment', p2='Goal'){
  const v1 = localStorage.getItem(id1) || '';
  const v2 = localStorage.getItem(id2) || '';
  return `
    <div class="metric">
      <label>${label}</label>
      <div class="pair">
        <input id="${id1}" type="number" placeholder="${p1}" value="${v1}" oninput="localStorage.setItem('${id1}',this.value)">
        <input id="${id2}" type="number" placeholder="${p2}" value="${v2}" oninput="localStorage.setItem('${id2}',this.value)">
      </div>
    </div>`;
}

/* Screens */
function showDORT(){
  const title = AppState.store ? ` — ${AppState.store}` : '';
  setView(`
    <h2>DORT${title}</h2>
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
  const title = AppState.store ? ` — ${AppState.store}` : '';
  setView(`
    <h2>SORT${title}</h2>
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
  const title = AppState.store ? ` — ${AppState.store}` : '';
  setView(`
    <h2>Revenue${title}</h2>
    ${metric('P360','p_opp','p_pct','Opportunities','Attach %')}
    ${metric('VAF','v_opp','v_total','Opportunities','Total Revenue')}
    <div class="buttons">
      <button class="back" onclick="showSORT()">← SORT</button>
      <button class="next" onclick="showCSAT()">CSAT →</button>
    </div>
  `);
}

function showCSAT(){
  const title = AppState.store ? ` — ${AppState.store}` : '';
  setView(`
    <h2>CSAT${title}</h2>
    ${metric('CSAT','c_score','c_surveys','Current Score (0–10)','Surveys Taken')}
    <div class="buttons">
      <button class="back" onclick="showRevenue()">← Revenue</button>
      <button class="next" onclick="showTL()">T-Life →</button>
    </div>
  `);
}

function showTL(){
  const title = AppState.store ? ` — ${AppState.store}` : '';
  setView(`
    <h2>T-Life${title}</h2>
    ${metric('T-Life','t2_att','t2_opp','Attainment %','Opportunities')}
    <div class="buttons">
      <button class="back" onclick="showCSAT()">← CSAT</button>
      <button class="next" onclick="showGoals()">Daily Goals →</button>
    </div>
  `);
}

function showGoals(){
  const title = AppState.store ? ` — ${AppState.store}` : '';
  setView(`
    <h2>Daily Goals${title}</h2>
    <div class="metric"><label>Voice</label><input id="g_voice" type="number" placeholder="Voice Goal" value="${localStorage.getItem('g_voice')||''}" oninput="localStorage.setItem('g_voice',this.value)"></div>
    <div class="metric"><label>BTS</label><input id="g_bts" type="number" placeholder="BTS Goal" value="${localStorage.getItem('g_bts')||''}" oninput="localStorage.setItem('g_bts',this.value)"></div>
    <div class="metric"><label>Accessories</label><input id="g_acc" type="number" placeholder="Accessories Goal" value="${localStorage.getItem('g_acc')||''}" oninput="localStorage.setItem('g_acc',this.value)"></div>
    <div class="metric"><label>TFB</label><input id="g_tfb" type="number" placeholder="TFB Goal" value="${localStorage.getItem('g_tfb')||''}" oninput="localStorage.setItem('g_tfb',this.value)"></div>
    <div class="buttons">
      <button class="back" onclick="showTL()">← T-Life</button>
      <button class="next" onclick="showSummary()">Summary →</button>
    </div>
  `);
}

function showSummary(){
  const dateStr = today();
  const storeName = AppState.store || '—';

  // combine DORT + SORT
  const combine = (aD,gD,aS,gS) => {
    const att = pi(localStorage.getItem(aD)) + pi(localStorage.getItem(aS));
    const goal= pi(localStorage.getItem(gD)) + pi(localStorage.getItem(gS));
    const pct = goal>0 ? Math.round((att/goal)*100) : 0;
    const gap = goal - att; // + = under (gap), - = over
    return {att, goal, pct, gap};
  };
  const voice = combine('d_v_att','d_v_goal','s_v_att','s_v_goal');
  const bts   = combine('d_b_att','d_b_goal','s_b_att','s_b_goal');
  const tfb   = combine('d_t_att','d_t_goal','s_t_att','s_t_goal');
  const acc   = combine('d_a_att','d_a_goal','s_a_att','s_a_goal');

  // P360
  const pOpp = pi(localStorage.getItem('p_opp'));
  const pPctIn = Math.max(0, Math.min(100, pf(localStorage.getItem('p_pct'))));
  const pAtt = Math.round(pOpp * (pPctIn/100));
  const tP = AppState.cfg.p360 / 100;
  const pNeed = Math.max(0, Math.ceil((tP * pOpp - pAtt) / (1 - tP))); // "adds"
  const pPctRounded = pct(pPctIn);

  // CSAT
  const cAvg = pf(localStorage.getItem('c_score'));
  const cN   = pi(localStorage.getItem('c_surveys'));
  const cNeed = cAvg>=9.5 ? 0 : Math.max(0, Math.ceil(2 * cN * (9.5 - cAvg)));

  // T-Life
  const tlPct = Math.max(0, Math.min(100, pf(localStorage.getItem('t2_att'))));
  const tlOpp = pi(localStorage.getItem('t2_opp'));
  const tlSuc = Math.round(tlOpp * (tlPct/100));
  const tTarget = AppState.cfg.tlife / 100;
  const tlNeed = Math.max(0, Math.ceil((tTarget * tlOpp - tlSuc) / (1 - tTarget)));

  // VAF
  const vOpp = pi(localStorage.getItem('v_opp'));
  const vTot = pf(localStorage.getItem('v_total'));
  const vTarget = AppState.cfg.vaf;
  const needTotal = vTarget * vOpp;
  const vGap = Math.max(0, needTotal - vTot);
  const mrc = vOpp > 0 ? (vTot / vOpp) : 0;

  const head = `
    <div class="sum-head">
      <div class="sum-date">📅 ${dateStr}</div>
      <div class="sum-store">📍 ${storeName}</div>
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
      <span><span class="status ${bandGap(acc.gap)}">Gap: ${fmtGapMoney(acc.gap)}</span> <span class="status ${bandPct(acc.pct)}">${acc.pct}%</span></span>
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
    <div class="kv"><span>Target</span><span>${AppState.cfg.p360}%</span></div>
    <div class="kv"><span>Needed</span><span class="status ${bandNeed(pNeed)}">${pNeed} adds</span></div>
  </div>`;

  const cardCSAT = `<div class="sec tile short">
    <div style="font-weight:800; margin-bottom:8px;">⭐ CSAT</div>
    <div class="kv"><span>Score</span><span class="status ${bandScore(cAvg)}">${isNaN(cAvg)?'—':cAvg}</span></div>
    <div class="kv"><span>Target</span><span>9.5</span></div>
    <div class="kv"><span>Needed</span><span class="status ${bandNeed(cNeed)}">${cNeed} perfect 10s</span></div>
  </div>`;

  const cardTLife = `<div class="sec tile short">
    <div style="font-weight:800; margin-bottom:8px;">📱 T-Life</div>
    <div class="kv"><span>Attainment</span><span class="status ${bandPct(tlPct)}">${pct(tlPct)}%</span></div>
    <div class="kv"><span>Target</span><span>${AppState.cfg.tlife}%</span></div>
    <div class="kv"><span>Needed</span><span class="status ${bandNeed(tlNeed)}">${tlNeed} opportunities</span></div>
  </div>`;

  const cardVAF = `<div class="sec tile short">
    <div style="font-weight:800; margin-bottom:8px;">💵 VAF</div>
    <div class="kv"><span>MRC</span><span class="status ${bandMRC(mrc, vTarget)}">${money(mrc)}</span></div>
    <div class="kv"><span>Target</span><span>${money(vTarget)}/op</span></div>
    <div class="kv"><span>Gap</span><span class="status ${bandGap(vGap)}">${money(vGap)}</span></div>
  </div>`;

  setView(`
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

/* Init */
(function init(){
  // If no store, send back to selector at root
  if (!AppState.store) { location.href = '/'; return; }
  // Daily reset: clear inputs if the day changed
  const todayKey = new Date().toISOString().slice(0,10);
  if (localStorage.getItem('lastDay') !== todayKey) {
    for (const k in localStorage) {
      if (k && (k.startsWith('d_') || k.startsWith('s_') || k.startsWith('p_') || k.startsWith('v_') || k.startsWith('c_') || k.startsWith('t2_') || k.startsWith('g_'))) {
        try { localStorage.removeItem(k); } catch(e){}
      }
    }
    localStorage.setItem('lastDay', todayKey);
  }
  showDORT();
})();
