import test from 'node:test';
import assert from 'node:assert/strict';
import {scenarioTokens} from './dist/scenarios.mjs';
import {vet,openPaper,closePaper,exitReason} from './dist/engine.mjs';
test('balanced scenario has exactly one eligible asset',()=>{const tokens=scenarioTokens();assert.deepEqual(tokens.filter(t=>vet(t).approved).map(t=>t.symbol),['ALPHA']);});
test('missing contract evidence refuses all entries',()=>assert.equal(scenarioTokens('unknown').filter(t=>vet(t).approved).length,0));
test('rally closes on take profit and reconciles fees',()=>{const l={cash:1000,positions:[],closed:[],halted:false},p=openPaper(scenarioTokens()[0],l),r=scenarioTokens('rally')[0];const reason=exitReason(p,r.price);assert.equal(reason,'Paper take profit');const t=closePaper(p.id,r.price,l,reason);assert.ok(t.pnl>0);assert.ok(Math.abs(l.cash-1000-t.pnl)<1e-8);});
test('selloff models gap through stop, rather than guaranteed stop price',()=>{const l={cash:1000,positions:[],closed:[],halted:false},p=openPaper(scenarioTokens()[0],l),r=scenarioTokens('selloff')[0];assert.equal(exitReason(p,r.price),'Paper stop loss');assert.ok(closePaper(p.id,r.price,l).pnl < -10);});
