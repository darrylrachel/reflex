import test from 'node:test';
import assert from 'node:assert/strict';
import { createReactionTimer } from '../src/game/reactionTimer.js';
function fixture(random = .5) {
  let time = 100, delay, callback, paint, cancelled = 0, frameCancelled = 0; const changes = [];
  const game = createReactionTimer({ now: () => time, random: () => random, schedule: (fn, ms) => { callback = fn; delay = ms; return 1; }, cancel: () => cancelled++, frame: fn => { paint = fn; return 2; }, cancelFrame: () => frameCancelled++, onChange: s => changes.push(s) });
  return { game, changes, get delay() { return delay; }, get cancelled() { return cancelled; }, get frameCancelled() { return frameCancelled; }, timer: () => callback(), paint: () => paint(), time: t => { time = t; } };
}
test('initializes idle and schedules delay within inclusive boundaries', () => { for (const [random, delay] of [[0,2000],[.5,3500],[1,5000]]) { const f = fixture(random); assert.equal(f.game.state, 'idle'); f.game.start(); assert.equal(f.delay, delay); assert.equal(f.game.state, 'waiting'); } });
test('waits for paint callback before signal; measures high resolution elapsed time', () => { const f = fixture(); f.game.start(); f.timer(); assert.equal(f.game.state, 'waiting'); f.time(200); f.paint(); assert.equal(f.game.state, 'ready'); f.time(423.6); f.game.react(); assert.equal(f.game.state, 'completed'); assert.ok(Math.abs(f.changes.at(-1).result - 223.6) < .0001); });
test('early input cancels countdown and stale callback cannot activate signal', () => { const f = fixture(); f.game.start(); f.game.react(); f.timer(); assert.equal(f.game.state, 'early'); assert.equal(f.cancelled, 1); assert.equal(f.changes.at(-1).result, null); });
test('early input after timeout cancels pending signal frame', () => { const f = fixture(); f.game.start(); f.timer(); f.game.react(); f.paint(); assert.equal(f.game.state, 'early'); assert.equal(f.frameCancelled, 1); });
test('duplicate inputs cannot record duplicate results', () => { const f = fixture(); f.game.start(); f.timer(); f.paint(); f.time(400); f.game.react(); f.game.react(); assert.equal(f.changes.filter(s => s.state === 'completed').length, 1); });
test('restart clears countdown, rejects old callbacks and allows new round', () => { let callbacks = [], clears = 0; const g = createReactionTimer({schedule: fn => { callbacks.push(fn); return callbacks.length; },cancel: () => clears++,frame: fn => fn(),cancelFrame() {},onChange() {} }); g.start(); g.start(); callbacks[0](); assert.equal(g.state,'waiting'); callbacks[1](); assert.equal(g.state,'ready'); assert.equal(clears,1); });
test('suspend and dispose invalidate pending timers', () => { const f = fixture(); f.game.start(); f.game.suspend(); f.timer(); assert.equal(f.game.state,'interrupted'); f.game.start(); f.game.dispose(); f.timer(); assert.equal(f.game.state,'idle'); assert.equal(f.cancelled,2); });

