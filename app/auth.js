/* GGT Auth — client-side session management for Goals & Gaps Tracker
 * Default credentials:
 *   admin  /  GGT@2025    (role: admin)
 *   user   /  user@2025   (role: user)
 * Passwords are SHA-256 hashed; change hashes here to rotate credentials.
 */
(function (w) {
  'use strict';

  var KEY = 'ggt_auth';
  var TTL = 8 * 3600 * 1000; // 8-hour session

  // SHA-256 hex digest of each password (case-sensitive)
  var USERS = {
    admin: { hash: 'c0f65c4bc0efd90e8a6d79bd9b69a46ec15cb5d42b99c501d2f9465ed3c9791f', role: 'admin' },
    user:  { hash: '1b6c8a2cab3d6e0babfcc3c3ba52263c1740f1319c89083f792818ea98ba44f0', role: 'user'  }
  };

  function sha256(str) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
      .then(function (buf) {
        return Array.from(new Uint8Array(buf))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');
      });
  }

  function getSession() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (!s || Date.now() - s.ts > TTL) { sessionStorage.removeItem(KEY); return null; }
      return s;
    } catch (e) { return null; }
  }

  function login(username, password) {
    var u = String(username || '').trim().toLowerCase();
    var cred = USERS[u];
    if (!cred) return Promise.resolve(false);
    return sha256(password).then(function (h) {
      if (h !== cred.hash) return false;
      sessionStorage.setItem(KEY, JSON.stringify({ username: u, role: cred.role, ts: Date.now() }));
      return true;
    });
  }

  function logout() {
    sessionStorage.removeItem(KEY);
    location.assign('/');
  }

  function isAuthenticated() { return !!getSession(); }
  function isAdmin()         { var s = getSession(); return !!(s && s.role === 'admin'); }
  function getUsername()     { var s = getSession(); return s ? s.username : null; }

  /* Redirect to home (login wall) unless the user is an admin.
   * Call this at the top of any admin-only page. */
  function requireAdmin() {
    var s = getSession();
    if (!s) {
      location.replace('/?next=' + encodeURIComponent(location.href) + '&need=admin');
      return false;
    }
    if (s.role !== 'admin') {
      location.replace('/?need=admin');
      return false;
    }
    return true;
  }

  /* Redirect to home unless the user is authenticated. */
  function requireAuth() {
    if (!getSession()) {
      location.replace('/?next=' + encodeURIComponent(location.href));
      return false;
    }
    return true;
  }

  w.GGTAuth = {
    login: login,
    logout: logout,
    isAuthenticated: isAuthenticated,
    isAdmin: isAdmin,
    getUsername: getUsername,
    getSession: getSession,
    requireAdmin: requireAdmin,
    requireAuth: requireAuth
  };
})(window);
