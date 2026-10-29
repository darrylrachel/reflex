import './styles/styles.css';
import { createReactionTimer } from './game/reactionTimer.js';
import { createStatistics } from './storage/statistics.js';
import { createInterface } from './ui/interface.js';
import { createScene } from './graphics/scene.js';
const ui = createInterface();
let storage; try { storage = window.localStorage; } catch { storage = null; }
const statistics = createStatistics(storage);
let graphics; try { graphics = createScene(document.getElementById('scene')); } catch { document.getElementById('stage').classList.remove('has-webgl'); graphics = { setState() {}, dispose() {} }; }
const game = createReactionTimer({ onChange(snapshot) { ui.render(snapshot); graphics.setState(snapshot.state); if (snapshot.state === 'completed') { statistics.add(snapshot.result); ui.statistics(statistics.snapshot); } } });
ui.render({ state: 'idle' }); ui.statistics(statistics.snapshot);
const act = () => { if (game.state === 'waiting' || game.state === 'ready') game.react(); else game.start(); };
document.getElementById('action').addEventListener('click', act);
document.getElementById('hit').addEventListener('pointerdown', event => { if (event.button !== 0 || !event.isPrimary) return; event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); act(); });
// Keyboard-generated clicks remain useful for assistive technology.
document.getElementById('hit').addEventListener('click', event => { if (event.detail === 0) act(); });
document.addEventListener('keydown', event => { if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat && !document.getElementById('reset-dialog').open && !['reset'].includes(event.target.id) && event.target.tagName !== 'A') { event.preventDefault(); act(); } });
const dialog = document.getElementById('reset-dialog');
document.getElementById('reset').addEventListener('click', () => dialog.showModal());
dialog.addEventListener('close', () => { if (dialog.returnValue === 'confirm') { statistics.reset(); ui.statistics(statistics.snapshot); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) game.suspend(); });
window.addEventListener('blur', () => game.suspend());
window.addEventListener('pagehide', event => { game.suspend(); if (!event.persisted) { game.dispose(); graphics.dispose(); } });
