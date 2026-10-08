export function scenarioTokens(scenario='balanced',now=Date.now()) {
  const priceFactor={balanced:1,rally:1.25,selloff:.85,unknown:1}[scenario];
  if(priceFactor===undefined) throw Error('Unknown scenario');
  const common={chain:'demo',source:'synthetic scenario',observedAt:now,ageMinutes:50,contractSafe:true,socialVerified:true,buysH1:180,sellsH1:60};
  return [
    {...common,id:'demo:alpha',address:'alpha',symbol:'ALPHA',price:.02*priceFactor,liquidity:60000,topWalletFraction:.02,contractSafe:scenario==='unknown'?null:true},
    {...common,id:'demo:beta',address:'beta',symbol:'BETA',price:.004*priceFactor,liquidity:9000,ageMinutes:9,topWalletFraction:null,contractSafe:null,socialVerified:null,buysH1:12,sellsH1:0},
    {...common,id:'demo:orbit',address:'orbit',symbol:'ORBIT',price:.12*priceFactor,liquidity:85000,topWalletFraction:.12},
    {...common,id:'demo:nova',address:'nova',symbol:'NOVA',price:.006*priceFactor,liquidity:42000,topWalletFraction:.03,socialVerified:null}
  ];
}
