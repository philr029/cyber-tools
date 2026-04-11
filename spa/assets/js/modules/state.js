/**
 * state.js — LocalStorage-backed app state and history manager.
 *
 * Usage:
 *   import { state, prefs, history, initState } from './state.js';
 *   state.get()          → full state object
 *   state.get('user')    → state.user
 *   state.set('key', v)  → persist and notify listeners
 *   state.on('change', fn)
 *   prefs.get('theme')
 *   prefs.set('theme', 'light')
 *   history.getAll()
 *   history.add({ query, type, status })
 */

const KEYS = {
  STATE:   'ss_state',
  PREFS:   'ss_prefs',
  HISTORY: 'ss_history',
};

const DEFAULT_STATE = {
  user: {
    name:      'John Smith',
    email:     'john@example.com',
    plan:      'free',
    initials:  'JS',
    joinDate:  new Date().toISOString(),
  },
};

const DEFAULT_PREFS = {
  theme:         'dark',
  notifications: true,
  compactMode:   false,
};

/* ── Internal event bus ─────────────────────────────────────────── */
const _listeners = Object.create(null);

function _emit(event, data) {
  (_listeners[event] || []).forEach(fn => fn(data));
}

function _on(event, callback) {
  if (!_listeners[event]) _listeners[event] = [];
  _listeners[event].push(callback);
  return () => {
    _listeners[event] = _listeners[event].filter(fn => fn !== callback);
  };
}

/* ── Helpers ────────────────────────────────────────────────────── */
function _read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function _write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage quota exceeded — fail silently
  }
}

/* ── App state ──────────────────────────────────────────────────── */
export const state = {
  /** Return the full state object, or a single top-level key. */
  get(key) {
    const data = _read(KEYS.STATE, DEFAULT_STATE);
    return key !== undefined ? data[key] : data;
  },

  /** Set a top-level key and persist. */
  set(key, value) {
    const data = _read(KEYS.STATE, DEFAULT_STATE);
    data[key] = value;
    _write(KEYS.STATE, data);
    _emit('change', { key, value });
    _emit(`change:${key}`, value);
  },

  /** Merge multiple top-level keys at once. */
  update(patch) {
    const data = _read(KEYS.STATE, DEFAULT_STATE);
    Object.assign(data, patch);
    _write(KEYS.STATE, data);
    _emit('change', patch);
  },

  /** Reset to defaults (clears user data). */
  reset() {
    _write(KEYS.STATE, { ...DEFAULT_STATE });
    _emit('reset', null);
  },

  /** Subscribe to events: 'change', 'change:<key>', 'reset'. */
  on: _on,
};

/* ── User preferences ───────────────────────────────────────────── */
export const prefs = {
  get(key) {
    const data = _read(KEYS.PREFS, DEFAULT_PREFS);
    return key !== undefined ? data[key] : data;
  },

  set(key, value) {
    const data = _read(KEYS.PREFS, DEFAULT_PREFS);
    data[key] = value;
    _write(KEYS.PREFS, data);
    _emit('prefs:change', { key, value });
    _emit(`prefs:${key}`, value);
  },

  on: _on,
};

/* ── Scan history ───────────────────────────────────────────────── */
export const history = {
  getAll() {
    return _read(KEYS.HISTORY, []) || [];
  },

  /** Add an entry. Returns the updated list. */
  add(entry) {
    const all = this.getAll();
    const newEntry = {
      id:        crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const updated = [newEntry, ...all].slice(0, 200); // keep last 200
    _write(KEYS.HISTORY, updated);
    _emit('history:change', updated);
    return updated;
  },

  clear() {
    _write(KEYS.HISTORY, []);
    _emit('history:change', []);
  },
};

/* ── One-time initialiser ───────────────────────────────────────── */
export function initState() {
  // Write defaults only when keys are absent
  if (!localStorage.getItem(KEYS.STATE)) {
    _write(KEYS.STATE, { ...DEFAULT_STATE });
  }
  if (!localStorage.getItem(KEYS.PREFS)) {
    _write(KEYS.PREFS, { ...DEFAULT_PREFS });
  }
  if (!localStorage.getItem(KEYS.HISTORY)) {
    _write(KEYS.HISTORY, []);
  }
}
