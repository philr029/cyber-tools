const MAX_ENTRIES = 60;
const listeners = new Set();
let entries = [
  { id: 'activity-1', level: 'status', message: '[STATUS] Sanitizing URL inputs...' },
  { id: 'activity-2', level: 'success', message: '[SUCCESS] Site Verified.' },
];

function emit() {
  listeners.forEach((listener) => listener(entries));
}

export function getActivityEntries() {
  return entries;
}

export function logActivity(level, message) {
  const line = {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level,
    message,
  };
  entries = [line, ...entries].slice(0, MAX_ENTRIES);
  emit();
}

export function onActivityChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

