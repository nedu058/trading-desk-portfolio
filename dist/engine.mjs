const randomUUID = () => globalThis.crypto.randomUUID();
export const policy = Object.freeze({minLiquidity:25000,maxTopWallet:0.05,maxAgeMinutes:1440,minAgeMinutes:15,maxRiskFraction:0.01,maxLiquidityFraction:0.002,maxExposureFraction:0.1,feeBps:30,stopFraction:0.1,takeProfitFraction:0.2,maxEvidenceAgeMs:120000});
const positive = x => Number.isFinite(x) && x > 0;
export function vet(t, now=Date.now()) {
  const failures=[];
  if(!t.id || !t.chain || !t.address) failures.push('Missing chain and contract identity');
  if(!Number.isFinite(t.observedAt) || now-t.observedAt>policy.maxEvidenceAgeMs || t.observedAt>now+5000) failures.push('Stale or missing evidence');
  if(!positive(t.price)) failures.push('Missing price');
  if(!positive(t.liquidity) || t.liquidity<policy.minLiquidity) failures.push('Liquidity below floor');
  if(!Number.isFinite(t.ageMinutes) || t.ageMinutes<policy.minAgeMinutes || t.ageMinutes>policy.maxAgeMinutes) failures.push('Age outside configured window');
  if(!Number.isFinite(t.topWalletFraction) || t.topWalletFraction<0 || t.topWalletFraction>policy.maxTopWallet) failures.push('Concentration unknown or above limit');
  if(t.contractSafe!==true) failures.push('Contract safety unverified');
  if(t.socialVerified!==true) failures.push('Official project account unverified');
  if(!Number.isFinite(t.buysH1) || !Number.isFinite(t.sellsH1) || t.sellsH1<=0 || t.buysH1<=t.sellsH1) failures.push('Insufficient two-sided trade activity');
  return {approved:failures.length===0,failures};
}
export function ticket(t, ledger) {
  const deployed=ledger.positions.reduce((s,p)=>s+p.cost,0);
  const equity=ledger.cash+deployed;
  return Math.max(0,Math.min(ledger.cash/(1+policy.feeBps/10000),equity*policy.maxRiskFraction/policy.stopFraction,t.liquidity*policy.maxLiquidityFraction,equity*policy.maxExposureFraction-deployed));
}
export function openPaper(t,ledger,now=Date.now()) {
  const check=vet(t,now);
  if(!check.approved) throw Error(check.failures.join('; '));
  if(ledger.halted) throw Error('Entries stopped');
  if(ledger.positions.some(p=>p.tokenId===t.id)) throw Error('Position already open');
  const cost=ticket(t,ledger);
  if(cost<1) throw Error('No available allocation');
  const fee=cost*policy.feeBps/10000;
  const position={id:randomUUID(),tokenId:t.id,symbol:t.symbol,chain:t.chain,address:t.address,source:t.source,entryPrice:t.price,quantity:cost/t.price,cost,entryFee:fee,openedAt:now};
  ledger.cash-=cost+fee; ledger.positions.push(position);
  return position;
}
export function closePaper(id,price,ledger,reason='Manual paper close') {
  if(!positive(price)) throw Error('A valid current price is required');
  const index=ledger.positions.findIndex(p=>p.id===id);
  if(index<0) throw Error('Position not found');
  const p=ledger.positions[index],gross=p.quantity*price,exitFee=gross*policy.feeBps/10000;
  const trade={...p,exitPrice:price,closedAt:Date.now(),exitFee,pnl:gross-exitFee-p.cost-p.entryFee,reason};
  ledger.cash+=gross-exitFee; ledger.positions.splice(index,1); ledger.closed.push(trade);
  return trade;
}
export function exitReason(p,price) {
  if(!positive(price)) return null;
  if(price<=p.entryPrice*(1-policy.stopFraction)) return 'Paper stop loss';
  if(price>=p.entryPrice*(1+policy.takeProfitFraction)) return 'Paper take profit';
  return null;
}
export function demoTokens(now=Date.now()) {
  return [
    {id:'demo:alpha',chain:'demo',address:'alpha',symbol:'ALPHA',price:0.02,liquidity:60000,ageMinutes:50,topWalletFraction:0.02,contractSafe:true,socialVerified:true,buysH1:120,sellsH1:40},
    {id:'demo:beta',chain:'demo',address:'beta',symbol:'BETA',price:0.004,liquidity:9000,ageMinutes:9,topWalletFraction:null,contractSafe:null,socialVerified:null,buysH1:12,sellsH1:0}
  ].map(t=>({...t,source:'synthetic fixture',observedAt:now}));
}
