export function createReactionTimer({ now = () => performance.now(), random = Math.random, schedule = setTimeout, cancel = clearTimeout, frame = requestAnimationFrame, cancelFrame = cancelAnimationFrame, onChange = () => {} } = {}) {
  let state = 'idle', timer = null, pendingFrame = null, generation = 0, started = 0;
  const emit = (next, result = null) => { state = next; onChange({ state, result }); };
  function clear() { generation++; if (timer !== null) cancel(timer); if (pendingFrame !== null) cancelFrame(pendingFrame); timer = pendingFrame = null; }
  return {
    get state() { return state; },
    start() {
      clear(); emit('waiting'); const token = generation;
      const delay = 2000 + Math.floor(Math.min(1, Math.max(0, random())) * 3000);
      timer = schedule(() => { timer = null; if (token !== generation) return;
        pendingFrame = frame(() => { pendingFrame = null; if (token !== generation) return; started = now(); emit('ready'); });
      }, delay);
    },
    react() { if (state === 'waiting') { clear(); emit('early'); } else if (state === 'ready') { const result = now() - started; clear(); emit('completed', result); } },
    suspend() { if (state === 'waiting' || state === 'ready') { clear(); emit('interrupted'); } },
    dispose() { clear(); state = 'idle'; },
  };
}
