// SPDX-License-Identifier: MIT
// Original fictional market game. Not an exchange model or investment advice.
(function(root){'use strict';
const stocks=[{id:'sakura',en:'Sakura Electric',zh:'樱花电机',code:'DSK-01',start:980},{id:'shio',en:'Shio Rail',zh:'汐见铁道',code:'DSK-02',start:2400},{id:'mori',en:'Mori Games',zh:'森之游戏',code:'DSK-03',start:650},{id:'aoi',en:'Aoi Robotics',zh:'葵机器人',code:'DSK-04',start:3200}];
const events=[['A quiet session. Small ripples across the market.','平静的一天，行情泛起小小涟漪。'],['Festival season lifts the mood.','夏日祭临近，市场情绪回暖。'],['A fictional earnings surprise stirs the market.','虚构财报发布，市场出现意外波动。'],['A rainy forecast cools expectations.','连日降雨，让市场预期降了温。'],['A technology showcase draws fresh interest.','科技展举办，带来新的关注。']];
const int=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const clone=v=>JSON.parse(JSON.stringify(v));
function initial(seed=123456789){if(!int(seed,1,4294967295))seed=123456789;return {schema:1,day:1,seed,cash:1000000,debt:0,prices:stocks.map(x=>x.start),holdings:[0,0,0,0],costs:[0,0,0,0],positions:[],nextId:1,history:[stocks.map(x=>x.start)],event:0,liquidations:0,fees:0,interest:0,closed:false,log:[]};}
function valid(s){
 if(!obj(s)||s.schema!==1||!int(s.day,1,30)||!int(s.seed,1,4294967295)||!int(s.cash,0,1e12)||!int(s.debt,0,1e9)||!int(s.nextId,1,100000)||!int(s.event,0,4)||!int(s.liquidations,0,100000)||!int(s.fees,0,1e12)||!int(s.interest,0,1e9)||typeof s.closed!=='boolean'||s.closed!==(s.day===30))return false;
 if(!Array.isArray(s.prices)||s.prices.length!==4||!s.prices.every(v=>int(v,10,1000000)))return false;
 if(!Array.isArray(s.holdings)||s.holdings.length!==4||!s.holdings.every(v=>int(v,0,1000000)&&v%100===0))return false;
 if(!Array.isArray(s.costs)||s.costs.length!==4||!s.costs.every((v,i)=>int(v,0,1e12)&&(s.holdings[i]>0||v===0)))return false;
 if(!Array.isArray(s.history)||s.history.length!==s.day||!s.history.every(v=>Array.isArray(v)&&v.length===4&&v.every(p=>int(p,10,1000000)))||JSON.stringify(s.history.at(-1))!==JSON.stringify(s.prices))return false;
 if(!Array.isArray(s.positions)||s.positions.length>8||new Set(s.positions.map(p=>p?.id)).size!==s.positions.length||!s.positions.every(p=>obj(p)&&int(p.id,1,s.nextId-1)&&int(p.stock,0,3)&&int(p.margin,1000,1000000)&&int(p.entry,10,1000000)&&[1,2,3].includes(p.leverage)&&[-1,1].includes(p.side)))return false;
 if(s.closed&&(s.positions.length||s.holdings.some(Boolean)))return false;
 return Array.isArray(s.log)&&s.log.length<=12&&s.log.every(x=>obj(x)&&int(x.day,1,s.day)&&['buy','sell','long','short','close','liquidate','borrow','repay','finish'].includes(x.action)&&int(x.amount,0,1e12));
}
function clean(s){if(!valid(s))throw Error('INVALID_SAVE');const z={};for(const k of Object.keys(initial()))z[k]=clone(s[k]);z.positions=s.positions.map(({id,stock,margin,entry,leverage,side})=>({id,stock,margin,entry,leverage,side}));z.log=s.log.map(({day,action,amount})=>({day,action,amount}));return z;}
const fee=n=>Math.max(1,Math.ceil(n/1000));
function pnl(s,p){return Math.round(p.margin*p.leverage*p.side*(s.prices[p.stock]-p.entry)/p.entry)||0;}
function equity(s){return s.cash+s.holdings.reduce((n,q,i)=>n+q*s.prices[i],0)+s.positions.reduce((n,p)=>n+Math.max(0,p.margin+pnl(s,p)),0)-s.debt;}
function log(s,action,amount){s.log.unshift({day:s.day,action,amount});s.log=s.log.slice(0,12);}
function quote(s,{kind='spot',stock=0,quantity=100,margin=10000,leverage=1}={}){if(!int(stock,0,3))throw Error('ORDER');let notional;if(kind==='spot'){if(!int(quantity,100,1000000)||quantity%100)throw Error('LOT');notional=s.prices[stock]*quantity;}else if(kind==='margin'){if(!int(margin,1000,1000000)||![1,2,3].includes(leverage))throw Error('ORDER');notional=margin*leverage;}else throw Error('ORDER');return {notional,fee:fee(notional),cashRequired:(kind==='spot'?notional:margin)+fee(notional)};}
function settle(s,id,forced=false){const p=s.positions.find(x=>x.id===id);if(!p)throw Error('POSITION');const gross=Math.max(0,p.margin+pnl(s,p)),f=Math.min(gross,fee(p.margin*p.leverage));s.cash+=gross-f;s.fees+=f;s.positions=s.positions.filter(x=>x.id!==id);if(forced)s.liquidations++;log(s,forced?'liquidate':'close',gross-f);}
function random(s){let x=s.seed;x^=x<<13;x^=x>>>17;x^=x<<5;s.seed=(x>>>0)||1;return s.seed/4294967296;}
function step(s){s.day++;s.event=Math.floor(random(s)*events.length);const common=(random(s)-.5)*.025;for(let i=0;i<4;i++){const change=common+(random(s)-.5)*.12+(s.event===2?(random(s)-.5)*.30:0);s.prices[i]=Math.max(10,Math.min(1000000,Math.round(s.prices[i]*(1+change))));}s.history.push([...s.prices]);const interest=Math.ceil(s.debt/1000);s.debt+=interest;s.interest+=interest;
 for(const p of [...s.positions])if(p.margin+pnl(s,p)<=p.margin*.25)settle(s,p.id,true);
 if(s.day===30){for(const p of [...s.positions])settle(s,p.id);for(let i=0;i<4;i++){if(s.holdings[i]){const gross=s.holdings[i]*s.prices[i],f=fee(gross);s.cash+=gross-f;s.fees+=f;s.holdings[i]=0;s.costs[i]=0;}}s.closed=true;log(s,'finish',s.cash);}
}
function act(input,action,args={}){
 const s=clean(input);if(s.closed&&action!=='repay')throw Error('FINISHED');
 if(action==='buy'||action==='sell'){const stock=args.stock,q=args.quantity;const o=quote(s,{stock,quantity:q});if(action==='buy'){if(s.cash<o.cashRequired)throw Error('CASH');if(s.holdings[stock]+q>1000000)throw Error('LIMIT');s.cash-=o.cashRequired;s.holdings[stock]+=q;s.costs[stock]+=o.cashRequired;}else{if(s.holdings[stock]<q)throw Error('HOLDINGS');s.costs[stock]=Math.round(s.costs[stock]*(s.holdings[stock]-q)/s.holdings[stock]);s.holdings[stock]-=q;s.cash+=o.notional-o.fee;}s.fees+=o.fee;log(s,action,o.notional);}
 else if(action==='long'||action==='short'){const o=quote(s,{...args,kind:'margin'});if(s.positions.length>=8||s.nextId>=100000)throw Error('LIMIT');if(s.cash<o.cashRequired)throw Error('CASH');s.cash-=o.cashRequired;s.fees+=o.fee;s.positions.push({id:s.nextId++,stock:args.stock,entry:s.prices[args.stock],margin:args.margin,leverage:args.leverage,side:action==='long'?1:-1});log(s,action,o.notional);}
 else if(action==='close'){settle(s,args.id);}
 else if(action==='borrow'){if(!int(args.amount,1,500000)||s.debt+args.amount>500000)throw Error('LOAN');s.cash+=args.amount;s.debt+=args.amount;log(s,action,args.amount);}
 else if(action==='repay'){if(!int(args.amount,1,1e9)||args.amount>s.cash||args.amount>s.debt)throw Error('REPAY');s.cash-=args.amount;s.debt-=args.amount;log(s,action,args.amount);}
 else if(action==='next')step(s);else throw Error('ACTION');
 return clean(s);
}
const api={stocks,events,initial,valid,clean,act,quote,equity,pnl,fee};root.TokyoMarket=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
