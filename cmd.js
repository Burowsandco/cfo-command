(function(){
var ACCENT='#c8f05a',MUTED='#7a7870',BG='rgba(14,15,13,0.97)',TEXT='#e8e6df';

function addStyles(){
  var s=document.createElement('style');
  s.id='cmd-styles';
  s.textContent=[
    '.cmd-wrap{padding:14px 40px 14px;background:'+BG+';border-bottom:2px solid '+ACCENT+';margin-bottom:22px;}',
    '.cmd-label{font-family:"DM Mono",monospace;font-size:9px;color:'+ACCENT+';letter-spacing:.14em;text-transform:uppercase;margin-bottom:7px;}',
    '.cmd-row{display:flex;align-items:center;gap:10px;background:rgba(200,240,90,0.05);border:1.5px solid '+ACCENT+';border-radius:8px;padding:9px 14px;}',
    '.cmd-row:focus-within{box-shadow:0 0 0 3px rgba(200,240,90,0.12);}',
    '.cmd-icon{font-size:14px;color:'+ACCENT+';flex-shrink:0;}',
    '.cmd-inp{flex:1;background:none;border:none;outline:none;color:'+TEXT+';font-family:"DM Mono",monospace;font-size:12px;}',
    '.cmd-inp::placeholder{color:'+MUTED+';}',
    '.cmd-btn{padding:7px 18px;background:'+ACCENT+';border:none;border-radius:6px;color:#0e0f0d;font-family:"DM Mono",monospace;font-size:11px;font-weight:500;cursor:pointer;flex-shrink:0;}',
    '.cmd-btn:disabled{opacity:.4;cursor:default;}',
    '.cmd-resp{margin-top:10px;padding:11px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:7px;font-family:"DM Mono",monospace;font-size:12px;color:'+TEXT+';line-height:1.7;display:none;}',
    '.cmd-resp.open{display:block;}',
    '.cmd-tag{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;margin-right:8px;font-weight:500;}',
    '.cmd-tag.data{background:rgba(90,240,180,.15);color:#5af0b4;}',
    '.cmd-tag.ans{background:rgba(200,240,90,.15);color:'+ACCENT+';}',
    '.cmd-tag.code{background:rgba(180,90,240,.15);color:#b45af0;}',
    '.cmd-tag.nav{background:rgba(90,180,240,.15);color:#5ab4f0;}',
    '.cmd-xbtn{float:right;background:none;border:none;color:'+MUTED+';cursor:pointer;font-size:15px;line-height:1;}',
    '.cmd-acts{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap;}',
    '.cmd-act{padding:5px 12px;border-radius:4px;font-family:"DM Mono",monospace;font-size:10px;cursor:pointer;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:'+TEXT+';}',
    '.cmd-act.p{background:rgba(200,240,90,.12);border-color:rgba(200,240,90,.3);color:'+ACCENT+';}'
  ].join('');
  document.head.appendChild(s);
}

function buildBar(target){
  var wrap=document.createElement('div');
  wrap.id='cmdBar';
  wrap.className='cmd-wrap';

  var lbl=document.createElement('div');
  lbl.className='cmd-label';
  lbl.textContent='Command — ask anything, log data, request new features';
  wrap.appendChild(lbl);

  var row=document.createElement('div');
  row.className='cmd-row';

  var icon=document.createElement('span');
  icon.className='cmd-icon';
  icon.textContent='⌘';
  row.appendChild(icon);

  var inp=document.createElement('input');
  inp.id='cmdInp';
  inp.className='cmd-inp';
  inp.placeholder='e.g. "What is my Q2 gap?" · "Log 3h on ChildPilot for Phil" · "Add invoicing tab"';
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')window._cmd();if(e.key==='Escape')window._cmdX();});
  row.appendChild(inp);

  var btn=document.createElement('button');
  btn.id='cmdBtn';
  btn.className='cmd-btn';
  btn.textContent='Ask';
  btn.onclick=function(){window._cmd();};
  row.appendChild(btn);
  wrap.appendChild(row);

  var resp=document.createElement('div');
  resp.id='cmdResp';
  resp.className='cmd-resp';

  var xbtn=document.createElement('button');
  xbtn.className='cmd-xbtn';
  xbtn.textContent='×';
  xbtn.onclick=function(){window._cmdX();};
  resp.appendChild(xbtn);

  var body=document.createElement('div');
  body.id='cmdBody';
  resp.appendChild(body);
  wrap.appendChild(resp);

  target.insertAdjacentElement('afterend',wrap);
}

function inject(){
  var old=document.getElementById('cmdBar');
  if(old)old.remove();
  var active=document.querySelector('.view.active');
  var topbar=active&&active.querySelector('.topbar');
  if(topbar)buildBar(topbar);
  else if(active)buildBar(active.firstElementChild);
}

window._cmdX=function(){
  var r=document.getElementById('cmdResp');
  var i=document.getElementById('cmdInp');
  if(r)r.classList.remove('open');
  if(i)i.value='';
};

window._cmdShow=function(tag,cls,msg,acts){
  var b=document.getElementById('cmdBody');
  var r=document.getElementById('cmdResp');
  if(!b||!r)return;
  b.innerHTML='';
  var t=document.createElement('span');
  t.className='cmd-tag '+cls;
  t.textContent=tag;
  b.appendChild(t);
  var m=document.createElement('span');
  m.innerHTML=msg;
  b.appendChild(m);
  if(acts&&acts.length){
    var ad=document.createElement('div');
    ad.className='cmd-acts';
    acts.forEach(function(a){
      var ab=document.createElement('button');
      ab.className='cmd-act'+(a.p?' p':'');
      ab.textContent=a.l;
      ab.onclick=function(){eval(a.fn);};
      ad.appendChild(ab);
    });
    b.appendChild(ad);
  }
  r.classList.add('open');
};

window._cmd=async function(){
  var inp=document.getElementById('cmdInp');
  if(!inp)return;
  var input=inp.value.trim();
  if(!input)return;
  var btn=document.getElementById('cmdBtn');
  if(btn){btn.disabled=true;btn.textContent='...';}

  var lower=input.toLowerCase();

  var navMap={dashboard:'dashboard',revenue:'revenue',waterfall:'revenue',client:'client',childpilot:'client',hours:'hours',capacity:'hours',pipeline:'pipeline',cash:'cashflow',expenses:'expenses',subscriptions:'subscriptions',partners:'partners',sheets:'sheets',deploy:'deploy'};
  for(var k in navMap){
    if(lower.indexOf('go to '+k)>-1||lower.indexOf('show '+k)>-1||lower.indexOf('open '+k)>-1||lower===k){
      if(typeof nav==='function')nav(navMap[k],null);
      window._cmdShow('NAV','nav','Navigated to '+navMap[k]+' view.',[{l:'Dismiss',fn:'_cmdX()'}]);
      if(btn){btn.disabled=false;btn.textContent='Ask';}return;
    }
  }

  if(lower.indexOf('q2 gap')>-1||lower.indexOf('revenue gap')>-1){
    window._cmdShow('ANSWER','ans','Q2 gap is <strong>$29,700/mo</strong>. Current: $6,800 &rarr; Q2 target: $36,500. Zoetis ($22,500) closes most of it.',[{l:'Pipeline',fn:"nav('pipeline',null);_cmdX()",p:true},{l:'Dismiss',fn:'_cmdX()'}]);
    if(btn){btn.disabled=false;btn.textContent='Ask';}return;
  }
  if(lower.indexOf('burn')>-1||lower.indexOf('monthly cost')>-1){
    window._cmdShow('ANSWER','ans','Monthly burn: <strong>$392.30</strong> in subscriptions. YTD: $4,588.',[{l:'Subscriptions',fn:"nav('subscriptions',null);_cmdX()",p:true},{l:'Dismiss',fn:'_cmdX()'}]);
    if(btn){btn.disabled=false;btn.textContent='Ask';}return;
  }
  if(lower.indexOf('net this month')>-1||lower.indexOf('take home')>-1||lower.indexOf('profit')>-1){
    window._cmdShow('ANSWER','ans','Net this month: <strong>$6,408</strong> ($6,800 &minus; $392) = <strong>$3,204 each</strong> at 50/50.',[{l:'Cash Flow',fn:"nav('cashflow',null);_cmdX()",p:true},{l:'Dismiss',fn:'_cmdX()'}]);
    if(btn){btn.disabled=false;btn.textContent='Ask';}return;
  }
  if(lower.indexOf('zoetis')>-1&&(lower.indexOf('expense')>-1||lower.indexOf('reimburse')>-1)){
    window._cmdShow('ANSWER','ans','<strong>$1,432.81</strong> Zoetis NJ expenses not submitted. Mindy's personal card. Submit immediately.',[{l:'Expenses',fn:"nav('expenses',null);_cmdX()",p:true},{l:'Dismiss',fn:'_cmdX()'}]);
    if(btn){btn.disabled=false;btn.textContent='Ask';}return;
  }
  if(lower.indexOf('health')>-1||lower.indexOf('score')>-1){
    window._cmdShow('ANSWER','ans','Health score: <strong>52/100</strong>. 1 client, $29,700 Q2 gap, Zoetis stalled, $1,433 unreimbursed. Submit expenses + re-engage Zoetis.',[{l:'Dismiss',fn:'_cmdX()'}]);
    if(btn){btn.disabled=false;btn.textContent='Ask';}return;
  }

  var hrsMatch=input.match(/log (\d+)\s*h(?:ours?)?\s+(?:on\s+)?(.+?)\s+for\s+(\w+)/i);
  if(hrsMatch){
    var h=hrsMatch[1],client=hrsMatch[2],person=hrsMatch[3];
    var hEl=document.getElementById('fh-hrs');
    var pEl=document.getElementById('fh-person');
    var modal=document.getElementById('addHoursModal');
    if(hEl)hEl.value=h;
    if(pEl){var opt=Array.from(pEl.options).find(function(o){return o.text.toLowerCase().indexOf(person.toLowerCase())>-1;});if(opt)pEl.value=opt.value;}
    if(modal)modal.classList.add('open');
    window._cmdShow('DATA','data','Pre-filled: '+h+'h for '+person+' on '+client+'. Confirm in form.',[{l:'Dismiss',fn:'_cmdX()'}]);
    if(btn){btn.disabled=false;btn.textContent='Ask';}return;
  }

  if(lower.indexOf('remind')===0||lower.indexOf('add reminder')===0){
    var txt=input.replace(/^add reminder[:\s]*/i,'').replace(/^remind me[:\s]*/i,'').replace(/^remind[:\s]*/i,'').trim();
    if(txt&&typeof S!=='undefined'){
      S.reminders.push({id:S.nextId++,title:txt,body:'Added via command bar.',urgency:'info',done:false,meta:'Command · '+new Date().toLocaleDateString()});
      if(typeof renderReminders==='function')renderReminders();
      if(typeof syncToFirebase==='function')syncToFirebase();
      window._cmdShow('DATA','data','Reminder added: "'+txt+'"',[{l:'View bell',fn:'toggleReminders();_cmdX()',p:true},{l:'Dismiss',fn:'_cmdX()'}]);
    } else {
      window._cmdShow('DATA','data','Sign in to save reminders.',[{l:'Dismiss',fn:'_cmdX()'}]);
    }
    if(btn){btn.disabled=false;btn.textContent='Ask';}return;
  }

  var codeWords=['add a','create a','build a','new tab','new view','new section','add field','invoice tab','tracker','add report','export'];
  var isCode=codeWords.some(function(w){return lower.indexOf(w)>-1;});
  if(isCode){
    var prompt=encodeURIComponent('CFO Command dashboard update: '+input+'. Context: burowsandco.github.io/cfo-command on Firebase + GitHub Pages. Repo: github.com/Burowsandco/cfo-command');
    window._cmdShow('CODE','code','Code change needed. Click below — Claude will build and commit directly to GitHub.',[{l:'Open Claude to build',fn:"window.open('https://claude.ai/new?q="+prompt+"','_blank')",p:true},{l:'Dismiss',fn:'_cmdX()'}]);
    if(btn){btn.disabled=false;btn.textContent='Ask';}return;
  }

  try{
    var r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:400,system:'You are the CFO assistant for Burrows & Co. Digital Advisory. Data: ChildPilot retainer $6,800/mo, burn $392.30/mo, net $6,408, Q2 target $36,500 (gap $29,700), Zoetis $22,500 stalled, $1,432.81 unreimbursed expenses, 50/50 Phil & Mindy. Answer in plain English under 60 words.',messages:[{role:'user',content:input}]})});
    var d=await r.json();
    var ans=d.content&&d.content[0]&&d.content[0].text||'No response.';
    window._cmdShow('ANSWER','ans',ans,[{l:'Dismiss',fn:'_cmdX()'}]);
  }catch(e){
    var q=encodeURIComponent(input+' — Burrows & Co. CFO');
    window._cmdShow('ROUTE','code','Routing to Claude...',[{l:'Open Claude',fn:"window.open('https://claude.ai/new?q="+q+"','_blank')",p:true},{l:'Dismiss',fn:'_cmdX()'}]);
  }
  if(btn){btn.disabled=false;btn.textContent='Ask';}
};

var origNav=window.nav;
window.nav=function(id,el){if(origNav)origNav(id,el);setTimeout(inject,60);};

if(!document.getElementById('cmd-styles'))addStyles();
inject();
})();
