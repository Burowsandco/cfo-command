// Burrows & Co. CFO Command Bar — cmd.js
// Injected as separate file to bypass CDN cache
(function() {
  'use strict';
  
  function initCmdBar() {
    if(document.getElementById('cmdBar')) return;
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
      .cmd-bar-wrap{position:fixed;top:0;left:214px;right:0;z-index:200;background:rgba(14,15,13,0.96);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,0.07);padding:8px 24px;display:flex;align-items:center;gap:10px;}
      .cmd-wrap-inner{flex:1;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:7px;padding:7px 13px;transition:border-color .2s;}
      .cmd-wrap-inner:focus-within{border-color:#c8f05a;}
      .cmd-input{flex:1;background:none;border:none;outline:none;color:#e8e6df;font-family:'DM Mono',monospace;font-size:12px;}
      .cmd-input::placeholder{color:#7a7870;}
      .cmd-send{padding:6px 14px;background:#c8f05a;border:none;border-radius:5px;color:#0e0f0d;font-family:'DM Mono',monospace;font-size:11px;font-weight:500;cursor:pointer;flex-shrink:0;}
      .cmd-send:disabled{opacity:.4;cursor:default;}
      .cmd-resp{position:fixed;top:51px;left:214px;right:0;z-index:199;background:rgba(14,15,13,0.98);border-bottom:1px solid rgba(255,255,255,0.07);padding:12px 24px;font-family:'DM Mono',monospace;font-size:12px;color:#e8e6df;line-height:1.7;display:none;max-height:200px;overflow-y:auto;}
      .cmd-resp.open{display:block;}
      .cmd-tag{display:inline-block;padding:2px 7px;border-radius:3px;font-size:10px;margin-right:7px;font-weight:500;}
      .cmd-tag.data{background:rgba(90,240,180,.15);color:#5af0b4;}
      .cmd-tag.answer{background:rgba(200,240,90,.15);color:#c8f05a;}
      .cmd-tag.code{background:rgba(180,90,240,.15);color:#b45af0;}
      .cmd-tag.nav{background:rgba(90,180,240,.15);color:#5ab4f0;}
      .cmd-close-btn{float:right;background:none;border:none;color:#7a7870;cursor:pointer;font-size:15px;line-height:1;}
      .cmd-actions{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap;}
      .cmd-act{padding:4px 11px;border-radius:4px;font-family:'DM Mono',monospace;font-size:10px;cursor:pointer;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#e8e6df;}
      .cmd-act.primary{background:rgba(200,240,90,.12);border-color:rgba(200,240,90,.3);color:#c8f05a;}
      .main{padding-top:50px !important;}
    `;
    document.head.appendChild(style);
    
    // Add HTML
    const bar = document.createElement('div');
    bar.id = 'cmdBar';
    bar.className = 'cmd-bar-wrap';
    bar.innerHTML = `
      <div class="cmd-wrap-inner">
        <span style="font-size:13px;flex-shrink:0;">⌘</span>
        <input class="cmd-input" id="cmdInput" placeholder="Ask anything · Log hours · Add reminder · Request new features..." />
      </div>
      <button class="cmd-send" id="cmdSend" onclick="window._cmdRun()">Ask</button>
    `;
    
    const resp = document.createElement('div');
    resp.id = 'cmdResp';
    resp.className = 'cmd-resp';
    resp.innerHTML = '<button class="cmd-close-btn" onclick="window._cmdClose()">×</button><div id="cmdRespBody"></div>';
    
    document.body.prepend(resp);
    document.body.prepend(bar);
    
    // Add Enter key handler
    document.getElementById('cmdInput').addEventListener('keydown', e => {
      if(e.key === 'Enter') window._cmdRun();
      if(e.key === 'Escape') window._cmdClose();
    });
    
    // Pad main content
    const main = document.querySelector('.main');
    if(main) main.style.paddingTop = '50px';
  }
  
  window._cmdClose = function() {
    document.getElementById('cmdResp').classList.remove('open');
    document.getElementById('cmdInput').value = '';
  };
  
  window._cmdShow = function(tag, cls, msg, actions) {
    const body = document.getElementById('cmdRespBody');
    const btns = (actions||[]).map(a => `<button class="cmd-act ${a.p?'primary':''}" onclick="${a.fn}">${a.l}</button>`).join('');
    body.innerHTML = `<span class="cmd-tag ${cls}">${tag}</span>${msg}${btns?'<div class=\"cmd-actions\">'+btns+'</div>':''}`;
    document.getElementById('cmdResp').classList.add('open');
  };
  
  window._cmdRun = async function() {
    const input = document.getElementById('cmdInput').value.trim();
    if(!input) return;
    const btn = document.getElementById('cmdSend');
    btn.disabled = true; btn.textContent = '...';
    
    const lower = input.toLowerCase();
    
    // Local navigation
    const navMap = {dashboard:'dashboard',revenue:'revenue',waterfall:'revenue',client:'client',childpilot:'client',hours:'hours',pipeline:'pipeline',cash:'cashflow',expenses:'expenses',subscriptions:'subscriptions',partners:'partners',sheets:'sheets',deploy:'deploy'};
    for(const [k,v] of Object.entries(navMap)) {
      if(lower.includes('go to '+k)||lower.includes('show '+k)||lower===k) {
        if(typeof nav==='function') nav(v,null);
        window._cmdShow('NAV','nav','Navigated to '+v+' view.',[{l:'✕ Dismiss',fn:'_cmdClose()'}]);
        btn.disabled=false; btn.textContent='Ask'; return;
      }
    }
    
    // Local quick answers
    if(lower.includes('q2 gap')||lower.includes('revenue gap')) {
      window._cmdShow('ANSWER','answer','Q2 gap is $29,700/mo. Current: $6,800 · Q2 target: $36,500. Zoetis activation ($22,500) closes most of it.',[{l:'→ Pipeline',fn:"nav('pipeline',null);_cmdClose()",p:true},{l:'✕',fn:'_cmdClose()'}]);
      btn.disabled=false; btn.textContent='Ask'; return;
    }
    if(lower.includes('burn')||lower.includes('subscription cost')) {
      window._cmdShow('ANSWER','answer','Monthly burn: $392.30/mo subscriptions. YTD: $4,588.',[{l:'→ Subscriptions',fn:"nav('subscriptions',null);_cmdClose()",p:true},{l:'✕',fn:'_cmdClose()'}]);
      btn.disabled=false; btn.textContent='Ask'; return;
    }
    if(lower.includes('net this month')||lower.includes('profit this month')) {
      window._cmdShow('ANSWER','answer','Net this month: $6,408 ($6,800 revenue − $392 burn) = $3,204 each at 50/50.',[{l:'→ Cash Flow',fn:"nav('cashflow',null);_cmdClose()",p:true},{l:'✕',fn:'_cmdClose()'}]);
      btn.disabled=false; btn.textContent='Ask'; return;
    }
    
    // Log hours shortcut
    const hrs = input.match(/log (\d+)\s*h(?:ours?)?\s+(?:on\s+)?(.+?)\s+for\s+(\w+)/i);
    if(hrs) {
      const [,h,client,person] = hrs;
      const hrsEl = document.getElementById('fh-hrs');
      const personEl = document.getElementById('fh-person');
      const modal = document.getElementById('addHoursModal');
      if(hrsEl) hrsEl.value = h;
      if(personEl) { const opt = [...personEl.options].find(o=>o.text.toLowerCase().includes(person.toLowerCase())); if(opt) personEl.value=opt.value; }
      if(modal) modal.classList.add('open');
      window._cmdShow('DATA','data',`Pre-filled: ${h}h for ${person} on ${client}. Confirm in the form.`,[{l:'✕ Dismiss',fn:'_cmdClose()'}]);
      btn.disabled=false; btn.textContent='Ask'; return;
    }
    
    // Add reminder shortcut
    if(lower.includes('remind')) {
      const txt = input.replace(/add reminder[:\s]*/i,'').replace(/remind me[:\s]*/i,'').trim();
      if(txt && typeof S!=='undefined') {
        S.reminders.push({id:S.nextId++,title:txt,body:'Added via command bar.',urgency:'info',done:false,meta:'Command bar · '+new Date().toLocaleDateString()});
        if(typeof renderReminders==='function') renderReminders();
        if(typeof syncToFirebase==='function') syncToFirebase();
        window._cmdShow('DATA','data',`Reminder added: "${txt}"`,[{l:'→ View',fn:'toggleReminders();_cmdClose()',p:true},{l:'✕',fn:'_cmdClose()'}]);
      }
      btn.disabled=false; btn.textContent='Ask'; return;
    }
    
    // Code change → route to Claude
    const codeWords = ['add','create','build','new tab','new view','new section','change the','update the layout','add a field','invoice'];
    const isCode = codeWords.some(w=>lower.includes(w));
    if(isCode) {
      const prompt = encodeURIComponent('CFO Command dashboard: ' + input + '. Context: Burrows & Co. dashboard at burowsandco.github.io/cfo-command built with Firebase. Repo: github.com/Burowsandco/cfo-command');
      window._cmdShow('CODE','code','This needs a code change. Click below to open Claude with this request pre-written — I\'ll build it and commit directly to GitHub.',[{l:'→ Open Claude to build this',fn:`window.open('https://claude.ai/new?q=${prompt}','_blank')`,p:true},{l:'✕',fn:'_cmdClose()'}]);
      btn.disabled=false; btn.textContent='Ask'; return;
    }
    
    // Fallback — send to Claude API
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:500,
          system:'You are the CFO assistant for Burrows & Co. Digital Advisory. Current data: ChildPilot retainer $6,800/mo active, monthly burn $392.30, net $6,408, Q2 gap $29,700, Zoetis pipeline $22,500 stalled, $1,432.81 Zoetis expenses unreimbursed, 50/50 partner split Phil & Mindy. Answer concisely in plain English under 80 words.',
          messages:[{role:'user',content:input}]
        })
      });
      const d = await r.json();
      const ans = d.content?.[0]?.text || 'No response';
      window._cmdShow('ANSWER','answer',ans,[{l:'✕ Dismiss',fn:'_cmdClose()'}]);
    } catch(e) {
      const q = encodeURIComponent(input+' (Burrows & Co. CFO dashboard)');
      window._cmdShow('ROUTE','code','Routing to Claude...',[{l:'→ Open Claude',fn:`window.open('https://claude.ai/new?q=${q}','_blank')`,p:true},{l:'✕',fn:'_cmdClose()'}]);
    }
    
    btn.disabled=false; btn.textContent='Ask';
  };
  
  // Init when DOM is ready
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCmdBar);
  } else {
    initCmdBar();
  }
})();
