import test from 'node:test';
import assert from 'node:assert/strict';
import {demoTokens,vet,openPaper,closePaper,exitReason,policy} from './dist/engine.mjs';
const account=()=>({cash:1000,positions:[],closed:[],halted:false});
test('missing and stale evidence reject entries',()=>{const t=demoTokens()[0];assert.equal(vet({...t,topWalletFraction:null}).approved,false);assert.equal(vet({...t,contractSafe:null}).approved,false);assert.equal(vet({...t,observedAt:Date.now()-130000}).approved,false);});
test('fees and allocation conserve cash on a round trip',()=>{const l=account(),t=demoTokens()[0];const p=openPaper(t,l);assert.ok(l.cash>=0);assert.ok(p.cost<=100);assert.throws(()=>openPaper(t,l),/already/);const trade=closePaper(p.id,t.price,l);assert.ok(Math.abs(l.cash-(1000+trade.pnl))<1e-8);assert.equal(l.positions.length,0);assert.ok(trade.pnl<0);});
test('halt blocks new entries and permits closes',()=>{const l=account(),t=demoTokens()[0],p=openPaper(t,l);l.halted=true;assert.throws(()=>openPaper({...t,id:'other'},l),/stopped/);closePaper(p.id,t.price,l);assert.equal(l.positions.length,0);});
test('price guards and risk exits',()=>{const l=account(),t=demoTokens()[0],p=openPaper(t,l);assert.throws(()=>closePaper(p.id,NaN,l),/valid/);assert.equal(exitReason(p,p.entryPrice*(1-policy.stopFraction)), 'Paper stop loss');assert.equal(exitReason(p,p.entryPrice*(1+policy.takeProfitFraction)), 'Paper take profit');assert.equal(exitReason(p,null),null);});
test('same ticker does not conflate contracts; exposure remains capped',()=>{const l=account(),t=demoTokens()[0];openPaper(t,l);assert.throws(()=>openPaper({...t,id:'demo:different',address:'different'},l),/allocation/);});
