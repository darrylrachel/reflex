const copy = {
  idle: ['YOUR NEXT PERSONAL BEST AWAITS', 'Ready when you are.', 'Take a breath. Focus on the shape.', 'Start test', 'SYSTEM READY'],
  waiting: ['HOLD STEADY', 'Wait for green...', 'Too early and this round won’t count.', 'Waiting…', 'SIGNAL PENDING'],
  ready: ['MAKE YOUR MOVE', 'CLICK NOW!', 'Click, tap, or press Space.', 'React now', 'SIGNAL ACTIVE'],
  early: ['A LITTLE TOO EAGER', 'Too Soon!', 'Wait until the shape turns green. You’ve got this.', 'Try again', 'EARLY INPUT'],
  completed: ['REACTION RECORDED', '', '', 'Play again', 'TEST COMPLETE'],
  interrupted: ['ROUND PAUSED', 'Let’s refocus.', 'The tab lost focus. Start a fresh test.', 'Try again', 'TEST INTERRUPTED'],
};
// Match the displayed whole-millisecond result so the label never contradicts it.
// These are game reference bands, not a measured population average.
export function reactionRating(result) {
  const milliseconds = Math.round(result);
  if (milliseconds < 200) return { label: 'Above average', feedback: 'Under 200 ms. Lightning quick.' };
  if (milliseconds <= 300) return { label: 'Average', feedback: '200–300 ms. Keep finding your rhythm.' };
  return { label: 'Below average', feedback: 'Over 300 ms. Take a breath and try again.' };
}
export function createInterface(doc = document) {
  const el = id => doc.getElementById(id);
  return {
    render({ state, result }) {
      const [kicker, title, detail, action, label] = copy[state];
      const rating = state === 'completed' ? reactionRating(result) : null;
      el('stage').dataset.state = state; el('state-label').textContent = label;
      el('status-kicker').textContent = rating ? `${rating.label} · Game speed rating` : kicker;
      el('status-title').textContent = state === 'completed' ? `${Math.round(result)} ms` : title;
      el('status-detail').textContent = rating ? rating.feedback : detail;
      el('action').textContent = `${action} ↗`;
      el('action').disabled = state === 'waiting';
      el('hit').setAttribute('aria-label', state === 'waiting' ? 'Waiting. Do not react yet' : state === 'ready' ? 'React now' : 'Reaction area. Start a round');
      el('reset').disabled = state === 'waiting' || state === 'ready';
    },
    statistics(s) { el('best').textContent = s.best === null ? '—' : Math.round(s.best); el('average').textContent = s.average === null ? '—' : Math.round(s.average); el('attempts').textContent = s.count; el('storage-note').textContent = s.persistent ? 'Your progress stays on this device.' : 'Storage unavailable. Progress lasts for this visit.'; },
  };
}
