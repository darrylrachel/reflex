import test from 'node:test';
import assert from 'node:assert/strict';
import { reactionRating, createInterface } from '../src/ui/interface.js';

test('reaction speed ratings cover both boundaries and match rounded results', () => {
  for (const [time, label] of [[0, 'Above average'], [199.49, 'Above average'], [199.5, 'Average'], [200, 'Average'], [250, 'Average'], [300, 'Average'], [300.49, 'Average'], [300.5, 'Below average'], [301, 'Below average'], [1200, 'Below average']]) {
    assert.equal(reactionRating(time).label, label, `${time} ms`);
  }
});

test('completed results show the rating and reset it on retry or early input', () => {
  const nodes = new Map();
  const doc = { getElementById(id) { if (!nodes.has(id)) nodes.set(id, { dataset: {}, setAttribute() {} }); return nodes.get(id); } };
  const ui = createInterface(doc);
  for (const [time, label] of [[150, 'Above average'], [250, 'Average'], [350, 'Below average']]) {
    ui.render({ state: 'completed', result: time });
    assert.equal(nodes.get('status-kicker').textContent, `${label} · Game speed rating`);
    assert.equal(nodes.get('status-title').textContent, `${time} ms`);
    assert.ok(nodes.get('status-detail').textContent.length > 0);
  }
  for (const state of ['idle', 'waiting', 'ready', 'early', 'interrupted']) {
    ui.render({ state });
    assert.ok(!nodes.get('status-kicker').textContent.includes('Game speed rating'));
  }
});
