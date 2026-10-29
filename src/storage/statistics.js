const KEY = 'reflex.statistics.v1';
const empty = () => ({ version: 1, count: 0, total: 0, best: null });
function valid(s) { return s && s.version === 1 && Number.isSafeInteger(s.count) && s.count >= 0 && Number.isFinite(s.total) && s.total >= 0 && (s.count === 0 ? s.total === 0 && s.best === null : Number.isFinite(s.best) && s.best >= 0 && s.total >= s.best * s.count); }
export function createStatistics(storage) {
  let data = empty(), persistent = true;
  try { const raw = storage.getItem(KEY); if (raw) { const parsed = JSON.parse(raw); if (valid(parsed)) data = parsed; } } catch { persistent = false; }
  const save = () => { try { storage.setItem(KEY, JSON.stringify(data)); } catch { persistent = false; } };
  return {
    get snapshot() { return { ...data, average: data.count ? data.total / data.count : null, persistent }; },
    add(value) { if (!Number.isFinite(value) || value < 0) return; const total = data.total + value; if (!Number.isFinite(total) || !Number.isSafeInteger(data.count + 1)) return; data = { version: 1, count: data.count + 1, total, best: data.best === null ? value : Math.min(data.best, value) }; save(); },
    reset() { data = empty(); save(); },
  };
}
