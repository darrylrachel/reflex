import test from 'node:test';
import assert from 'node:assert/strict';
import { createStatistics } from '../src/storage/statistics.js';
const memory = () => { let value = null; return { getItem: () => value, setItem: (_, next) => { value = next; } }; };
test('best, average, count and reload preserve precise valid results', () => { const storage = memory(); const s = createStatistics(storage); [250,200,300.5].forEach(n => s.add(n)); assert.equal(s.snapshot.best,200); assert.equal(s.snapshot.count,3); assert.equal(s.snapshot.average,750.5/3); assert.deepEqual(createStatistics(storage).snapshot,s.snapshot); });
test('rejects invalid attempts', () => { const s = createStatistics(memory()); [-1,NaN,Infinity,'100',null].forEach(n => s.add(n)); assert.equal(s.snapshot.count,0); });
test('reset persists an empty record', () => { const storage=memory(),s=createStatistics(storage); s.add(200); s.reset(); assert.equal(createStatistics(storage).snapshot.count,0); assert.equal(s.snapshot.best,null); });
test('invalid JSON and malformed records are discarded', () => { for (const raw of ['{','null','{}','{"version":1,"count":2,"total":10,"best":20}','{"version":1,"count":0,"total":8,"best":null}']) assert.equal(createStatistics({getItem:()=>raw}).snapshot.count,0); });
test('unavailable storage retains session stats without throwing', () => { const s=createStatistics({getItem(){throw Error();},setItem(){throw Error();}}); s.add(180); assert.equal(s.snapshot.best,180); assert.equal(s.snapshot.persistent,false); s.reset(); assert.equal(s.snapshot.count,0); });
