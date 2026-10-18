// Standalone local study helpers. No external services or dependencies.
window.FEPractice=(()=>{
 const bitParity=n=>{const bits=n.toString(2).padStart(7,'0');const ones=[...bits].filter(b=>b==='1').length;const parity=ones%2;return{bits,ones,parity,value:n+parity*128}};
 const bubbleTrace=values=>{const a=[...values],trace=[];for(let pass=0;pass<a.length-1;pass++)for(let i=0;i<a.length-1-pass;i++){const before=[...a],swapped=a[i]>a[i+1];if(swapped)[a[i],a[i+1]]=[a[i+1],a[i]];trace.push({pair:[i,i+1],before,after:[...a],swapped,pass:pass+1})}return trace};
 const taskOrders={ア:['a1','a2','b1','b2','a3','a4','b3','b4'],イ:['a1','b1','b2','b3','b4','a2','a3','a4'],ウ:['b1','a1','a2','a3','a4','b2','b3','b4'],エ:['b1','b2','b3','a1','a2','a3','a4','b4']};
 const taskTrace=order=>{const v={x:3};return taskOrders[order].map(op=>{let text='';switch(op){case'a1':v.e=v.x;text=`e ← x = ${v.e}`;break;case'a2':v.f=v.x;text=`f ← x = ${v.f}`;break;case'a3':v.g=v.e+v.f;text=`g ← ${v.e}+${v.f} = ${v.g}`;break;case'a4':v.x=v.g;text=`x ← g = ${v.x}`;break;case'b1':v.h=v.x;text=`h ← x = ${v.h}`;break;case'b2':v.i=v.x;text=`i ← x = ${v.i}`;break;case'b3':v.j=v.h*v.i;text=`j ← ${v.h}×${v.i} = ${v.j}`;break;case'b4':v.x=v.j;text=`x ← j = ${v.x}`;break}return{op,text,...v}})};
 const availability=(failure,recovery)=>{const down=Math.max(0,Math.min(recovery,19)-Math.max(failure,7));return{down,up:12-down,percent:(12-down)/12*100}};
 const lp=(x,y)=>({p:4*x+8*y,q:9*x+6*y,profit:2*x+3*y,valid:x>=0&&y>=0&&4*x+8*y<=40&&9*x+6*y<=54});
 return{bitParity,bubbleTrace,taskTrace,availability,lp};
})();

window.FEReview=(()=>{
 const DAY=86400000;
 function due(entry,now=Date.now()){return !!entry&&(!entry.nextReviewAt||new Date(entry.nextReviewAt).getTime()<=now)}
 function schedule(previous,status,now=Date.now()){
  if(!['known','shaky','weak'].includes(status))throw new RangeError('Unknown review status');
  const old=previous||{},count=Number(old.reviewCount)||0;
  // Only advance a successful interval when the preceding review is due.
  const streak=status==='known'?(old.status==='known'&&!due(old,now)?Math.max(1,Number(old.successStreak)||1):(Number(old.successStreak)||0)+1):0;
  const days=[1,3,7,14,30][Math.min(Math.max(streak-1,0),4)];
  const delay=status==='known'?days*DAY:status==='shaky'?DAY:10*60000;
  return{status,updatedAt:new Date(now).toISOString(),nextReviewAt:new Date(now+delay).toISOString(),successStreak:streak,reviewCount:count+1};
 }
 function dateLabel(iso){return iso?new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(iso)):'未設定'}
 return{due,schedule,dateLabel};
})();

window.FEStudy=(()=>{
 const KEY='fe-completion-20221211-v1-depth-study';
 let state=readJSON(KEY,{recall:{},labs:{}});
 if(!state||typeof state!=='object'||Array.isArray(state))state={};
 if(!state.recall||typeof state.recall!=='object')state.recall={};
 if(!state.labs||typeof state.labs!=='object')state.labs={};
 const save=()=>storage.setItem(KEY,JSON.stringify(state));
 const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('ja-JP',{maximumFractionDigits:3}).format(n):'—';
 const safe=esc;
 const table=(heads,rows)=>`<div class="lab-table-scroll"><table class="lab-table"><thead><tr>${heads.map(x=>`<th>${safe(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${safe(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 const cells=(values,active=[])=>`<div class="lab-cells">${values.map((v,i)=>`<div class="${active.includes(i)?'active':''}"><small>${i+1}番目</small><b>${safe(v)}</b></div>`).join('')}</div>`;
 const result=(text,good=true)=>`<p class="lab-result ${good?'good':'bad'}">${safe(text)}</p>`;
 const note=text=>`<p class="lab-note">${safe(text)}</p>`;
 const svg=(label,body,height=300)=>`<svg class="lab-svg" viewBox="0 0 800 ${height}" role="img" aria-label="${safe(label)}"><rect width="800" height="${height}" fill="#fbfdff"/><g font-family="Meiryo,Yu Gothic,sans-serif">${body}</g></svg>`;
 const text=(x,y,value,color='#16324f',size=21)=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}">${safe(value)}</text>`;
 const rect=(x,y,w,h,color='#dcf3e9')=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,h)}" fill="${color}" stroke="#2563a6"/>`;
 const axis=(x1,y1,x2,y2)=>`<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="#16324f" stroke-width="2"/>`;
 const number=(key,label,value,min,max,step=1)=>({key,label,value,min,max,step,type:'number'});
 const range=(key,label,value,min,max,step=1)=>({...number(key,label,value,min,max,step),type:'range'});
 const input=(key,label,value)=>({key,label,value,type:'text'});
 const select=(key,label,value,options)=>({key,label,value,options,type:'select'});
 const CONFIG={
  2:{title:'利用率を動かして、待ち時間の急増を見る',fields:[range('rho','回線利用率（％）',50,0,95)],hint:'予想：0.5の前後でWとTの大小はどう変わる？'},
  4:{title:'入力数と演算速度を変える',fields:[number('n','未知数の数',1000,1,2000),number('speed','元の計算機に対する速度倍率',4,.1,20,.1)],hint:'予想：未知数だけを2倍にすると、時間は2倍・4倍・8倍のどれ？'},
  6:{title:'別の文字コードにも偶数パリティを付ける',fields:[input('hex','7ビットの16進コード（00〜7F）','7A')],hint:'予想：元の1が偶数個なら、先頭へ付けるビットは？'},
  8:{title:'比較・交換を1回ずつ追う',fields:[input('array','並べ替える整数（2〜8個、カンマ区切り）','4,2,3,1')],stepped:true,hint:'予想：最初の1巡が終わると、一番右に何が来る？'},
  9:{title:'一致・不一致・重複の探索を追う',fields:[input('array','配列（2〜8個、カンマ区切り）','8,3,7,3'),number('target','探す値X',3,-1000,1000)],stepped:true,hint:'予想：3が2か所にあれば、どちらで止まる？見つからなければkは？'},
  10:{title:'再帰の呼出しと戻り値を追う',fields:[number('n','f(n)のn',5,1,10)],stepped:true,hint:'予想：f(1)へ到達した後、どの順に値が確定する？'},
  12:{title:'CPIとクロック周期のどちらも比べる',fields:[number('ca','AのCPI',4,.1,50,.1),number('ta','Aの周期（ns）',1,.1,50,.1),number('cb','BのCPI',.5,.1,50,.1),number('tb','Bの周期（ns）',4,.1,50,.1)],hint:'予想：周期を半分にし、CPIを2倍にすると時間は変わる？'},
  13:{title:'番地と格納値を別々に計算する',fields:[number('base','ベースレジスタの内容',100,0,2000),number('offset','変位',200,0,2000)],hint:'この練習では、主記憶の番地aの内容を1000+aと定義する。'},
  16:{title:'停止台数を変えて90％の境界を見る',fields:[range('stopped','停止する物理マシンの台数',5,0,19)],hint:'総負荷は14台分で一定。停止台数を増やすと、何が分母になる？'},
  17:{title:'4通りの実行順で共有変数を追う',fields:[select('order','元の問題の実行順','イ',['ア','イ','ウ','エ'])],stepped:true,hint:'共有xが変わっても、既に読んだe・f・h・iの値は自動的には変わらない。'},
  20:{title:'値とエンディアンを切り替える',fields:[input('word','32ビット値（16進8桁以内）','ABCD1234'),select('endian','メモリ上の並び方','little',[['little','リトルエンディアン'],['big','ビッグエンディアン']])],hint:'予想：リトルへ変えたとき、34を43にする必要はある？'},
  22:{title:'運転時間と停止時間を変えて電力量を求める',fields:[number('voltage','電圧（V）',100,1,1000),number('current','電流（A）',10,0,100,.1),number('first','最初の運転（分）',60,0,240),number('stop','途中の停止（分）',30,0,240),number('second','再開後の運転（分）',30,0,240)],hint:'力率1・停止時は消費電力0とする。停止時間を延ばすとWhは増える？'},
  28:{title:'参照先がない顧客番号を登録できるか',fields:[input('parents','顧客表に存在する番号（カンマ区切り）','C01,C02'),input('child','注文表へ登録したい顧客番号','C99')],hint:'この練習では顧客番号を必須とし、顧客表を参照する外部キー制約を設定する。'},
  34:{title:'SSIDと周波数チャネルの役割を分ける',fields:[range('a','アクセスポイントAのチャネル',1,1,11),range('b','アクセスポイントBのチャネル',6,1,11),select('ssid','SSIDの設定','different',[['different','異なるSSID'],['same','同じSSID']])],hint:'説明用にチャネル間隔5MHz・使用幅22MHzを仮定する。SSIDの変更だけで重複は消える？'},
  55:{title:'修理が提供時間外まで掛かった場合を比べる',fields:[number('failure','障害が始まる時刻（時）',16,7,19,.5),number('recovery','同日の復旧時刻（時）',21,7,24,.5)],hint:'予定サービスは7〜19時。分母へ19時以降を加えない。'},
  76:{title:'生産量を動かし、制約と利益を確かめる',fields:[range('x','製品Aの生産量x（トン）',4,0,10,.5),range('y','製品Bの生産量y（トン）',3,0,10,.5)],hint:'元の設問は定式化を選ぶ問題。この練習では実行可能領域まで確かめる。'},
  77:{title:'定額法の年間額と償却累計を区別する',fields:[number('cost','取得価額（千円）',10000,1,100000),number('residual','残存価額（千円）',0,0,100000),number('years','耐用年数（年）',20,1,50),number('accum','前期までの償却累計（千円）',3000,0,100000)],hint:'予想：取得価額・残存価額・耐用年数を変えず、償却累計だけ変えたら年間額は？'},
  78:{title:'売上総利益・営業利益・経常利益を区別する',fields:[number('sales','売上高（百万円）',1500,0,100000),number('cost','売上原価（百万円）',1000,0,100000),number('sga','販管費（百万円）',200,0,100000),number('otherIncome','営業外収益（百万円）',40,0,100000),number('otherCost','営業外費用（百万円）',30,0,100000)],hint:'営業外収益だけを動かすと、営業利益と経常利益のどちらが変わる？'}
 };

 function parseArray(value){const items=String(value).split(',').map(x=>x.trim());if(items.length<2||items.length>8||items.some(x=>x===''||!Number.isFinite(Number(x))||!Number.isInteger(Number(x))||Math.abs(Number(x))>1000))throw Error('整数を2〜8個、カンマで区切って入力してください（各値は−1000〜1000）。');return items.map(Number)}
 function calculate(n,p,step=0){
  let html='',max=0;
  switch(n){
   case 2:{const r=p.rho/100,ratio=r/(1-r);let path='';for(let i=0;i<=95;i++){const x=65+i*6.8,y=265-Math.min((i/100)/(1-i/100),5)*40;path+=(i?' L':'M')+x+' '+y}const px=65+p.rho*6.8,py=265-Math.min(ratio,5)*40;
    html=svg('利用率と待ち時間の比',axis(65,265,735,265)+axis(65,265,65,45)+`<path d="${path}" fill="none" stroke="#087f68" stroke-width="4"/><path d="M65 225 H730" stroke="#b33b44" stroke-dasharray="6 4"/><circle cx="${px}" cy="${py}" r="7" fill="#b33b44"/>`+text(30,232,'1')+text(390,292,'回線利用率 ρ')+text(90,38,'W/T（上端は5倍で省略）'))+result(`ρ=${fmt(r)} → W/T=${fmt(ratio)}。${ratio>1?'待ち時間が伝送時間を超える。':ratio===1?'待ち時間と伝送時間は等しい。':'待ち時間は伝送時間より短い。'}`,ratio<=1);break}
   case 4:{const time=2*Math.pow(p.n/100,3)/p.speed;html=table(['条件','元の計算機','変更後'],[['未知数','100',fmt(p.n)],['計算量倍率','1',fmt(Math.pow(p.n/100,3))],['演算速度倍率','1',fmt(p.speed)],['時間','2秒',fmt(time)+'秒']])+result(`2 × (${fmt(p.n)}/100)³ ÷ ${fmt(p.speed)} = ${fmt(time)}秒`);break}
   case 6:{const raw=String(p.hex).trim();if(!/^[0-7]?[0-9a-f]$/i.test(raw))throw Error('00〜7Fの16進数を入力してください。');const a=FEPractice.bitParity(parseInt(raw,16));html=`<div class="parity-bits"><div class="parity-bit"><small>付加</small><b>${a.parity}</b></div>${[...a.bits].map(b=>`<div><small>元のビット</small><b>${b}</b></div>`).join('')}</div>`+result(`元の1は${a.ones}個 → ${a.ones%2?'奇数なので1':'偶数なので0'}を付加 → ${a.value.toString(16).toUpperCase().padStart(2,'0')}`)+note(`付加後の1の個数は${a.ones+a.parity}個（偶数）。`);break}
   case 8:{const a=parseArray(p.array),trace=FEPractice.bubbleTrace(a);max=trace.length;const k=Math.min(step,max),row=trace[k-1],next=trace[k],values=row?row.after:a;html=cells(values,next?next.pair:[])+result(k===0?'まだ比較していない。黄色の隣同士を次に比べる。':`${k}回目：${row.before[row.pair[0]]}と${row.before[row.pair[1]]}を比較。${row.swapped?'逆順なので交換した。':'順序は正しいので交換しない。'}`)+table(['比較','巡目','比べた値','操作','直後の配列'],trace.slice(0,k).map((r,i)=>[i+1,r.pass,r.before[r.pair[0]]+' と '+r.before[r.pair[1]],r.swapped?'交換':'交換なし',r.after.join(', ')]))+note(k===max?'全ての比較が終わり、昇順になった。':'最後に確定した要素は次の巡目で比較しない。');break}
   case 9:{const a=parseArray(p.array),found=a.indexOf(p.target);max=found<0?a.length+1:found+1;const k=Math.min(step,max),rows=[];for(let i=0;i<Math.min(k,a.length);i++){rows.push([i+1,a[i],a[i]===p.target?'一致 → 終了':'不一致']);if(a[i]===p.target)break}html=cells(a,k<max?[Math.min(k,a.length-1)]:[])+table(['k','A(k)','Xとの比較'],rows)+result(k===max?(found<0?`探索失敗。k=${a.length+1}で範囲外となり終了。`:`最初の一致はk=${found+1}。ここで終了し、後ろは調べない。`):`次に${k<a.length?'k='+(k+1)+'の要素':'k='+(a.length+1)+'が範囲外か'}を確認する。`);break}
   case 10:{const count=p.n;max=count-1;const k=Math.min(step,max);html=table(['呼出し','関係','確定した戻り値'],Array.from({length:count},(_,i)=>count-i).map(j=>['f('+j+')',j===1?'基底条件：1':j+' + f('+(j-1)+')',j<=k+1?j*(j+1)/2:'下位の戻り値を待つ']))+result(k===max?`f(${count})=${count*(count+1)/2}。基底条件から戻り値を積み上げた。`:'f(1)=1は確定。次のボタンで戻り値を1段上へ返す。');break}
   case 12:{const a=p.ca*p.ta,b=p.cb*p.tb;html=table(['','A','B'],[['CPI',fmt(p.ca),fmt(p.cb)],['クロック周期',fmt(p.ta)+'ns',fmt(p.tb)+'ns'],['1命令の時間',fmt(a)+'ns',fmt(b)+'ns']])+result(`同じ命令数なら、Aの時間はBの${fmt(a/b)}倍。`)+note('周期が小さくても、CPIが大きいと必ずしも速くならない。');break}
   case 13:{const addr=p.base+p.offset,value=1000+addr;html=table(['段階','計算・値'],[['① ベースの内容',p.base],['② 変位を加える',p.base+' + '+p.offset+' = '+addr],['③ その番地の内容を読む','主記憶['+addr+'] = '+value],['④ GRへ格納','GR ← '+value]])+result(`番地${addr}と、ロードするデータ${value}を区別する。`)+note('練習用メモリの内容は1000+番地という規則。元の問題と異なる番地を試すための仮定。');break}
   case 16:{const remaining=20-p.stopped,rate=14/remaining*100;html=table(['停止','稼働','各台の使用率'],[[4,16,'87.5％'],[5,15,'93.333％'],['選んだ値：'+p.stopped,remaining,fmt(rate)+'％']])+svg('停止台数に応じた資源使用率',rect(65,65,600,65,'#edf4fb')+rect(65,65,Math.min(rate,100)*6,65,rate>90?'#fff0ed':'#dcf3e9')+axis(605,50,605,145)+text(585,180,'90％')+text(65,225,'総負荷14台分 ÷ 残存'+remaining+'台'),260)+result(rate>100?'1台分を超える負荷で、そのままでは収容できない。90％の縮退条件も超えている。':rate>90?'90％を超えるため、縮退運転の条件に入る。':'90％以下なので、設問の縮退条件には入らない。',rate<=90);break}
   case 17:{const trace=FEPractice.taskTrace(p.order);max=trace.length;const k=Math.min(step,max),r=trace[k-1];html=table(['手順','命令','処理','直後の共有x'],trace.slice(0,k).map((t,i)=>[i+1,t.op,t.text,t.x]))+result(k?`${k}手目の共有x=${r.x}${k===max?'（最終値）':''}`:'初期値x=3。1手ずつ、読取りと書込みを分けて追う。')+note(r?'保存済みの値：'+['e','f','g','h','i','j'].filter(t=>t in r).map(t=>t+'='+r[t]).join('、'):'e・f・h・iへ読んだ値は、その後のxの変更と連動しない。');break}
   case 20:{const raw=String(p.word).trim();if(!/^[0-9a-f]{1,8}$/i.test(raw))throw Error('16進数字を1〜8桁で入力してください。');const word=raw.padStart(8,'0').toUpperCase(),bytes=word.match(/../g),ordered=p.endian==='little'?[...bytes].reverse():bytes;html=`<div class="lab-cells">${ordered.map((v,i)=>`<div><small>アドレス +${i}</small><b>${v}</b></div>`).join('')}</div>`+result(`${word} → 低い番地から ${ordered.join(' ・ ')}`)+note('並べ替えるのはバイトの順番。1バイトを表す16進2桁の中身は逆にしない。');break}
   case 22:{const power=p.voltage*p.current,run=p.first+p.second,total=run+p.stop,scale=640/Math.max(total,1),wh=power*run/60;html=svg('運転と停止の時間帯',rect(65,85,p.first*scale,70)+rect(65+p.first*scale,85,p.stop*scale,70,'#edf0f3')+rect(65+(p.first+p.stop)*scale,85,p.second*scale,70)+text(65,50,'緑：運転　灰：停止')+text(65,205,'運転'+run+'分 / 全経過'+total+'分'),260)+table(['項目','値'],[['電力',fmt(power)+'W'],['運転時間',fmt(run/60)+'時間'],['電力量',fmt(wh)+'Wh']])+result(`${fmt(power)}W × ${fmt(run)}/60時間 = ${fmt(wh)}Wh`);break}
   case 28:{const parents=String(p.parents).split(',').map(x=>x.trim()).filter(Boolean),child=String(p.child).trim();if(!parents.length||parents.length>12||parents.some(v=>v.length>20)||!child||child.length>20)throw Error('顧客番号を各20文字以内で入力してください。顧客表は1〜12件、注文の顧客番号は必須です。');const ok=parents.includes(child);html=table(['顧客表の主キー'],parents.map(v=>[v]))+result(`注文の顧客番号「${child}」：${ok?'参照先が存在するため、外部キー制約を満たす。':'参照先が存在しないため、外部キー制約で登録を拒否する。'}`,ok)+note('子の注文データへ適当な顧客を補う仕組みではなく、不整合な登録を防ぐ制約。');break}
   case 34:{const separation=Math.abs(p.a-p.b)*5,overlap=Math.max(0,22-separation);html=svg('二つのチャネルの周波数範囲',rect(20+p.a*42,70,184.8,45,overlap?'#fff0ed':'#dcf3e9')+rect(20+p.b*42,145,184.8,45,overlap?'#fff0ed':'#dcf3e9')+text(30,45,'AP A：ch'+p.a)+text(30,240,'AP B：ch'+p.b+' ／ 周波数の高い方向 →'),280)+result(`中心の差は${separation}MHz。仮定した幅22MHzでは${overlap?'範囲が'+overlap+'MHz重なる。':'範囲は重ならない。'}`,!overlap)+note(`SSIDが${p.ssid==='same'?'同じ':'異なっていても'}、周波数範囲の重なりは変わらない。実機の帯域幅や利用可能チャネルの条件は別途確認する。`);break}
   case 55:{if(p.recovery<p.failure)throw Error('同日内の例です。復旧時刻を障害時刻以降にしてください。');const a=FEPractice.availability(p.failure,p.recovery);let body='';for(let h=7;h<24;h+=.5){const x=50+(h-7)*40,color=h>=19?'#edf0f3':h>=p.failure&&h<p.recovery?'#fff0ed':'#dcf3e9';body+=rect(x,90,20,60,color)}body+=text(50,55,'緑：稼働　赤：提供時間内の停止　灰：提供時間外')+text(50,195,'7時')+text(530,195,'19時')+text(695,195,'24時');html=svg('提供時間と故障時間',body,240)+result(`稼働${fmt(a.up)}時間 ÷ 提供12時間 = ${fmt(a.percent)}％（小数点以下切捨て：${Math.floor(a.percent)}％）`)+note(`提供時間内の停止は${fmt(a.down)}時間。19時以降を分母へ足さない。`);break}
   case 76:{const a=FEPractice.lp(p.x,p.y),px=65+p.x*55,py=345-p.y*27;html=svg('実行可能領域と選んだ生産量',`<path d="M65 345 L395 345 L285 264 L65 210 Z" fill="#dcf3e9" stroke="#087f68" stroke-width="2"/>`+axis(65,345,640,345)+axis(65,345,65,45)+`<path d="M65 210 L615 345" fill="none" stroke="#2563a6"/><path d="M65 102 L395 345" fill="none" stroke="#b33b44"/><circle cx="${px}" cy="${py}" r="8" fill="${a.valid?'#087f68':'#b33b44'}"/>`+text(310,385,'製品A x')+text(80,35,'製品B y')+text(85,325,'緑の範囲だけが全制約を満たす'),415)+table(['判定','使う量','上限'],[['原料P：4x+8y',fmt(a.p),40],['原料Q：9x+6y',fmt(a.q),54],['利益：2x+3y',fmt(a.profit)+'万円','最大化する']])+result(a.valid?`この生産量は実行可能。利益は${fmt(a.profit)}万円。`:'原料の上限を超えるので、利益の数値が大きくても実行できない。',a.valid)+note('連続量で考えると頂点(4,3)は両原料を使い切り、利益17万円。まず制約を満たすことが先。');break}
   case 77:{if(p.residual>p.cost)throw Error('この練習では残存価額を取得価額以下にしてください。');if(p.accum>p.cost-p.residual)throw Error('償却累計は償却対象額（取得価額−残存価額）以下にしてください。');const annual=(p.cost-p.residual)/p.years;html=table(['項目','金額・年数'],[['償却対象額',fmt(p.cost-p.residual)+'千円'],['耐用年数',p.years+'年'],['定額法の年間額',fmt(annual)+'千円'],['前期末の帳簿価額',fmt(p.cost-p.accum)+'千円']])+result(`(${fmt(p.cost)}−${fmt(p.residual)})÷${p.years} = 年${fmt(annual)}千円`)+note('前期までの累計は帳簿価額を変えるが、償却期間内の定額法の毎年額の分子から引き直さない。最終年度等の端数調整はこの練習では扱わない。');break}
   case 78:{const gross=p.sales-p.cost,operating=gross-p.sga,ordinary=operating+p.otherIncome-p.otherCost;html=table(['利益の段階','計算','金額'],[['売上総利益',p.sales+' − '+p.cost,fmt(gross)],['営業利益',fmt(gross)+' − '+p.sga,fmt(operating)],['経常利益',fmt(operating)+' + '+p.otherIncome+' − '+p.otherCost,fmt(ordinary)]])+result(`問78で答えるのは営業利益${fmt(operating)}百万円。`)+note('営業外の収益・費用を変えても、売上総利益と営業利益は変わらない。');break}
  }
  return{html,max};
 }

 function mountLab(q){
  const config=CONFIG[q.n];if(!config)return null;
  const section=document.createElement('details');section.className='practice-lab';section.id=`lab-${q.n}`;
  const saved=state.labs[q.n]||{},params=Object.fromEntries(config.fields.map(f=>[f.key,saved[f.key]??f.value]));let step=Number(saved.step)||0;
  section.innerHTML=`<summary>条件を変えて確かめる：${safe(config.title)}</summary><div class="lab-inner"><p class="lab-predict">${safe(config.hint)}</p><div class="lab-controls">${config.fields.map(f=>`<label>${safe(f.label)}${f.type==='select'?`<select data-param="${f.key}">${f.options.map(v=>{const [value,label]=Array.isArray(v)?v:[v,v];return`<option value="${safe(value)}" ${String(params[f.key])===String(value)?'selected':''}>${safe(label)}</option>`}).join('')}</select>`:`<input data-param="${f.key}" type="${f.type}" value="${safe(params[f.key])}" ${f.type==='text'?'maxlength="100"':`min="${f.min}" max="${f.max}" step="${f.step}"`}><output data-value="${f.key}">${safe(params[f.key])}</output>`}</label>`).join('')}</div><div class="lab-actions">${config.stepped?'<button type="button" data-lab-action="next">1手進める</button><button type="button" data-lab-action="start">最初の手順へ</button>':''}<button type="button" data-lab-action="reset">元の条件に戻す</button></div><div class="lab-output" aria-live="polite"></div></div>`;
  const output=section.querySelector('.lab-output');
  const update=()=>{
   try{
    for(const field of config.fields){const input=section.querySelector(`[data-param="${field.key}"]`);params[field.key]=field.type==='number'||field.type==='range'?Number(input.value):input.value;if(field.type==='number'||field.type==='range'){if(input.value===''||!Number.isFinite(params[field.key])||params[field.key]<field.min||params[field.key]>field.max)throw Error(`${field.label}は${field.min}〜${field.max}の範囲で入力してください。`);if(field.step===1&&!Number.isInteger(params[field.key]))throw Error(`${field.label}は整数で入力してください。`)}const display=section.querySelector(`[data-value="${field.key}"]`);if(display)display.textContent=params[field.key]}
    const value=calculate(q.n,params,step);step=Math.min(step,value.max);output.innerHTML=value.html;const next=section.querySelector('[data-lab-action="next"]');if(next)next.disabled=step>=value.max;
    state.labs[q.n]={...params,step};save();
   }catch(error){output.innerHTML=`<p class="lab-error" role="alert">${safe(error.message)}</p>`;const next=section.querySelector('[data-lab-action="next"]');if(next)next.disabled=true}
  };
  section.addEventListener('input',()=>{step=0;update()});section.addEventListener('change',()=>{step=0;update()});
  section.addEventListener('click',event=>{const action=event.target.closest('[data-lab-action]')?.dataset.labAction;if(!action)return;if(action==='next')step++;if(action==='start')step=0;if(action==='reset'){config.fields.forEach(f=>section.querySelector(`[data-param="${f.key}"]`).value=f.value);step=0}update()});
  update();return section;
 }

 function mountRecall(q){
  const section=document.createElement('section');section.className='recall-check';const record=state.recall[q.n]||{};
  section.innerHTML=`<h3>自分の言葉で説明してみる</h3><p class="recall-prompt">${safe(q.deep.check)}</p><label class="recall-label" for="recall-${q.n}">あなたの説明（自動保存）</label><textarea id="recall-${q.n}" maxlength="1000" rows="3" placeholder="答えや理由を先に思い出して書く。書いた後に解答例と比べます。">${safe(record.draft||'')}</textarea><details class="recall-example"><summary>解答例を見て、自分の説明と比べる</summary><p>${safe(q.deep.answer)}</p><p class="self-grade-note">以下は自動採点ではなく、説明できたかの自己評価です。</p><div class="recall-actions"><button type="button" data-recall="known">自力で説明できた</button><button type="button" data-recall="again">もう一度確認する</button></div></details><p class="recall-state" aria-live="polite"></p>`;
  const textarea=section.querySelector('textarea'),status=section.querySelector('.recall-state');
  const show=()=>{const r=state.recall[q.n]||{};status.textContent=r.status==='known'?'自己評価：自力で説明できた':r.status==='again'?'自己評価：もう一度確認する':'説明を思い出してから、解答例を開いて確認しましょう。'};
  textarea.oninput=()=>{state.recall[q.n]={...(state.recall[q.n]||{}),draft:textarea.value.slice(0,1000),updatedAt:new Date().toISOString()};save()};
  section.onclick=event=>{const choice=event.target.closest('[data-recall]')?.dataset.recall;if(!choice)return;state.recall[q.n]={...(state.recall[q.n]||{}),draft:textarea.value.slice(0,1000),status:choice,updatedAt:new Date().toISOString()};save();show()};
  show();return section;
 }
 function enhanceQuestion(node,q){
  const review=node.querySelector('.review-content'),fast=document.createElement('section');fast.className='fast-route';
  fast.innerHTML=`<p class="study-step">1　試験での見分け方</p><h3>正答への最短ルート</h3><p>${safe(q.fastRoute)}</p>`;
  review.prepend(fast);node.querySelector('.explanation h3').textContent='2　仕組みと理由を理解する';
  const lab=mountLab(q);if(lab)node.querySelector('.visual').after(lab);
  const recall=mountRecall(q);node.querySelector('.option-comparison').before(recall);
 }
 function openPractice(n){
  const q=QUESTIONS.find(q=>q.n===Number(n));if(!q||!CONFIG[q.n])return;
  learningState.filter='すべて';learningState.query='';learningState.onlyUnlearned=false;learningState.focus='all';
  const search=document.querySelector('#searchInput');if(search)search.value='';
  const check=document.querySelector('#onlyUnlearned');if(check)check.checked=false;
  const focus=document.querySelector('#questionFocus');if(focus)focus.value='all';
  document.querySelectorAll('#filters button').forEach(b=>b.classList.toggle('active',b.dataset.field==='すべて'));
  learningState.revealed.add(q.n);saveLearning();renderLearning();
  const lab=document.getElementById(`lab-${q.n}`);if(lab){lab.open=true;lab.scrollIntoView({behavior:'smooth',block:'start'})}
 }
 document.querySelector('#openPractice')?.addEventListener('click',()=>openPractice(document.querySelector('#practiceSelect').value));
 return{KEY,enhanceQuestion,calculate,practiceNumbers:Object.keys(CONFIG).map(Number),recallStatus:n=>state.recall[n]?.status,openPractice};
})();
