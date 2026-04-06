// Burrows & Co. CFO Command Bar — cmd.js v2
// Prominent placement below the topbar header
(function() {
  'use strict';

  function initCmdBar() {
    if(document.getElementById('cmdBar')) return;

    const style = document.createElement('style');
    style.textContent = `
      .cmd-bar-wrap {
        position: sticky;
        top: 0;
        z-index: 100;
        padding: 12px 40px 16px;
        background: #0e0f0d;
        border-bottom: 2px solid #c8f05a;
        margin-bottom: 20px;
      }
      .cmd-label {
        font-family: 'DM Mono', monospace;
        font-size: 9px;
        color: #c8f05a;
        letter-spacing: .14em;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .cmd-wrap-inner {
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(200,240,90,0.06);
        border: 1.5px solid #c8f05a;
        border-radius: 8px;
        padding: 10px 16px;
        transition: box-shadow .2s;
      }
      .cmd-wrap-inner:focus-within {
        box-shadow: 0 0 0 3px rgba(200,240,90,0.15);
      }
      .cmd-icon {
        font-size: 15px;
        flex-shrink: 0;
        color: #c8f05a;
      }
      .cmd-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: #e8e6df;
        font-family: 'DM Mono', monospace;
        font-size: 12px;
      }
      .cmd-input::placeholder { color: #7a7870; }
      .cmd-send {
        padding: 7px 18px;
        background: #c8f05a;
        border: none;
        border-radius: 6px;
        color: #0e0f0d;
        font-family: 'DM Mono', monospace;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        flex-shrink: 0;
        transition: opacity .15s;
      }
      .cmd-send:hover { opacity: .85; }
      .cmd-send:disabled { opacity: .4; cursor: default; }
      .cmd-resp {
        margin-top: 10px;
        padding: 12px 16px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 7px;
        font-family: 'DM Mono', monospace;
        font-size: 12px;
        color: #e8e6df;
        line-height: 1.7;
        display: none;
      }
      .cmd-resp.open { display: block; }
      .cmd-tag {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 10px;
        margin-right: 8px;
        font-weight: 500;
      }
      .cmd-tag.data { background: rgba(90,240,180,.15); color: #5af0b4; }
      .cmd-tag.answer { background: rgba(200,240,90,.15); color: #c8f05a; }
      .cmd-tag.code { background: rgba(180,90,240,.15); color: #b45af0; }
      .cmd-tag.nav { background: rgba(90,180,240,.15); color: #5ab4f0; }
      .cmd-close-btn {
        float: right;
        background: none;
        border: none;
        color: #7a7870;
        cursor: pointer;
        font-size: 15px;
        line-height: 1;
      }
      .cmd-actions { display: flex; gap: 7px; margin-top: 9px; flex-wrap: wrap; }
      .cmd-act {
        padding: 5px 12px;
        border-radius: 4px;
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,.1);
        background: rgba(255,255,255,.04);
        color: #e8e6df;
        transition: all .15s;
      }
      .cmd-act:hover { background: rgba(255,255,255,.08); }
      .cmd-act.primary {
        background: rgba(200,240,90,.12);
        border-color: rgba(200,240,90,.3);
        color: #c8f05a;
      }
    `;
    document.head.appendChild(style);

    // Build the bar HTML — inject it INSIDE .main at the top of each view
    // Find the active view's topbar and inject after it
    function injectIntoView() {
      // Remove existing if present
      const existing = document.getElementById('cmdBar');
      if(existing) existing.remove();
      const existingResp = document.getElementById('cmdResp');
      if(existingResp) existingResp.remove();

      // Find the currently active view's topbar
      const activeView = document.querySelector('.view.active');
      const topbar = activeView ? activeView.querySelector('.topbar') : null;
      const insertAfter = topbar || activeView;
      if(!insertAfter) return;

      const bar = document.createElement('div');
      bar.id = 'cmdBar';
      bar.className = 'cmd-bar-wrap';
      bar.innerHTML = `
        <div class="cmd-label">⌘ Command — ask anything, log data, request features</div>
        <div class="cmd-wrap-inner">
          <span class="cmd-icon">⌘</span>
          <input class="cmd-input" id="cmdInput"
            placeholder='e.g. "What is my Q2 gap?" · "Log 3 hours on ChildPilot for Phil" · "Add invoicing tab"' />
          <button class="cmd-send" id="cmdSend" onclick="window._cmdRun()">Ask</button>
        </div>
        <div class="cmd-resp" id="cmdResp">
          <button class="cmd-close-btn" onclick="window._cmdClose()">×</button>
          <div id="cmdRespBody"></div>
        </div>
      `;

      insertAfter.insertAdjacentElement('afterend', bar);

      document.getElementById('cmdInput').addEventListener('keydown', e => {
        if(e.key === 'Enter') window._cmdRun();
        if(e.key === 'Escape') window._cmdClose();
      });
    }

    // Inject now and re-inject on nav changes
    injectIntoView();

    // Re-inject whenever nav changes (views switch)
    const origNav = window.nav;
    window.nav = function(id, el) {
      if(origNav) origNav(id, el);
      setTimeout(injectIntoView, 50);
    };
  }

  window._cmdClose = function() {
    const resp = document.getElementById('cmdResp');
    if(resp) resp.classList.remove('open');
    const inp = document.getElementById('cmdInput');
    if(inp) inp.value = '';
  };

  window._cmdShow = function(tag, cls, msg, actions) {
    const body = document.getElementById('cmdRespBody');
    const resp = document.getElementById('cmdResp');
    if(!body || !resp) return;
    const btns = (actions||[]).map(a =>
      `<button class="cmd-act ${a.p?'primary':''}" onclick="${a.fn}">${a.l}</button>`
    ).join('');
    body.innerHTML = `<span class="cmd-tag ${cls}">${tag}</span>${msg}${btns ? '<div class="cmd-actions">'+btns+'</div>' : ''}`;
    resp.classList.add('open');
  };

  window._cmdRun = async function() {
    const inp = document.getElementById('cmdInput');
    if(!inp) return;
    const input = inp.value.trim();
    if(!input) return;
    const btn = document.getElementById('cmdSend');
    if(btn) { btn.disabled = true; btn.textContent = '...'; }

    const lower = input.toLowerCase();

    // Navigation shortcuts
    const navMap = {
      dashboard:'dashboard', revenue:'revenue', waterfall:'revenue',
      client:'client', childpilot:'client', hours:'hours', capacity:'hours',
      pipeline:'pipeline', cash:'cashflow', cashflow:'cashflow',
      expenses:'expenses', subscriptions:'subscriptions',
      partners:'partners', split:'partners', sheets:'sheets', deploy:'deploy'
    };
    for(const [k,v] of Object.entries(navMap)) {
      if(lower.includes('go to '+k) || lower.includes('show '+k) || lower.includes('open '+k) || lower === k) {
        if(typeof nav === 'function') nav(v, null);
        window._cmdShow('NAV','nav','Navigated to '+v+' view.', [{l:'✕ Dismiss',fn:'_cmdClose()'}]);
        if(btn) { btn.disabled=false; btn.textContent='Ask'; }
        return;
      }
    }

    // Quick answers from live data
    if(lower.includes('q2 gap') || lower.includes('revenue gap') || lower.includes('how far')) {
      window._cmdShow('ANSWER','answer','Q2 gap is <strong>$29,700/mo</strong>. Current: $6,800 · Q2 target: $36,500. Zoetis ($22,500/mo) closes most of it alone.', [{l:'→ Pipeline',fn:"nav('pipeline',null);_cmdClose()",p:true},{l:'✕',fn:'_cmdClose()'}]);
      if(btn) { btn.disabled=false; btn.textContent='Ask'; } return;
    }
    if(lower.includes('burn') || lower.includes('monthly cost')) {
      window._cmdShow('ANSWER','answer','Monthly burn: <strong>$392.30</strong> in subscriptions. YTD: $4,588. Add line items in Subscriptions tab.', [{l:'→ Subscriptions',fn:"nav('subscriptions',null);_cmdClose()",p:true},{l:'✕',fn:'_cmdClose()'}]);
      if(btn) { btn.disabled=false; btn.textContent='Ask'; } return;
    }
    if(lower.includes('net this month') || lower.includes('profit') || lower.includes('take home')) {
      window._cmdShow('ANSWER','answer','Net this month: <strong>$6,408</strong> ($6,800 revenue − $392 burn). That's <strong>$3,204 each</strong> at 50/50.', [{l:'→ Cash Flow',fn:"nav('cashflow',null);_cmdClose()",p:true},{l:'✕',fn:'_cmdClose()'}]);
      if(btn) { btn.disabled=false; btn.textContent='Ask'; } return;
    }
    if(lower.includes('zoetis') && (lower.includes('expense') || lower.includes('reimburse'))) {
      window._cmdShow('ANSWER','answer','<strong>$1,432.81</strong> Zoetis NJ workshop expenses not submitted. Mindy's personal card. Submit to Zoetis immediately.', [{l:'→ Expenses',fn:"nav('expenses',null);_cmdClose()",p:true},{l:'✕',fn:'_cmdClose()'}]);
      if(btn) { btn.disabled=false; btn.textContent='Ask'; } return;
    }
    if(lower.includes('health') || lower.includes('score')) {
      window._cmdShow('ANSWER','answer','Business health score: <strong>52/100</strong>. 1 active client, $29,700 Q2 gap, Zoetis stalled, $1,433 unreimbursed. Submit expenses + re-engage Zoetis to move the needle.', [{l:'✕',fn:'_cmdClose()'}]);
      if(btn) { btn.disabled=false; btn.textContent='Ask'; } return;
    }

    // Log hours shortcut
    const hrs = input.match(/log (\d+)\s*h(?:ours?)?\s+(?:on\s+)?(.+?)\s+for\s+(\w+)/i);
    if(hrs) {
      const [,h,client,person] = hrs;
      const hEl = document.getElementById('fh-hrs');
      const pEl = document.getElementById('fh-person');
      const modal = document.getElementById('addHoursModal');
      if(hEl) hEl.value = h;
      if(pEl) { const opt = [...pEl.options].find(o=>o.text.toLowerCase().includes(person.toLowerCase())); if(opt) pEl.value=opt.value; }
      if(modal) modal.classList.add('open');
      window._cmdShow('DATA','data',`Pre-filled hours form: ${h}h for ${person} on ${client}. Review and confirm.`, [{l:'✕ Dismiss',fn:'_cmdClose()'}]);
      if(btn) { btn.disabled=false; btn.textContent='Ask'; } return;
    }

    // Add reminder shortcut
    if(lower.startsWith('remind') || lower.startsWith('add reminder')) {
      const txt = input.replace(/^add reminder[:\s]*/i,'').replace(/^remind me[:\s]*/i,'').replace(/^remind[:\s]*/i,'').trim();
      if(txt && typeof S !== 'undefined') {
        S.reminders.push({id:S.nextId++,title:txt,body:'Added via command bar.',urgency:'info',done:false,meta:'Command bar · '+new Date().toLocaleDateString()});
        if(typeof renderReminders==='function') renderReminders();
        if(typeof syncToFirebase==='function') syncToFirebase();
        window._cmdShow('DATA','data',`Reminder added: "${txt}"`,[{l:'→ View bell',fn:'toggleReminders();_cmdClose()',p:true},{l:'✕',fn:'_cmdClose()'}]);
      } else {
        window._cmdShow('DATA','data','Reminder noted — make sure you are signed in for it to save.',  [{l:'✕',fn:'_cmdClose()'}]);
      }
      if(btn) { btn.disabled=false; btn.textContent='Ask'; } return;
    }

    // Code change → route to Claude
    const codeWords = ['add a','create a','build a','new tab','new view','new section','change the','update the','add field','invoice tab','tracker','report','export'];
    if(codeWords.some(w=>lower.includes(w))) {
      const prompt = encodeURIComponent('CFO Command dashboard update request: ' + input + '. Context: dashboard at burowsandco.github.io/cfo-command built on Firebase + GitHub Pages. Repo: github.com/Burowsandco/cfo-command');
      window._cmdShow('CODE','code','This needs a code change. Open Claude with the request pre-written — it will build and commit directly to GitHub.',[{l:'→ Open Claude to build this',fn:`window.open('https://claude.ai/new?q=${prompt}','_blank')`,p:true},{l:'✕',fn:'_cmdClose()'}]);
      if(btn) { btn.disabled=false; btn.textContent='Ask'; } return;
    }

    // Claude API fallback
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:400,
          system:'You are the CFO assistant for Burrows & Co. Digital Advisory. Current snapshot: ChildPilot retainer $6,800/mo active, monthly burn $392.30, net $6,408, Q2 target $36,500 (gap $29,700), Zoetis $22,500 pipeline stalled, $1,432.81 Zoetis expenses unreimbursed, 50/50 split Phil Burrows & Mindy Stotz. Answer in plain English under 60 words.',
          messages:[{role:'user',content:input}]
        })
      });
      const d = await r.json();
      const ans = d.content?.[0]?.text || 'No response received.';
      window._cmdShow('ANSWER','answer',ans,[{l:'✕ Dismiss',fn:'_cmdClose()'}]);
    } catch(e) {
      const q = encodeURIComponent(input+' — Burrows & Co. CFO dashboard context');
      window._cmdShow('ROUTE','code','Routing to Claude...',[{l:'→ Open Claude',fn:`window.open('https://claude.ai/new?q=${q}','_blank')`,p:true},{l:'✕',fn:'_cmdClose()'}]);
    }

    if(btn) { btn.disabled=false; btn.textContent='Ask'; }
  };

  // Init
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCmdBar);
  } else {
    initCmdBar();
  }
})();
