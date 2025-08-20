
/* app.js — notifications + minor helpers (standalone) */

(function () {
  /* ---- Utilities ---- */
  const $ = (sel) => document.querySelector(sel);

  // Save basic select choices so user doesn't need to re-pick daily
  ['areaSelect','regionSelect','districtSelect','storeSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const key = 'sel_' + id.replace('Select','');
    // restore
    const saved = localStorage.getItem(key);
    if (saved) {
      // Only set if option exists
      [...el.options].some(o => (o.value === saved) && (el.value = saved));
    }
    // persist
    el.addEventListener('change', () => localStorage.setItem(key, el.value || ''));
  });

  /* ---- OneSignal (notifications) ---- */
  const APP_ID = '5ecaba08-de2f-44b8-a4f0-369508265505';

  const btn = document.getElementById('enableBtn') || document.getElementById('btnNotif');
  const skipBtn = document.getElementById('skipBtn');
  const statusEl = document.getElementById('notifStatus');

  function setStatus(txt) { if (statusEl) statusEl.textContent = txt || ''; }

  async function refreshUI(OneSignal) {
    try {
      const optedOut = localStorage.getItem('notif_opt_out') === '1';
      if (optedOut) {
        if (btn) btn.textContent = 'Notifications Off';
        setStatus('You can enable notifications anytime.');
        return;
      }
      const enabled = await OneSignal.User.PushSubscription.optedIn;
      if (btn) btn.textContent = enabled ? 'Notifications Enabled' : 'Enable daily reminders';
      if (enabled) {
        const pid = await OneSignal.User.PushSubscription.id;
        setStatus(pid ? 'Player ID: ' + pid : 'Enabled');
      } else {
        setStatus('Not enabled');
      }
    } catch (e) {
      setStatus('Status error');
      console.warn(e);
    }
  }

  function wireSkip() {
    if (!skipBtn) return;
    skipBtn.addEventListener('click', () => {
      localStorage.setItem('notif_opt_out', '1');
      if (btn) btn.textContent = 'Notifications Off';
      setStatus('You can enable notifications anytime.');
    });
  }

  function wireEnable(OneSignal) {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      try {
        // If user previously chose "No thanks", allow enabling again
        localStorage.removeItem('notif_opt_out');
        await OneSignal.Slidedown.promptPush();
        await refreshUI(OneSignal);
      } catch (e) {
        console.warn('Prompt error', e);
      }
    });
  }

  // Initialize OneSignal v16 when SDK is present
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function(OneSignal) {
    try {
      await OneSignal.init({
        appId: APP_ID,
        notifyButton: { enable: false }
      });
      wireSkip();
      wireEnable(OneSignal);
      await refreshUI(OneSignal);
    } catch (e) {
      console.warn('OneSignal init error', e);
    }
  });
})();
