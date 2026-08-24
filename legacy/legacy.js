let gd={1:{title:'',domain:''},2:{title:'',domain:''},3:{title:'',domain:''}};
const trackProgress={};
const tabRenderedSig={q1:'',q2:'',mid:'',end:''};
function autoTickGrid(){
  // Per-goal quarterly: pull gid directly from each textarea
  document.querySelectorAll('[data-checkin][data-field="done"]').forEach(el=>{
    const gid=parseInt(el.dataset.goal);
    if(!gid && gid!==0) return;
    const key=el.dataset.checkin;
    if(!trackProgress[gid]) trackProgress[gid]={q1:false,mid:false,q2:false,end:false};
    trackProgress[gid][key]=el.value.trim().length>2;
  });
  // Mid-year and Year-end: any textarea filled marks the column for every active goal
  const midFilled=Array.from(document.querySelectorAll('[data-checkin="mid"]')).some(el=>el.value.trim().length>2);
  const endFilled=Array.from(document.querySelectorAll('[data-checkin="end"]')).some(el=>el.value.trim().length>2);
  const allGids=new Set();
  for(let i=1;i<=3;i++){if(gd[i] && gd[i].title && gd[i].title.trim()) allGids.add(i);}
  Object.keys(trackProgress).forEach(k=>{const n=parseInt(k);if(!isNaN(n)) allGids.add(n);});
  allGids.forEach(gid=>{
    if(!trackProgress[gid]) trackProgress[gid]={q1:false,mid:false,q2:false,end:false};
    trackProgress[gid].mid=midFilled;
    trackProgress[gid].end=endFilled;
  });
  renderTrackGrid();
  updateTimelineDots();
}

// Show completed timeline dots when ANY goal has been ticked for that check-in
function updateTimelineDots(){
  const anyQ1=Object.values(trackProgress).some(p=>p && p.q1);
  const anyMid=Object.values(trackProgress).some(p=>p && p.mid);
  const anyQ2=Object.values(trackProgress).some(p=>p && p.q2);
  const anyEnd=Object.values(trackProgress).some(p=>p && p.end);
  const tl=document.querySelector('.dash-timeline .tl-track');
  if(!tl) return;
  const dots=tl.querySelectorAll('.tl-dot');
  // Order: publish(0), Q1(1), Mid(2), Q2(3), End(4)
  const map=[null,anyQ1,anyMid,anyQ2,anyEnd];
  for(let i=1;i<=4;i++){
    const d=dots[i];if(!d) continue;
    if(map[i]){d.classList.remove('future','now');d.classList.add('done');d.innerHTML='✓';}
  }
}

// Event delegation on the dashboard screen: fires for EVERY textarea input
// inside the dashboard, regardless of when it was rendered. This is the
// reliable path that does not depend on inline oninput handlers being set.
(function bindDashAutoTick(){
  const bind=()=>{
    const dash=document.getElementById('screen-dash');
    if(dash && !dash.dataset.autotickBound){
      dash.addEventListener('input',function(ev){
        const t=ev.target;
        if(t && t.tagName==='TEXTAREA' && t.dataset && t.dataset.checkin){
          autoTickGrid();
        }
      });
      dash.dataset.autotickBound='1';
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
})();
function getActiveGoals(){
  const list=[];
  for(let i=1;i<=3;i++){
    if(gd[i] && gd[i].title && gd[i].title.trim()){
      list.push({id:i,title:gd[i].title.trim(),domain:gd[i].domain||''});
    }
  }
  return list;
}
function getGoalsSig(){return getActiveGoals().map(g=>g.id+':'+g.title+':'+(g.domain||'')).join('|');}
function escapeHtml(str){return String(str).replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[c]));}
function renderTrackGrid(){
  const tbody=document.getElementById('track-grid-body');
  if(!tbody) return;
  const goals=getActiveGoals();
  if(goals.length===0){
    tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted);font-style:italic;font-size:13.5px">Once you set development goals on the previous step, they will appear here for tracking.</td></tr>';
    return;
  }
  tbody.innerHTML=goals.map(g=>{
    const p=trackProgress[g.id]||{};
    const cell=v=>`<td class="cen"><span class="tg-box ${v?'on':''}">${v?'✓':''}</span></td>`;
    return `<tr><td><div class="tg-goal">${escapeHtml(g.title)}</div>${g.domain?`<div class="tg-domain">${escapeHtml(g.domain)}</div>`:''}</td>${cell(p.q1)}${cell(p.mid)}${cell(p.q2)}${cell(p.end)}</tr>`;
  }).join('');
}
function renderQuarterlyTab(tabId,checkinKey){
  const el=document.getElementById(tabId);
  if(!el) return;
  const sig=getGoalsSig();
  if(tabRenderedSig[checkinKey]===sig && el.children.length>0) return;
  const goals=getActiveGoals();
  if(goals.length===0){
    el.innerHTML='<div style="background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:32px;text-align:center;color:var(--muted);font-style:italic;font-size:13.5px">Set development goals first to start tracking your quarterly progress.</div>';
    tabRenderedSig[checkinKey]=sig;
    return;
  }
  el.innerHTML=goals.map(g=>`
    <div class="dash-goal-card">
      <div style="padding:18px 22px;border-bottom:1px solid var(--cream-border)"><div class="dg-title">${escapeHtml(g.title)}</div>${g.domain?`<div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:3px">${escapeHtml(g.domain)}</div>`:''}</div>
      <div style="padding:18px 22px">
        <div class="micro-q">
          <div class="mq-text">How well am I progressing on this goal?</div>
          <div class="scale-row"><div class="scale-lbl">Low</div><div class="scale-dots"><button class="scale-dot" onclick="pick(this)">1</button><button class="scale-dot" onclick="pick(this)">2</button><button class="scale-dot" onclick="pick(this)">3</button><button class="scale-dot" onclick="pick(this)">4</button><button class="scale-dot" onclick="pick(this)">5</button></div><div class="scale-lbl">High</div></div>
        </div>
        <div style="font-size:14px;font-weight:500;color:var(--ink);margin-bottom:6px">What have I done this quarter?</div>
        <textarea class="micro-ta" data-goal="${g.id}" data-checkin="${checkinKey}" data-field="done" rows="3" placeholder="Reflect on actual progress, not intentions. A few honest lines is enough." oninput="autoTickGrid()"></textarea>
        <div style="font-size:14px;font-weight:500;color:var(--ink);margin-top:14px;margin-bottom:6px">Any course correction needed?</div>
        <textarea class="micro-ta" rows="2" placeholder="Any adjustments to the goal or your approach..."></textarea>
      </div>
    </div>
  `).join('')+`
    <div style="display:flex;justify-content:flex-end;margin-top:18px">
      <button class="btn btn-primary save-checkin-btn" onclick="saveQuarterly('${tabId}','${checkinKey}',this)">💾 Save Check-in</button>
    </div>`;
  tabRenderedSig[checkinKey]=sig;
}
function renderConversationTab(tabId,checkinKey,heading,leftLbl,leftPh,rightLbl,rightPh,bottomLbl,bottomPh,bottomSharedWithManager){
  const el=document.getElementById(tabId);
  if(!el) return;
  const sig=getGoalsSig();
  if(tabRenderedSig[checkinKey]===sig && el.children.length>0) return;
  const goals=getActiveGoals();
  if(goals.length===0){
    el.innerHTML='<div style="background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:32px;text-align:center;color:var(--muted);font-style:italic;font-size:13.5px">Set development goals first to use this conversation.</div>';
    tabRenderedSig[checkinKey]=sig;
    return;
  }
  const sharedChip='<span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:20px;background:var(--blue-xl);color:var(--blue);margin-left:8px;vertical-align:middle">Shared with manager</span>';
  const bottomLblHtml=bottomSharedWithManager?(bottomLbl+sharedChip):bottomLbl;
  el.innerHTML=`
    <div class="dash-goal-card" style="padding:22px">
      <div class="dg-title" style="margin-bottom:16px">${heading}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div><div style="font-size:14px;font-weight:500;color:var(--ink);margin-bottom:8px">${leftLbl}</div><textarea class="micro-ta" data-checkin="${checkinKey}" rows="4" placeholder="${leftPh}" oninput="autoTickGrid()"></textarea></div>
        <div><div style="font-size:14px;font-weight:500;color:var(--ink);margin-bottom:8px">${rightLbl}</div><textarea class="micro-ta" data-checkin="${checkinKey}" rows="4" placeholder="${rightPh}" oninput="autoTickGrid()"></textarea></div>
      </div>
      <div style="margin-top:16px"><div style="font-size:14px;font-weight:500;color:var(--ink);margin-bottom:8px">${bottomLblHtml}</div><textarea class="micro-ta" data-checkin="${checkinKey}" rows="3" placeholder="${bottomPh}" oninput="autoTickGrid()"></textarea></div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:18px">
      <button class="btn btn-primary save-checkin-btn" onclick="saveConversation('${tabId}','${checkinKey}',this)">💾 Save and share with manager</button>
    </div>`;
  tabRenderedSig[checkinKey]=sig;
}
function saveQuarterly(tabId,checkinKey,btn){
  const tab=document.getElementById(tabId);
  if(!tab) return;
  // Require every textarea (excluding the date input) in this tab to be filled
  const allTextareas=tab.querySelectorAll('textarea');
  const empties=Array.from(allTextareas).filter(el=>el.value.trim().length<3);
  if(empties.length>0){
    alert('Please fill in every box for this check-in before saving. There '+(empties.length===1?'is 1 field':'are '+empties.length+' fields')+' still empty.');
    empties[0].focus();
    empties[0].scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  const goals=getActiveGoals();
  goals.forEach(g=>{if(!trackProgress[g.id]) trackProgress[g.id]={q1:false,mid:false,q2:false,end:false};});
  tab.querySelectorAll(`[data-checkin="${checkinKey}"][data-field="done"]`).forEach(el=>{
    const gid=parseInt(el.dataset.goal);
    if(trackProgress[gid]) trackProgress[gid][checkinKey]=true;
  });
  renderTrackGrid();
  if(typeof updateTimelineDots==='function') updateTimelineDots();
  flashSaved(btn,'✓ Saved');
}
function saveConversation(tabId,checkinKey,btn){
  const tab=document.getElementById(tabId);
  if(!tab) return;
  const allTextareas=tab.querySelectorAll('textarea');
  const empties=Array.from(allTextareas).filter(el=>el.value.trim().length<3);
  if(empties.length>0){
    alert('Please fill in every box for this conversation before sharing. There '+(empties.length===1?'is 1 field':'are '+empties.length+' fields')+' still empty.');
    empties[0].focus();
    empties[0].scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  const goals=getActiveGoals();
  goals.forEach(g=>{if(!trackProgress[g.id]) trackProgress[g.id]={q1:false,mid:false,q2:false,end:false};});
  goals.forEach(g=>{trackProgress[g.id][checkinKey]=true;});
  renderTrackGrid();
  if(typeof updateTimelineDots==='function') updateTimelineDots();
  flashSaved(btn,'✓ Saved and shared with manager');
}
function flashSaved(btn,msg){
  if(!btn) return;
  const orig=btn.innerHTML;
  btn.innerHTML=msg;
  btn.disabled=true;
  btn.style.opacity='0.75';
  setTimeout(()=>{btn.innerHTML=orig;btn.disabled=false;btn.style.opacity='';},2400);
}
function refreshDashboard(){
  renderTrackGrid();
  renderQuarterlyTab('dtab-q1','q1');
  renderQuarterlyTab('dtab-q2','q2');
  renderConversationTab('dtab-mid','mid','Mid-Year Conversation','What is working well?','Strengths used, progress made...','What needs to change?','Course corrections or adjustments...','Support I need from my manager','Be specific about what would help most.',true);
  renderConversationTab('dtab-end','end','Year-End Conversation','What worked?','Honest reflection on the year...','What did not work?','What would you do differently...','Strengths I used and growth I achieved','What did you actually build this year...',true);
}
function showSdpFab(){
  const el=document.getElementById('sdp-fab');
  if(el) el.classList.add('visible');
}
function openMySDPLetter(){
  document.getElementById('modal-letter').classList.add('open');
}
let goalCount=2;
let completedSteps=new Set();
const je=[];
const prog={landing:0,reflect:20,vision:32,goals:45,action:65,review:80,manager:90,congrats:95,dash:100,toolkit:0,team:0,reportee:0,buhr:0};
const journeyOrder=['reflect','goals','action','review','manager','dash'];

function goToScreen(name){
  const requestedName=name;
  const screenName=(name==='action')?'goals':name;
  markProgressForNavigation(requestedName);
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const sc=document.getElementById('screen-'+screenName);
  if(sc) sc.classList.add('active');
  const sb=document.getElementById('sidebar');
  if(sb){sb.style.display='block';sb.className='sidebar visible';}
  if(requestedName==='review' && typeof renderReviewScreen==='function') renderReviewScreen();
  updateSidebar(requestedName);
  updateRoleChrome();
  const pf=document.getElementById('prog-fill');
  const pl=document.getElementById('prog-label');
  if(pf) pf.style.width=(prog[requestedName]||0)+'%';
  if(pl) pl.textContent=(prog[requestedName]||0)+'% complete';
  if(requestedName==='dash' && typeof refreshDashboard==='function') refreshDashboard();
  if(completedSteps && completedSteps.has('review') && typeof showSdpFab==='function') showSdpFab();
  if(requestedName==='action'){
    setTimeout(()=>scrollToActionPlan(),80);
  }else{
    window.scrollTo({top:0,behavior:'smooth'});
  }
}

function sidebarNav(name){
  const el=document.getElementById('snav-'+name);
  goToScreen(name);
}

function updateSidebar(name){
  if(name==='vision') name='reflect';
  if(name==='reportee') name='team';
  if(name==='congrats') name='review';
  const lndg=document.getElementById('snav-landing');
  if(lndg){lndg.classList.remove('active');if(name==='landing')lndg.classList.add('active');}
  ['reflect','goals','action','review','manager','dash','team'].forEach(k=>{
    const el=document.getElementById('snav-'+k);
    if(!el)return;
    el.classList.remove('active','done','locked');
    if(completedSteps.has(k)&&k!==name) el.classList.add('done');
    else if(k===name) el.classList.add('active');
    else if(!completedSteps.has(k)&&!isUnlocked(k,name)) el.classList.add('locked');
  });
}

function isUnlocked(k,activeKey){
  return true;
}

function markProgressForNavigation(name){
  const idx=journeyOrder.indexOf(name);
  if(idx<=0) return;
  for(let i=0;i<idx;i++) completedSteps.add(journeyOrder[i]);
}

function scrollToActionPlan(){
  const label=Array.from(document.querySelectorAll('#screen-goals div')).find(el=>el.textContent.trim()==='Action Plan');
  if(label) label.scrollIntoView({behavior:'smooth',block:'center'});
}

function startJourney(){completedSteps.add('landing');goToScreen('reflect');}
function closeModal(id){const el=document.getElementById(id);if(el)el.classList.remove('open');}

function showPillar(name){
  const page=(name==='energy')?'will':name;
  ['will','understanding'].forEach(p=>{
    const el=document.getElementById('pillar-'+p);
    if(el) el.style.display=p===page?'block':'none';
    const btn=document.getElementById('pnav-'+p);
    if(!btn)return;
    btn.className='btn btn-secondary';
    btn.style.fontSize='14px';btn.style.padding='10px 22px';
    btn.style.background='';btn.style.color='';
  });
  const active=document.getElementById('pnav-'+page);
  if(active){active.style.background='var(--blue)';active.style.color='#fff';active.className='btn';active.style.padding='10px 22px';}
  window.scrollTo({top:0,behavior:'smooth'});
}

let openGoal = 0;

function toggleGoalCard(n){
  const card = document.getElementById('gc-'+n);
  if(!card) return;
  if(openGoal === n){
    card.classList.remove('expanded');
    openGoal = 0;
    return;
  }
  if(openGoal){
    const prev = document.getElementById('gc-'+openGoal);
    if(prev) prev.classList.remove('expanded');
  }
  card.classList.add('expanded');
  openGoal = n;
  // Scroll the card header into view (top of viewport) for clarity
  try { card.scrollIntoView({behavior:'smooth', block:'start'}); } catch(e){}
}

function updateGoalSummary(n){
  const el = document.getElementById('goal-sum-'+n);
  if(!el) return;
  const t = (gd[n] && gd[n].title) || '';
  const d = (gd[n] && gd[n].domain) || '';
  if(!t && !d){
    el.textContent = 'Click to fill in this goal';
    el.classList.add('empty');
    return;
  }
  el.classList.remove('empty');
  const parts = [];
  if(d) parts.push(d);
  if(t) parts.push(t);
  el.textContent = parts.join(' · ');
}

function addGoalCombined(){
  if(goalCount>=3){alert('You can add up to 3 development goals.');return;}
  goalCount++;const n=goalCount;gd[n]={title:'',domain:''};
  const el=document.createElement('div');el.className='dgoal-card-v3 anim';el.id='gc-'+n;
  el.innerHTML=`
    <div class="goal-head" onclick="toggleGoalCard(${n})">
      <div class="goal-head-left">
        <div class="goal-num">Development Goal 0${n}</div>
        <div class="goal-sum empty" id="goal-sum-${n}">Click to fill in this goal</div>
      </div>
      <div class="goal-head-right">
        <button class="dgoal-del" onclick="event.stopPropagation();deleteGoal(${n})">Remove</button>
        <span class="goal-chev">&#9660;</span>
      </div>
    </div>
    <div class="goal-body" id="goal-body-${n}">
    <div style="margin-bottom:14px">
      <span class="goal-field-label">Goal Domain</span>
      <select class="goal-type-select" onchange="gd[${n}].domain=this.value;showTypeDesc(this,'td-${n}');updateGoalSummary(${n})">
        <option value="">Select...</option>
        <option value="Functional">Functional</option>
        <option value="Behavioural">Behavioural</option>
        <option value="Leadership">Leadership</option>
      </select>
      <div class='g-type-desc func' id='td-${n}'></div>
    </div>
    <div style="margin-bottom:14px">
      <span class="goal-field-label">What I want to build</span>
      <input type="text" class="g-input" id="gt-${n}" placeholder="Give this goal a clear, specific title..." oninput="gd[${n}].title=this.value;updateGoalSummary(${n})" style="font-size:16px;padding:10px 0;font-family:var(--serif)">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">
      <div>
        <span class="goal-field-label">Why does this matter to me?</span>
        <textarea class="q-input" id="gwhy-${n}" rows="3" placeholder="In your own words, connected to your reflection."></textarea>
      </div>
      <div>
        <span class="goal-field-label">I will know I have grown when...</span>
        <textarea class="q-input" id="ggrown-${n}" rows="3" placeholder="A behaviour or moment, not a number."></textarea>
      </div>
    </div>
    <div style="background:var(--cream);border-radius:var(--r-sm);padding:18px;border:1px solid var(--cream-border)">
      <div style="font-size:12px;font-weight:600;color:var(--ink);text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Action Plan</div>
      <div style="display:flex;gap:7px;margin-bottom:10px;flex-wrap:wrap">
        <span class="dlc-label dlc-do">Do · 70%</span>
        <span class="dlc-label dlc-learn">Learn · 10%</span>
        <span class="dlc-label dlc-connect">Connect · 20%</span>
      </div>
      <textarea class="ap-input-v3" id="gap-${n}" rows="6" placeholder="› What will I do at work?&#10;› Who will I learn from?&#10;› What will I read or complete?"></textarea>
      <div style="margin-top:14px">
        <label style="font-size:12px;font-weight:600;color:var(--ink);text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:6px">Support I need</label>
        <textarea id="gsupport-${n}" style="width:100%;border:1px solid var(--cream-border);border-radius:var(--r-sm);padding:10px 13px;font-size:13px;min-height:56px;resize:none;outline:none;background:#fff;line-height:1.65;font-family:var(--sans)" placeholder="What do you need from your manager or the organisation?"></textarea>
      </div>
    </div>
    </div>`;
  document.getElementById('goals-list').appendChild(el);
  toggleGoalCard(n);
}

function deleteGoal(n){
  if(!confirm('Remove Development Goal 0'+n+'?')) return;
  const e=document.getElementById('gc-'+n);
  if(e) e.remove();
  if(openGoal === n) openGoal = 0;
  if(gd && gd[n]) delete gd[n];
}

function showTypeDesc(sel,descId){
  const val=sel.value;
  const desc=document.getElementById(descId);
  if(!desc)return;
  const typeInfo={
    'Functional':{cls:'func',text:'<strong>Functional Goal:</strong> Skills and knowledge you want to build.<br><em style="opacity:.8">e.g. Root cause analysis, data fluency, financial modelling</em>'},
    'Behavioural':{cls:'behav',text:'<strong>Behavioural Goal:</strong> How you work and show up.<br><em style="opacity:.8">e.g. Be more direct, listen before responding</em>'},
    'Leadership':{cls:'lead',text:'<strong>Leadership Goal:</strong> How you grow the people around you.<br><em style="opacity:.8">e.g. Coach a team member, lead cross-functionally</em>'}
  };
  if(!val||!typeInfo[val]){desc.classList.remove('visible','func','behav','lead');return;}
  desc.className='g-type-desc '+typeInfo[val].cls+' visible';
  desc.innerHTML=typeInfo[val].text;
}

function toggleSP(h){
  const b=h.nextElementSibling,a=h.querySelector('.sp-arrow');
  const open=b.classList.contains('open');
  document.querySelectorAll('.sp-acc-b').forEach(x=>x.classList.remove('open'));
  document.querySelectorAll('.sp-arrow').forEach(x=>x.classList.remove('open'));
  if(!open){b.classList.add('open');a.classList.add('open');}
}

function toggleAPAcc(h){
  const b=h.nextElementSibling,a=h.querySelector('.ap-acc-arr');
  const open=b.classList.contains('open');
  document.querySelectorAll('.ap-acc-b').forEach(x=>{x.style.display='none';});
  document.querySelectorAll('.ap-acc-arr').forEach(x=>x.classList.remove('open'));
  if(!open){b.style.display='block';a.classList.add('open');}
}

let shareScope='all';
function setShareScope(v){
  shareScope=v;
  const a=document.getElementById('share-opt-all');
  const g=document.getElementById('share-opt-goals');
  if(a){a.style.borderColor=(v==='all')?'var(--blue)':'var(--cream-border)';a.style.background=(v==='all')?'var(--blue-xl)':'#fff';}
  if(g){g.style.borderColor=(v==='goals')?'var(--blue)':'var(--cream-border)';g.style.background=(v==='goals')?'var(--blue-xl)':'#fff';}
}
function readField(id){
  const el=document.getElementById(id);
  return el ? el.value.trim() : '';
}
function renderReviewScreen(){
  const reflectionEl=document.getElementById('review-reflection');
  if(reflectionEl){
    const questions=[
      ['2','What gives me energy'],
      ['3','Where I thrive'],
      ['4','What gets in my way'],
      ['5','What I want to strengthen'],
      ['6','Who I want to become']
    ];
    reflectionEl.innerHTML=questions.map(([q,label])=>{
      const ta=document.querySelector('textarea[data-q="'+q+'"]');
      const value=ta&&ta.value.trim()?ta.value.trim():'Not answered yet.';
      return `<div style="background:var(--cream);border:1px solid var(--cream-border);border-radius:var(--r-sm);padding:13px 14px">
        <div style="font-size:11px;font-weight:700;color:var(--blue);letter-spacing:.07em;text-transform:uppercase;margin-bottom:6px">${label}</div>
        <div style="font-size:13px;color:var(--mid);line-height:1.65">${escapeHtml(value)}</div>
      </div>`;
    }).join('');
  }
  const goalsEl=document.getElementById('review-goals');
  if(goalsEl){
    const goals=[];
    for(let i=1;i<=goalCount;i++){
      const title=readField('gt-'+i);
      if(!title) continue;
      goals.push({
        i,
        title,
        domain:readField('gd-'+i),
        why:readField('gwhy-'+i),
        grown:readField('ggrown-'+i),
        action:readField('gap-'+i),
        support:readField('gsupport-'+i)
      });
    }
    goalsEl.innerHTML=goals.length?goals.map(g=>`<div style="background:#fff;border:1px solid var(--border);border-radius:var(--r-sm);padding:16px">
      <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:10px">
        <div style="font-size:16px;font-weight:700;color:var(--ink)">${escapeHtml(g.title)}</div>
        <div style="font-size:11px;font-weight:700;color:var(--blue);background:var(--blue-xl);border:1px solid var(--blue-l);border-radius:999px;padding:4px 9px;white-space:nowrap">${escapeHtml(g.domain||'No domain')}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div><div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Why it matters</div><div style="font-size:13px;color:var(--mid);line-height:1.6">${escapeHtml(g.why||'Not added yet.')}</div></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Growth signal</div><div style="font-size:13px;color:var(--mid);line-height:1.6">${escapeHtml(g.grown||'Not added yet.')}</div></div>
      </div>
      <div style="background:var(--cream);border-radius:var(--r-sm);padding:12px 13px;margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Action plan</div>
        <div style="font-size:13px;color:var(--mid);line-height:1.65;white-space:pre-wrap">${escapeHtml(g.action||'Not added yet.')}</div>
      </div>
      <div style="font-size:13px;color:var(--mid);line-height:1.6"><strong style="color:var(--ink)">Support needed:</strong> ${escapeHtml(g.support||'Not added yet.')}</div>
    </div>`).join(''):'<div style="font-size:13px;color:var(--muted);font-style:italic">No development goals have been added yet.</div>';
  }
}
function submitPlan(){
  completedSteps.add('review');
  showSdpFab();
  const sub=document.getElementById('congrats-sub');
  if(sub){
    sub.textContent=(shareScope==='goals')
      ? 'Your development goals have been shared with your manager for review. Your reflection stays private to you. This is the beginning, not the end. You will come back to this, update it, and grow into it.'
      : 'Your full plan, your reflection and your goals, has been shared with your manager for review. This is the beginning, not the end. You will come back to this, update it, and grow into it.';
  }
  goToScreen('congrats');
}
function publishFinal(){
  const all=['c1','c2','c3'].every(id=>document.getElementById(id).classList.contains('on'));
  if(!all){alert('Please complete all checklist items before publishing.');return;}
  completedSteps.add('dash');goToScreen('dash');
}
function toggleChk(id){document.getElementById(id).classList.toggle('on');}
function toggleDG(id){
  const ex=document.getElementById(id),arr=document.getElementById('darr-'+id);
  ex.classList.toggle('open');arr.classList.toggle('open');
}
function switchDashTab(btn,contentId){
  document.querySelectorAll('.dash-tab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.dash-tab-content').forEach(c=>c.classList.remove('on'));
  const t=document.getElementById(contentId);if(t)t.classList.add('on');
}
function pick(btn){btn.closest('.scale-dots').querySelectorAll('.scale-dot').forEach(d=>d.classList.remove('on'));btn.classList.add('on');}

// Journal
const jpDateEl=document.getElementById('jp-date');
if(jpDateEl) jpDateEl.textContent=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
function toggleJournal(){document.getElementById('jp').classList.toggle('open');renderJE();}
function saveJE(){const t=document.getElementById('jp-text').value.trim();if(!t)return;je.unshift({date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'}),text:t});document.getElementById('jp-text').value='';renderJE();}
function renderJE(){const c=document.getElementById('jp-entries');if(!je.length){c.innerHTML='<div style="font-size:12px;color:var(--muted);text-align:center;padding:10px">No notes yet</div>';return;}c.innerHTML=je.slice(0,5).map(e=>`<div class="jp-entry"><div class="jp-entry-date">${e.date}</div><div class="jp-entry-text">${e.text}</div></div>`).join('');}

// Print
function printLetter(){window.print();}

// Populate letter (with FULL goal details)
function populateLetter(){
  const qs={};
  document.querySelectorAll('.q-tracked').forEach(ta=>{
    const q=ta.getAttribute('data-q');
    if(q) qs[q]=ta.value.trim();
  });
  const fill=(id,val,ph)=>{
    const el=document.getElementById(id);if(!el)return;
    if(val&&val.length>2){el.textContent=val;el.style.fontStyle='normal';el.style.color='var(--ink)';}
    else{el.textContent=ph;el.style.fontStyle='italic';el.style.color='var(--mid)';}
  };
  fill('ltr-q1',qs['1'],'You have not answered Question 1 yet.');
  fill('ltr-q2',qs['2'],'You have not answered Question 2 yet.');
  fill('ltr-q3',qs['3'],'You have not answered Question 3 yet.');
  fill('ltr-q4',qs['4'],'You have not answered Question 4 yet.');
  fill('ltr-q5',qs['5'],'You have not answered Question 5 yet.');
  fill('ltr-q6',qs['6'],'You have not answered Question 6 yet.');
  const goalsEl=document.getElementById('ltr-goals');
  if(!goalsEl)return;
  const readVal=id=>{const el=document.getElementById(id);return el?el.value.trim():'';};
  let goalsHTML='';
  for(let i=1;i<=goalCount;i++){
    const title=readVal('gt-'+i);
    const domain=document.getElementById('gd-'+i)?document.getElementById('gd-'+i).value:'';
    if(!title)continue;
    const why=readVal('gwhy-'+i);
    const grown=readVal('ggrown-'+i);
    const ap=readVal('gap-'+i);
    const support=readVal('gsupport-'+i);
    const pillMap={
      'Functional':  {bg:'#EBF2FA',  border:'#D6E4F7',  color:'#1E5FBA'},
      'Behavioural': {bg:'#95ADD5',  border:'#7BA6E0',  color:'#0E3F87'},
      'Leadership':  {bg:'#1E5FBA',  border:'#0E3F87',  color:'#FFFFFF'}
    };
    const c = pillMap[domain] || {bg:'var(--cream-d)',border:'var(--cream-border)',color:'var(--ink)'};
    const sec=(label,val,placeholder)=>{
      const display = val ? escapeHtml(val) : '<em style="color:var(--pale)">'+placeholder+'</em>';
      return `<div style="padding:14px 0;border-bottom:1px solid var(--cream-border)">
        <div style="font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:5px">${label}</div>
        <div style="font-size:13px;color:var(--mid);line-height:1.7;white-space:pre-wrap">${display}</div>
      </div>`;
    };
    const supportDisplay = support ? escapeHtml(support) : '<em style="color:var(--pale)">Not written yet.</em>';
    goalsHTML += `
      <div style="background:#fff;border:1px solid var(--border);border-radius:var(--r-sm);overflow:hidden;margin-bottom:14px;box-shadow:var(--sh)">
        <div style="background:var(--ink);padding:12px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          ${domain ? '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;padding:3px 10px;border-radius:20px;background:'+c.bg+';color:'+c.color+';border:1px solid '+c.border+'">'+escapeHtml(domain)+'</span>' : ''}
          <div style="font-family:var(--serif);font-size:15px;font-weight:500;color:#fff">Goal ${i}: ${escapeHtml(title)}</div>
        </div>
        <div style="padding:4px 18px 14px">
          ${sec('Why does this matter to me', why, 'Not written yet.')}
          ${sec('I will know I have grown when', grown, 'Not written yet.')}
          ${sec('Action plan', ap, 'Not written yet.')}
          <div style="padding:14px 0 4px">
            <div style="font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:5px">Support I need</div>
            <div style="font-size:13px;color:var(--mid);line-height:1.7;white-space:pre-wrap">${supportDisplay}</div>
          </div>
        </div>
      </div>`;
  }
  goalsEl.innerHTML = goalsHTML || '<div class="letter-goal-item"><h4>No goals set yet.</h4></div>';
}
document.addEventListener('click',function(e){
  if(e.target&&e.target.getAttribute&&e.target.getAttribute('onclick')&&e.target.getAttribute('onclick').includes('modal-letter')){
    populateLetter();
  }
});

// Q1 Word chips
const q1Words=['Curious','Imaginative','Adventurous','Conventional','Practical','Routine-oriented','Organised','Disciplined','Reliable','Spontaneous','Easy-going','Impulsive','Outgoing','Energetic','Assertive','Reserved','Private','Self-contained','Warm','Empathetic','Trusting','Blunt','Guarded','Calm','Resilient','Grounded','Anxious','Hard on self'];
const q1Selected=new Set();
function initChips(){
  const container=document.getElementById('chips-q1');
  if(!container)return;
  container.innerHTML='';
  q1Words.forEach(word=>{
    const chip=document.createElement('button');
    chip.textContent=word;
    chip.style.cssText='padding:6px 13px;border-radius:20px;font-size:12.5px;font-weight:500;cursor:pointer;border:1.5px solid var(--cream-border);background:#fff;color:var(--mid);transition:all .15s;font-family:var(--sans)';
    chip.onclick=function(){
      if(q1Selected.has(word)){
        q1Selected.delete(word);
        chip.style.background='#fff';chip.style.color='var(--mid)';chip.style.borderColor='var(--cream-border)';
      } else if(q1Selected.size<3){
        q1Selected.add(word);
        chip.style.background='var(--blue)';chip.style.color='#fff';chip.style.borderColor='var(--blue)';
      }
      const ta=document.getElementById('ta-q1');
      if(ta){
        const prev=ta.value.replace(/^Selected:[^\n]+\n?/,'');
        ta.value=q1Selected.size>0?('Selected: '+Array.from(q1Selected).join(', ')+(prev?'\n'+prev:'')):prev;
      }
      updateReflectionProgress();
    };
    container.appendChild(chip);
  });
}

function toggleAsk(btn){
  const body=btn.nextElementSibling;
  const arrow=btn.querySelector('.ask-arrow');
  const isOpen=body.style.display!=='none';
  body.style.display=isOpen?'none':'block';
  if(arrow) arrow.style.transform=isOpen?'':'rotate(180deg)';
}

function toggleResponseGuide(){
  // Back-compat shim
  openResponseGuide(2);
}

const responseGuides = {
  2: {
    label: "Question 2",
    question: "The qualities I want to be known for at work are...",
    bestTip: "<strong>Best tip:</strong> <em>Focus on the capability behind the performance.</em>",
    examples: [
      { weak: "Reliable, results-oriented, team player.",
        whyWeak: "These describe what the role expects, not what matters personally to you.",
        better: "Think of people you admire at work. What do you respect about them beyond performance? What behaviours do you wish people would associate with you?",
        strong: "I want to be known as someone who speaks honestly even when conversations are difficult, and someone who does what they commit to without needing reminders." },
      { weak: "Collaborative and hardworking.",
        whyWeak: "Everyone wants to be seen this way. It does not reveal anything unique.",
        better: "Reflect on situations where you felt proud of how you handled something, not what you achieved. What quality were you displaying?",
        strong: "I want to be known for staying calm during uncertainty and helping others think clearly when situations become stressful." }
    ]
  },
  3: {
    label: "Question 3",
    question: "The work I genuinely enjoy doing is...",
    examples: [
      { weak: "Problem solving, strategic work, cross-functional projects.",
        whyWeak: "These are broad labels that sound impressive but do not tell us what actually energises you.",
        better: "Think about the last time you were fully absorbed in work and lost track of time. What exactly were you doing? Not the project, the activity.",
        strong: "I enjoy taking an ambiguous problem and breaking it into a structure that helps others understand what needs to happen next." },
      { weak: "High-impact projects.",
        whyWeak: "Nobody prefers low-impact work. Think slightly deeper.",
        better: "Ask: if no promotion or recognition was attached, what work would I still volunteer to do?",
        strong: "I enjoy helping people understand complex ideas and seeing the moment when something finally clicks for them." }
    ]
  },
  4: {
    label: "Question 4",
    question: "Looking back on the past year, what moments best reflect who you are at your best?",
    examples: [
      { weak: "Successfully delivered Project X because of my technical knowledge.",
        whyWeak: "Focuses on the outcome rather than the capability that created it.",
        better: "Think about a moment where you added value. Then ask: what did I do that someone else might not have done?",
        strong: "During a supplier discussion, I was able to understand different viewpoints and find common ground. I have noticed I often help people align when there are conflicting priorities." },
      { weak: "Managed stakeholders effectively.",
        whyWeak: "Too generic. Everyone interprets this differently.",
        better: "What specific behaviour helped you? Listening? Influencing? Simplifying complexity?",
        strong: "When discussions became confusing, I was usually able to simplify the issue and help the group move toward a decision." }
    ]
  },
  5: {
    label: "Question 5",
    question: "Looking back on the past year, what moments best reflect where you still have room to grow?",
    bestTip: "<strong>Best tip:</strong> <em>This is the most important question in the SDP.</em>",
    examples: [
      { weak: "Need better time management.",
        whyWeak: "Often a socially acceptable answer that avoids the real issue.",
        better: "Ask 'Why?' three times. What actually caused the delay?",
        strong: "I delayed escalating a risk because I felt I should first have a solution ready. My discomfort with uncertainty created more delay than the problem itself." },
      { weak: "Need to be more proactive.",
        whyWeak: "'Proactive' usually describes the symptom, not the cause.",
        better: "Think about a situation where you knew what should be done but did not do it. What stopped you?",
        strong: "There were situations where I disagreed with a decision but stayed silent because I was not fully confident in my perspective." },
      { weak: "Need to improve communication.",
        whyWeak: "Communication is rarely the root cause.",
        better: "Was it confidence? Conflict avoidance? Fear of criticism? Lack of clarity?",
        strong: "I avoided difficult conversations because I was worried about damaging relationships, even when the feedback would have helped the other person." }
    ]
  },
  6: {
    label: "Question 6",
    question: "Describe the version of yourself that you want to become in the next 3 years.",
    examples: [
      { weak: "Senior manager with greater responsibilities.",
        whyWeak: "Describes a position, not a person.",
        better: "Forget titles. What capabilities, behaviours or mindsets will future-you have that current-you does not?",
        strong: "I want to become someone who can confidently navigate ambiguity, make decisions with incomplete information, and help others stay focused during uncertainty." },
      { weak: "Subject matter expert in my field.",
        whyWeak: "Focuses on status rather than development.",
        better: "What would being an expert allow you to do differently?",
        strong: "I want to become someone whom others trust for judgment, not just technical expertise." },
      { weak: "Leader managing a larger team.",
        whyWeak: "Tells us nothing about how you want to lead.",
        better: "Think about the kind of leader you want people to remember.",
        strong: "I want to be someone who develops people around me and helps them grow more capable and confident through our interactions." }
    ]
  }
};

function openResponseGuide(qNum){
  const data = responseGuides[qNum];
  if(!data) return;
  document.getElementById('rg-eyebrow').textContent = data.label + ' \u00B7 Response Guide';
  document.getElementById('rg-question').textContent = data.question;
  let html = '';
  if(data.bestTip){
    html += '<div class="rg-tip"><div class="rg-tip-star">\u2605</div><div class="rg-tip-text">' + data.bestTip + '</div></div>';
  }
  data.examples.forEach((ex, idx)=>{
    html += '<div class="rg-example">';
    html += '<div class="rg-example-h">Example ' + (idx+1) + '</div>';
    html += '<div class="rg-weak">';
    html +=   '<div class="rg-lbl weak">\u2717 Weak answer</div>';
    html +=   '<div class="rg-quote">' + escapeHtml(ex.weak) + '</div>';
    html +=   '<div class="rg-why"><span class="rg-why-lbl">Why \u00b7</span> ' + escapeHtml(ex.whyWeak) + '</div>';
    html += '</div>';
    html += '<div class="rg-better"><span class="rg-better-lbl">\u2192 Better thinking \u00b7</span> ' + escapeHtml(ex.better) + '</div>';
    html += '<div class="rg-strong">';
    html +=   '<div class="rg-lbl strong">\u2713 Strong answer</div>';
    html +=   '<div class="rg-quote">' + escapeHtml(ex.strong) + '</div>';
    html += '</div>';
    html += '</div>';
  });
  document.getElementById('rg-body').innerHTML = html;
  document.getElementById('modal-response-guide').classList.add('open');
}

function saveDraft(){
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '✓ Saved';
  btn.style.background = 'var(--green)';
  btn.style.color = '#fff';
  btn.style.borderColor = 'var(--green)';
  setTimeout(()=>{btn.innerHTML=orig;btn.style.background='';btn.style.color='';btn.style.borderColor='';},2000);
}

function toggleChkConv(){
  toggleChk('conv-done');
  const done = document.getElementById('conv-done').classList.contains('on');
  const btn = document.getElementById('btn-unlock-manager');
  if(btn){
    btn.disabled = !done;
    btn.style.opacity = done ? '1' : '.4';
    btn.style.cursor = done ? 'pointer' : 'not-allowed';
  }
}

function unlockManagerFeedback(){
  if(!document.getElementById('conv-done').classList.contains('on')) return;
  completedSteps.add('congrats');
  // Unlock manager in sidebar
  const el = document.getElementById('snav-manager');
  if(el) el.classList.remove('locked');
  goToScreen('manager');
}

function updateReflectionProgress(){
  const textareas=document.querySelectorAll('.q-tracked');
  let answered=0;
  textareas.forEach(ta=>{if(ta.value.trim().length>2)answered++;});
  const pct=Math.round((answered/6)*100);
  const fill=document.getElementById('reflect-prog-fill');
  const label=document.getElementById('reflect-prog-label');
  if(fill){fill.style.width=pct+'%';fill.style.background=pct===100?'var(--green)':pct>=50?'var(--blue-m)':'var(--blue)';}
  if(label) label.textContent=answered+' of 6';
}

// Init


// =====================================================
// VALIDATION (min char + mandatory goal)
// =====================================================
function validateReflectionAnswers(){
  const need=[2,3,4,5];
  const missing=[];
  need.forEach(q=>{
    const ta=document.querySelector('textarea[data-q="'+q+'"]');
    if(!ta || ta.value.trim().length < 80) missing.push(q);
  });
  if(missing.length>0){
    alert("Please write at least 80 characters for question "+missing.join(", ")+" before moving on. A short, honest paragraph is usually enough.");
    const first=document.querySelector('textarea[data-q="'+missing[0]+'"]');
    if(first){first.focus();first.scrollIntoView({behavior:'smooth',block:'center'});}
    return false;
  }
  return true;
}
function validateVisionAnswer(){
  const ta=document.querySelector('textarea[data-q="6"]');
  if(!ta || ta.value.trim().length < 80){
    alert("Please write at least 80 characters for question 6 before moving on. Take a moment to describe the version of yourself you want to grow into.");
    if(ta){ta.focus();ta.scrollIntoView({behavior:'smooth',block:'center'});}
    return false;
  }
  return true;
}
function validateAtLeastOneGoal(){
  for(let i=1;i<=3;i++){
    if(gd[i] && gd[i].title && gd[i].title.trim()) return true;
  }
  alert("Please add at least one development goal before publishing your plan. Even one well-formed goal is more useful than none.");
  return false;
}

// =====================================================
// CHECK-IN DATES + TOAST + RELIABILITY UPGRADES
// =====================================================
const checkInDates={q1:'',mid:'',q2:'',end:''};
function todayISO(){
  const d=new Date();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const day=String(d.getDate()).padStart(2,'0');
  return d.getFullYear()+'-'+m+'-'+day;
}
function fmtDate(iso){
  if(!iso) return '';
  const parts=iso.split('-');
  if(parts.length!==3) return iso;
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m=parseInt(parts[1],10);
  if(isNaN(m)||m<1||m>12) return iso;
  return months[m-1]+' '+parseInt(parts[2],10)+', '+parts[0];
}
function setCheckInDate(key,val){
  checkInDates[key]=val;
  renderTrackGrid();
}

// One-time toast
function showToast(msg){
  let t=document.getElementById('app-toast');
  if(!t){
    t=document.createElement('div');
    t.id='app-toast';
    t.className='toast';
    document.body.appendChild(t);
  }
  t.innerHTML='<span class="toast-check">✓</span> '+msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>{t.classList.remove('show');},1800);
}

// Re-render the grid every time the user switches to Track My Goals
const _origSwitchDashTab=switchDashTab;
switchDashTab=function(btn,contentId){
  _origSwitchDashTab(btn,contentId);
  if(contentId==='dtab-goals'){
    try{renderTrackGrid();updateTimelineDots();}catch(e){console.error('grid render error',e);}
  }
};

// =====================================================
// REPORTEES DATA + MANAGER VIEW RENDERING
// =====================================================
const reportees=[
  {
    id:1,
    initials:'RM',
    name:'Rohan Mehta',
    role:'Senior Production Engineer',
    statusLabel:'Submitted, awaiting your feedback',
    statusType:'pending',
    submittedDate:'April 18, 2026',
    shareScope:'all',
    letter:{
      whoIAm:'Curious, methodical, and never quite satisfied with "works for now." I like seeing how things actually run end to end, and I notice details others move past.',
      qualities:'Reliability under pressure, calm in escalations, and a habit of finishing what I start, even when the work goes quiet.',
      energy:'Root-causing problems on the line, mentoring younger operators, and seeing a process move from messy to predictable.',
      strengths:'Led the Q3 retrofit with zero unplanned downtime. The team grew from 4 to 7 without losing pace because I owned the onboarding rather than leaving it to whoever was free.',
      growthAreas:'I sat on the safety audit concern in February for almost two weeks because I wanted to be completely sure. By the time I raised it, the conversation was harder than it needed to be.',
      futureVision:'Three years from now I am the engineer who can take a new line from concept to steady state, who other shift managers come to for tough calls, and who has built a bench of people who can do the same when I move on.'
    },
    goals:[
      {
        title:'Build deep root-cause analysis muscle',
        domain:'Functional',
        whatBuild:'Get properly skilled at 5-Why and fishbone analysis on quality deviations, instead of patching the symptom and moving on.',
        whyMatters:'When a deviation comes up, I currently fix it well enough to get the line running again, but the same issue resurfaces two or three weeks later. The capability is there, the habit and method are not.',
        grownWhen:'A deviation I investigate does not reappear in the next production cycle, and my corrective action notes hold up when QA reviews them.',
        actionDo:'Apply 5-Why on every deviation I personally handle for the next quarter, including minor ones, and document the analysis rather than just logging "resolved".',
        actionLearn:'Sit with the quality engineer on one real investigation each quarter and watch how they push past the first answer.',
        actionConnect:'Ask the shift supervisor with the strongest track record on closed-out deviations to walk me through two of their past investigation reports.',
        support:'Time for a structured RCA course, and a recurring 30-minute slot with the QA lead for the first three months.'
      },
      {
        title:'Speak up earlier in cross-functional reviews',
        domain:'Behavioural',
        whatBuild:'Raise concerns and a different point of view earlier in meetings, instead of waiting until I am completely sure.',
        whyMatters:'In the February safety audit conversation I knew about the issue two weeks before I named it. The delay made the conversation harder than it needed to be, and almost gave us a worse outcome.',
        grownWhen:'In cross-functional reviews I am able to surface a concern or a different angle in the moment, without rehearsing it for days first.',
        actionDo:'Before each weekly review, prepare one question or risk I will raise, and make sure I do. Practise constructive framing such as "One concern I have is..." or "Another way to look at this could be...".',
        actionLearn:'Read or complete short learning on influencing without authority and assertive communication. Reflect after each major meeting on where I held back.',
        actionConnect:'Observe two colleagues who challenge ideas constructively. Ask each of them how they prepare. Ask my manager for in-the-moment feedback after stakeholder calls.',
        support:'Opportunities to present updates in cross-functional forums, even on small topics. Coaching from my manager before and after difficult stakeholder conversations.'
      }
    ],
    trackProgress:{},
    checkInDates:{},
    supportNeeds:[],
    initialFeedback:'', initialShared:false, initialSharedDate:'',
    midFeedback:'', midShared:false, midSharedDate:'',
    endFeedback:'', endShared:false, endSharedDate:''
  },
  {
    id:2,
    initials:'AP',
    name:'Arjun Patel',
    role:'Plant Operations Lead',
    statusLabel:'Q1 check-in complete',
    statusType:'active',
    submittedDate:'March 30, 2026',
    shareScope:'goals',
    letter:null,
    goals:[
      {
        title:'Improve incident response coordination across shifts',
        domain:'Leadership',
        whatBuild:'Take ownership of how incident response works between shifts, instead of treating each handover as a fresh start.',
        whyMatters:'We lose time and information at every shift change when an incident is open. I see it every week. I am one of the few people across both shifts who can change this, so the gap is in taking it on, not in being asked to.',
        grownWhen:'A live incident handed over from one shift to the next is picked up without repeating diagnosis, and the closing supervisor can say what the next shift did and why.',
        actionDo:'Build a one-page incident handover format with the supervisors of both shifts. Use it on every open incident for the next quarter. Review what worked at the end of each one.',
        actionLearn:'Look at how the maintenance group runs incident bridges across geographies. Find one principle to borrow.',
        actionConnect:'Run a working session with the four shift leads. Get their version of what slows them down at handover before I propose anything.',
        support:'Visible backing from my manager when I ask shift leads for time. Permission to standardise the handover format across both shifts.'
      },
      {
        title:'Develop a sharper read on equipment fatigue patterns',
        domain:'Functional',
        whatBuild:'Move from reactive maintenance triggers to recognising early signs of equipment fatigue on my own.',
        whyMatters:'Most of the unplanned downtime I have seen this year was avoidable if someone had spotted the early signal. I want to be that someone, not the one who is surprised by the failure.',
        grownWhen:'At least two preventive interventions I initiate this year come from a fatigue signal I read before the system flagged it.',
        actionDo:'Walk the line with a fixed checklist twice a week. Log what I notice. Compare against the reliability dashboard the following week.',
        actionLearn:'Spend one shift a month with the Reliability team. Read their two most recent failure reports.',
        actionConnect:'Find one peer in another plant who is strong at this and set up a monthly 30-minute call.',
        support:'Access to the reliability dashboard with a read-only login, and a 30-minute monthly slot with the Reliability lead.'
      }
    ],
    trackProgress:{1:{q1:true,mid:false,q2:false,end:false},2:{q1:true,mid:false,q2:false,end:false}},
    checkInDates:{q1:'2026-07-08'},
    supportNeeds:[
      {when:'Quarterly Check-in 1',text:'Would value a sit-down with the Reliability team. I think a few of my Q2 priorities depend on data they own.'}
    ],
    initialFeedback:'', initialShared:false, initialSharedDate:'',
    midFeedback:'', midShared:false, midSharedDate:'',
    endFeedback:'', endShared:false, endSharedDate:''
  },
  {
    id:3,
    initials:'MI',
    name:'Meera Iyer',
    role:'Quality Engineer',
    statusLabel:'Mid-Year conversation complete',
    statusType:'midyear',
    submittedDate:'March 22, 2026',
    shareScope:'all',
    letter:{
      whoIAm:'Quietly persistent. I keep at problems longer than is comfortable for the people watching. I would rather get it right than get it fast.',
      qualities:'Attention to detail without losing sight of the larger pattern. Honesty when something is off, even when nobody else has noticed.',
      energy:'Walking the floor in the first hour of a shift, when the day is still ahead of you and the lines are warming up.',
      strengths:'Caught a recurring deviation pattern in the press shop that two earlier audits missed. The root cause sat across two functions and I was willing to keep asking until both owned it.',
      growthAreas:'I default to going deep alone. Sometimes the work would move faster if I pulled in the QA team earlier instead of arriving with the full answer.',
      futureVision:'A quality engineer who is trusted not just to catch problems but to shape how decisions get made. Someone who knows when to escalate and when to coach a peer through it themselves.'
    },
    goals:[
      {
        title:'Bring others into investigations earlier',
        domain:'Behavioural',
        whatBuild:'Pull the right people into an investigation while it is still messy, instead of arriving with the answer already drafted.',
        whyMatters:'I have a habit of going deep alone because I trust my own pattern matching more than the group conversation. The work moves faster and lands better when others have a stake in the analysis, not just the conclusion.',
        grownWhen:'On at least three significant investigations this year, the conclusion is owned by the cross-functional group, not handed to them by me.',
        actionDo:'On every investigation I open, write down within 48 hours who else should be in it and invite them. Keep notes on what changed because of their input.',
        actionLearn:'Read on facilitation and joint problem solving. Watch how the Reliability lead opens up their reviews.',
        actionConnect:'Pair with one peer from Process Engineering on at least two investigations this year. Ask my manager to put me on a cross-functional task force.',
        support:'Visible permission to spend time with the Process and Reliability teams, and an early steer when I am drifting back into solo mode.'
      },
      {
        title:'Build a working knowledge of statistical process control',
        domain:'Functional',
        whatBuild:'Move from intuitively reading variation on the floor to working in SPC terms with the QA team.',
        whyMatters:'My pattern recognition is good, but I am the only one who reads it. If I want my catches to scale beyond me, I need to talk in a language the rest of the function uses.',
        grownWhen:'I can run an SPC review on at least two product families this year and present it to the quality council without help from the SPC specialist.',
        actionDo:'Set up SPC charts for two product families in the next quarter. Review them weekly. Bring one chart to every quality council.',
        actionLearn:'Complete the SPC fundamentals certification on BOLT and the two case studies in the QA Handbook.',
        actionConnect:'Sit with the SPC specialist for an hour a week through Q2. Shadow one of their reviews with the corporate QA team.',
        support:'Time and budget for the certification, plus standing access to the SPC specialist for two hours a week.'
      },
      {
        title:'Coach one junior QE through their first independent audit',
        domain:'Leadership',
        whatBuild:'Own the development of one junior QE end to end, instead of just answering questions when they come.',
        whyMatters:'Two of our juniors are stuck at "good shadow, not yet ready to lead". I have done enough audits to be useful to one of them, and if I do not take it on, nobody else will.',
        grownWhen:'By Q4, the junior QE I have coached runs an independent audit and writes the report without my edits being needed in substance.',
        actionDo:'Pick one junior QE this quarter. Co-run two audits with them in Q2, then hand over progressively. Debrief after every one.',
        actionLearn:'Read on coaching versus mentoring. Talk to the QA lead who developed me about how she paced it.',
        actionConnect:'Set up a monthly check-in with the QA lead about my coachee\'s progress.',
        support:'Alignment from my manager that this is on my plate this year, and the time to actually do it without dropping my own audit load.'
      }
    ],
    trackProgress:{1:{q1:true,mid:true,q2:false,end:false},2:{q1:true,mid:true,q2:false,end:false},3:{q1:false,mid:true,q2:false,end:false}},
    checkInDates:{q1:'2026-07-05',mid:'2026-10-14'},
    supportNeeds:[
      {when:'Quarterly Check-in 1',text:'A 30-minute slot once a month to walk through one open investigation. I learn more from your line of questioning than from any course.'},
      {when:'Mid-Year Conversation',text:'Air cover to spend two afternoons a week alongside the QA team in Q3. I would like to bring them in earlier and that needs visible permission.'}
    ],
    initialFeedback:'A thoughtful plan. The behavioural goal is the one I would lean on the hardest this year; you have the technical credibility, what will move you to the next level is bringing more people with you. Happy to make space in our 1:1s to debrief specific instances.',
    initialShared:true, initialSharedDate:'2026-04-02',
    midFeedback:'Strong year so far. The press-shop catch was the kind of cross-functional work we need more of. Keep pushing yourself to bring people in earlier rather than arriving with the conclusion. We can talk through how at our next 1:1.',
    midShared:true, midSharedDate:'2026-10-16',
    endFeedback:'', endShared:false, endSharedDate:''
  }
];

let currentReportee=null;

function renderTeamCards(){
  const grid=document.getElementById('team-cards-grid');
  if(!grid) return;
  grid.innerHTML=reportees.map(r=>`
    <div class="team-card" onclick="openReportee(${r.id})">
      <div style="display:flex;gap:14px;align-items:flex-start">
        <div class="team-avatar">${r.initials}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:15px;font-weight:600;color:var(--ink);margin-bottom:2px">${r.name}</div>
          <div style="font-size:12.5px;color:var(--muted)">${r.role}</div>
        </div>
      </div>
      <div><span class="team-status ${r.statusType}">${r.statusLabel}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--cream-border)">
        <div style="font-size:11.5px;color:var(--muted)">Submitted ${r.submittedDate}</div>
        <div style="font-size:12px;color:var(--blue);font-weight:600">View SDP →</div>
      </div>
    </div>
  `).join('');
}

function openReportee(id){
  currentReportee=reportees.find(r=>r.id===id);
  if(!currentReportee) return;
  goToScreen('reportee');
}

function renderReporteeDetail(){
  if(!currentReportee) return;
  const r=currentReportee;
  const body=document.getElementById('reportee-detail-body');
  if(!body) return;
  const scopeChip = r.shareScope==='all'
    ? '<span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:3px 10px;border-radius:20px;background:var(--blue-xl);color:var(--blue);border:1px solid var(--blue-l)">Shared: full SDP</span>'
    : '<span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:3px 10px;border-radius:20px;background:var(--cream-d);color:var(--ink);border:1px solid var(--cream-border)">Shared: goals only</span>';

  // HEADER CARD
  let html = `
    <div class="rep-section anim" style="display:flex;gap:18px;align-items:center">
      <div class="team-avatar" style="width:62px;height:62px;font-size:22px">${escapeHtml(r.initials)}</div>
      <div style="flex:1">
        <div style="font-family:var(--serif);font-size:24px;font-weight:500;color:var(--ink);margin-bottom:3px">${escapeHtml(r.name)}</div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:8px">${escapeHtml(r.role)}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <span class="team-status ${r.statusType}">${escapeHtml(r.statusLabel)}</span>
          ${scopeChip}
        </div>
      </div>
    </div>
  `;

  // LETTER
  if(r.shareScope==='all' && r.letter){
    html += `
      <div class="rep-section anim">
        <div class="rep-section-label">Their letter to themselves</div>
        <div class="rep-letter-q"><div class="rep-letter-q-lbl">Who I am</div><div class="rep-letter-q-ans">${escapeHtml(r.letter.whoIAm)}</div></div>
        <div class="rep-letter-q"><div class="rep-letter-q-lbl">Qualities I want to be known for</div><div class="rep-letter-q-ans">${escapeHtml(r.letter.qualities)}</div></div>
        <div class="rep-letter-q"><div class="rep-letter-q-lbl">What energises me</div><div class="rep-letter-q-ans">${escapeHtml(r.letter.energy)}</div></div>
        <div class="rep-letter-q"><div class="rep-letter-q-lbl">Where I am at my best</div><div class="rep-letter-q-ans">${escapeHtml(r.letter.strengths)}</div></div>
        <div class="rep-letter-q"><div class="rep-letter-q-lbl">Where I want to grow</div><div class="rep-letter-q-ans">${escapeHtml(r.letter.growthAreas)}</div></div>
        <div class="rep-letter-q"><div class="rep-letter-q-lbl">Who I want to become</div><div class="rep-letter-q-ans">${escapeHtml(r.letter.futureVision)}</div></div>
      </div>
    `;
  } else {
    html += `
      <div class="rep-section anim">
        <div class="rep-section-label">Their letter to themselves</div>
        <div style="background:var(--cream);border:1px dashed var(--cream-border);border-radius:var(--r-sm);padding:22px;text-align:center;color:var(--pale);font-style:italic;font-size:13.5px;line-height:1.7">${escapeHtml(r.name)} has chosen to keep their reflection private. Only their development goals are shared with you.</div>
      </div>
    `;
  }

  // FULL GOAL DETAILS (per goal)
  html += `
    <div class="rep-section anim">
      <div class="rep-section-label">Their development goals</div>
      ${r.goals.map((g, idx) => renderRepGoalCard(g, idx+1)).join('')}
    </div>
  `;

  // INITIAL PLAN REVIEW FEEDBACK
  html += feedbackSection(r, 'initial', 'Your feedback on this plan', 'This is your first response to the SDP and goals above. Share what you see clearly, what you would push them on, and how you plan to support.', 'What is strong in this plan. What you would push them on. How you plan to support.');
  // TRACK PROGRESS GRID
  html += `
    <div class="rep-section anim">
      <div class="rep-section-label">Their year so far</div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
        <table class="track-grid">
          <thead><tr><th>Goal</th><th class="cen">Quarterly Check-in 1</th><th class="cen">Mid-Year</th><th class="cen">Quarterly Check-in 2</th><th class="cen">Year-End</th></tr></thead>
          <tbody>${r.goals.map((g,idx)=>{
            const gid=idx+1; const p=r.trackProgress[gid]||{};
            const cell=(v,dk)=>{
              const date=v && r.checkInDates[dk] ? `<div class="tg-date">${fmtDate(r.checkInDates[dk])}</div>` : '';
              return `<td class="cen"><div class="tg-cell-wrap"><span class="tg-box ${v?'on':''}">${v?'\u2713':''}</span>${date}</div></td>`;
            };
            return `<tr><td><div class="tg-goal">${escapeHtml(g.title)}</div><div class="tg-domain">${escapeHtml(g.domain)}</div></td>${cell(p.q1,'q1')}${cell(p.mid,'mid')}${cell(p.q2,'q2')}${cell(p.end,'end')}</tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    </div>
  `;

  // SUPPORT NEEDS
  if(r.supportNeeds && r.supportNeeds.length){
    html += `
      <div class="rep-section anim">
        <div class="rep-section-label">Support they have asked for</div>
        ${r.supportNeeds.map(sn=>`<div class="rep-support-item"><div class="rep-support-when">${escapeHtml(sn.when)}</div><div class="rep-support-text">${escapeHtml(sn.text)}</div></div>`).join('')}
      </div>
    `;
  } else {
    html += `
      <div class="rep-section anim">
        <div class="rep-section-label">Support they have asked for</div>
        <div style="background:var(--cream);border:1px dashed var(--cream-border);border-radius:var(--r-sm);padding:18px;text-align:center;color:var(--pale);font-style:italic;font-size:13.5px">No specific asks yet.</div>
      </div>
    `;
  }

  // MID-YEAR FEEDBACK
  html += feedbackSection(r, 'mid', 'Your mid-year feedback', 'A short, honest paragraph is more useful than a long careful one. Speak as you would in a 1:1.', 'Patterns you have noticed. What is working. What you would like to see more of. Specific suggestions if you have any.');
  // YEAR-END FEEDBACK
  html += feedbackSection(r, 'end', 'Your year-end feedback', 'A summary of the year, what you have seen them build, and what should carry into next year.', 'What they have built. What they still want to grow. The conversation worth carrying into the next plan.');

  body.innerHTML = html;
}

// Helper: render one goal card (mirrors sample-goals modal style)
function renderRepGoalCard(g, num){
  const pillMap = {
    'Functional':   {bg:'#EBF2FA',  border:'#D6E4F7',  color:'#1E5FBA'},
    'Behavioural':  {bg:'#95ADD5',  border:'#7BA6E0',  color:'#0E3F87'},
    'Leadership':   {bg:'#1E5FBA',  border:'#0E3F87',  color:'#FFFFFF'}
  };
  const c = pillMap[g.domain] || pillMap['Functional'];
  return `
    <div style="background:#fff;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-bottom:16px;box-shadow:var(--sh)">
      <div style="background:var(--ink);padding:14px 22px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;padding:3px 11px;border-radius:20px;background:${c.bg};color:${c.color};border:1px solid ${c.border}">${escapeHtml(g.domain)}</span>
        <div style="font-family:var(--serif);font-size:17px;font-weight:500;color:#fff">Goal ${num}: ${escapeHtml(g.title)}</div>
      </div>
      <div style="padding:6px 22px 22px">
        <div style="padding:18px 0;border-bottom:1px solid var(--cream-border)">
          <div style="font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:6px">What I want to build</div>
          <div style="font-size:14.5px;color:var(--ink);line-height:1.7;font-family:var(--serif)">${escapeHtml(g.whatBuild||'')}</div>
        </div>
        <div style="padding:18px 0;border-bottom:1px solid var(--cream-border)">
          <div style="font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:6px">Why does this matter to them</div>
          <div style="font-size:13.5px;color:var(--mid);line-height:1.75">${escapeHtml(g.whyMatters||'')}</div>
        </div>
        <div style="padding:18px 0;border-bottom:1px solid var(--cream-border)">
          <div style="font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:6px">They will know they have grown when</div>
          <div style="font-size:13.5px;color:var(--mid);line-height:1.75">${escapeHtml(g.grownWhen||'')}</div>
        </div>
        <div style="padding:18px 0;border-bottom:1px solid var(--cream-border)">
          <div style="font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:10px">Action plan</div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;gap:14px;align-items:flex-start">
              <span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:4px 10px;border-radius:4px;background:var(--blue-xl);color:var(--blue);white-space:nowrap;flex-shrink:0;min-width:90px;text-align:center">Do \u00b7 70%</span>
              <div style="font-size:13.5px;color:var(--mid);line-height:1.75;flex:1">${escapeHtml(g.actionDo||'')}</div>
            </div>
            <div style="display:flex;gap:14px;align-items:flex-start">
              <span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:4px 10px;border-radius:4px;background:var(--cream-d);color:var(--ink);white-space:nowrap;flex-shrink:0;min-width:90px;text-align:center">Learn \u00b7 10%</span>
              <div style="font-size:13.5px;color:var(--mid);line-height:1.75;flex:1">${escapeHtml(g.actionLearn||'')}</div>
            </div>
            <div style="display:flex;gap:14px;align-items:flex-start">
              <span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:4px 10px;border-radius:4px;background:var(--grey-l);color:var(--grey-d);white-space:nowrap;flex-shrink:0;min-width:90px;text-align:center">Connect \u00b7 20%</span>
              <div style="font-size:13.5px;color:var(--mid);line-height:1.75;flex:1">${escapeHtml(g.actionConnect||'')}</div>
            </div>
          </div>
        </div>
        <div style="padding:18px 0 4px">
          <div style="font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:6px">Support they need</div>
          <div style="font-size:13.5px;color:var(--mid);line-height:1.75">${escapeHtml(g.support||'')}</div>
        </div>
      </div>
    </div>
  `;
}

// Helper: render the mid-year or end-year feedback section with share button + status
function feedbackSection(r, which, title, intro, placeholder){
  if(typeof r.initialShared==='undefined') r.initialShared=false;
  if(typeof r.initialSharedDate==='undefined') r.initialSharedDate='';
  if(typeof r.initialFeedback==='undefined') r.initialFeedback='';
  if(typeof r.midShared==='undefined') r.midShared=false;
  if(typeof r.midSharedDate==='undefined') r.midSharedDate='';
  if(typeof r.midFeedback==='undefined') r.midFeedback='';
  if(typeof r.endShared==='undefined') r.endShared=false;
  if(typeof r.endSharedDate==='undefined') r.endSharedDate='';
  if(typeof r.endFeedback==='undefined') r.endFeedback='';
  const isShared = which==='initial' ? !!r.initialShared : (which==='mid' ? !!r.midShared : !!r.endShared);
  const sharedDate = which==='initial' ? r.initialSharedDate : (which==='mid' ? r.midSharedDate : r.endSharedDate);
  const existing = which==='initial' ? r.initialFeedback : (which==='mid' ? r.midFeedback : r.endFeedback);
  const firstName = (r.name||'them').split(' ')[0];
  const statusHtml = isShared
    ? `<div id="rep-${which}-status-${r.id}" style="font-size:12.5px;color:var(--blue);font-weight:600">\u2713 Shared with ${escapeHtml(firstName)} on ${fmtDate(sharedDate)}</div>`
    : `<div id="rep-${which}-status-${r.id}" style="font-size:12.5px;color:var(--pale);font-style:italic">Not yet shared with ${escapeHtml(firstName)}</div>`;
  const btnLabel = isShared ? `Re-share with ${escapeHtml(firstName)}` : `Share with ${escapeHtml(firstName)}`;
  return `
    <div class="rep-section anim" style="display:block">
      <div class="rep-section-label">${title}</div>
      <p style="font-size:13px;color:var(--mid);line-height:1.65;margin-bottom:14px">${intro}</p>
      <textarea class="rep-feedback-ta" id="rep-${which}-fb-${r.id}" placeholder="${placeholder}" style="display:block;width:100%;min-height:140px;box-sizing:border-box">${escapeHtml(existing)}</textarea>
      <div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
        ${statusHtml}
        <button class="btn btn-primary" onclick="shareRepFeedback(${r.id},'${which}')">📤 ${btnLabel}</button>
      </div>
    </div>
  `;
}

function shareRepFeedback(id, which){
  const rep = reportees.find(r=>r.id===id);
  if(!rep) return;
  const ta = document.getElementById('rep-'+which+'-fb-'+id);
  if(!ta) return;
  const val = ta.value.trim();
  if(val.length < 5){ alert('Please write a few sentences of feedback before sharing.'); return; }
  if(which==='initial'){ rep.initialFeedback = val; rep.initialShared = true; rep.initialSharedDate = todayISO(); }
  else if(which==='mid'){ rep.midFeedback = val; rep.midShared = true; rep.midSharedDate = todayISO(); }
  else                  { rep.endFeedback = val; rep.endShared = true; rep.endSharedDate = todayISO(); }
  const status = document.getElementById('rep-'+which+'-status-'+id);
  if(status){
    status.style.color = 'var(--blue)';
    status.style.fontStyle = 'normal';
    status.style.fontWeight = '600';
    const usedDate = which==='initial'?rep.initialSharedDate:(which==='mid'?rep.midSharedDate:rep.endSharedDate);
    status.textContent = '\u2713 Shared with ' + rep.name.split(' ')[0] + ' on ' + fmtDate(usedDate);
  }
  const label = which==='initial' ? 'Plan review feedback' : (which==='mid' ? 'Mid-year feedback' : 'Year-end feedback');
  showToast(label + ' shared with ' + rep.name);
}

// Render team cards and reportee detail on screen entry
const _origGoToScreen=goToScreen;
goToScreen=function(name){
  _origGoToScreen(name);
  if(name==='team') try{renderTeamCards();}catch(e){console.error(e);}
  if(name==='reportee') try{renderReporteeDetail();}catch(e){console.error(e);}
};

// =====================================================
// CHECK-IN DATE BAR for each dashboard check-in tab
// Injected at top of each rendered tab by patching renderers.
// =====================================================
function dateBarHtml(key){
  const today=todayISO();
  const cur=checkInDates[key]||today;
  if(!checkInDates[key]) checkInDates[key]=cur;
  return `<div class="checkin-date-bar"><label for="checkin-date-${key}">Date of this update:</label><input id="checkin-date-${key}" type="date" value="${cur}" onchange="setCheckInDate('${key}',this.value)"></div>`;
}

// Wrap renderQuarterlyTab and renderConversationTab to prepend date bar
const _origRenderQuarterly=renderQuarterlyTab;
renderQuarterlyTab=function(tabId,checkinKey){
  _origRenderQuarterly(tabId,checkinKey);
  const el=document.getElementById(tabId);
  if(!el || el.children.length===0) return;
  // Prepend date bar if not already there
  if(!el.querySelector('.checkin-date-bar')){
    el.insertAdjacentHTML('afterbegin',dateBarHtml(checkinKey));
  }
};
const _origRenderConversation=renderConversationTab;
renderConversationTab=function(tabId,checkinKey,heading,leftLbl,leftPh,rightLbl,rightPh,bottomLbl,bottomPh,bottomSharedWithManager){
  _origRenderConversation(tabId,checkinKey,heading,leftLbl,leftPh,rightLbl,rightPh,bottomLbl,bottomPh,bottomSharedWithManager);
  const el=document.getElementById(tabId);
  if(!el || el.children.length===0) return;
  if(!el.querySelector('.checkin-date-bar')){
    el.insertAdjacentHTML('afterbegin',dateBarHtml(checkinKey));
  }
};

// Override renderTrackGrid to include date captions under ticked cells
const _origRenderTrackGrid=renderTrackGrid;
renderTrackGrid=function(){
  const tbody=document.getElementById('track-grid-body');
  if(!tbody) return;
  const goals=getActiveGoals();
  if(goals.length===0){
    tbody.innerHTML='<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--muted);font-style:italic;font-size:13.5px">Once you set development goals on the previous step, they will appear here for tracking.</td></tr>';
    return;
  }
  tbody.innerHTML=goals.map(g=>{
    const p=trackProgress[g.id]||{};
    const cell=(v,dateKey)=>{
      const date=v && checkInDates[dateKey]?'<div class="tg-date">'+fmtDate(checkInDates[dateKey])+'</div>':'';
      return '<td class="cen"><div class="tg-cell-wrap"><span class="tg-box '+(v?'on':'')+'">'+(v?'✓':'')+'</span>'+date+'</div></td>';
    };
    return '<tr><td><div class="tg-goal">'+escapeHtml(g.title)+'</div>'+(g.domain?'<div class="tg-domain">'+escapeHtml(g.domain)+'</div>':'')+'</td>'+cell(p.q1,'q1')+cell(p.mid,'mid')+cell(p.q2,'q2')+cell(p.end,'end')+'</tr>';
  }).join('');
};

// Lower the auto-tick threshold so even a single character counts
// (helps the user see a tick the moment they start typing).
const _origAutoTick=autoTickGrid;
autoTickGrid=function(){
  try{
    document.querySelectorAll('[data-checkin][data-field="done"]').forEach(el=>{
      const gid=parseInt(el.dataset.goal);
      if(isNaN(gid)) return;
      const key=el.dataset.checkin;
      if(!trackProgress[gid]) trackProgress[gid]={q1:false,mid:false,q2:false,end:false};
      trackProgress[gid][key]=el.value.trim().length>0;
    });
    const midFilled=Array.from(document.querySelectorAll('[data-checkin="mid"]')).some(el=>el.value.trim().length>0);
    const endFilled=Array.from(document.querySelectorAll('[data-checkin="end"]')).some(el=>el.value.trim().length>0);
    const allGids=new Set();
    for(let i=1;i<=3;i++){if(gd[i] && gd[i].title && gd[i].title.trim()) allGids.add(i);}
    Object.keys(trackProgress).forEach(k=>{const n=parseInt(k);if(!isNaN(n)) allGids.add(n);});
    allGids.forEach(gid=>{
      if(!trackProgress[gid]) trackProgress[gid]={q1:false,mid:false,q2:false,end:false};
      trackProgress[gid].mid=midFilled;
      trackProgress[gid].end=endFilled;
    });
    renderTrackGrid();
    updateTimelineDots();
    if(!window.__lastToast || Date.now()-window.__lastToast>2500){
      showToast('Track My Goals updated');
      window.__lastToast=Date.now();
    }
  }catch(e){console.error('autoTickGrid error',e);}
};



// =====================================================
// SAMPLE GOAL DETAIL MODAL (focused single-goal view)
// =====================================================
const sampleGoalsData = {
  functional: {
    icon: '\u{1F527}',
    label: 'Functional',
    headerBg: '#EBF2FA', headerBorder: '#D6E4F7', headerColor: '#1E5FBA',
    whatBuild: 'Get properly skilled at root-cause analysis (5-Why / fishbone) for quality deviations, instead of just fixing the symptom and moving on.',
    whyMatters: 'When a deviation comes up, I patch it well enough to get the line running again, but the same issue resurfaces two or three weeks later. The capability is there, the habit and method are not.',
    grownWhen: 'A deviation I investigate does not reappear in the next production cycle, and my corrective action notes hold up when QA reviews them.',
    actionDo: 'Apply 5-Why on every deviation I personally handle for the next quarter, even minor ones, and document the analysis properly instead of just logging "resolved" in the handover sheet.',
    actionLearn: 'Sit with the quality engineer on one real investigation (not a training session) and watch how they push past the first answer to the actual root cause.',
    actionConnect: 'Ask the shift supervisor with the best track record on closed-out deviations to walk me through two of their past investigation reports.',
    support: 'Relevant courses or certifications, and some time with a mentor who could help me with the same.'
  },
  behavioural: {
    icon: '\u{1F4AC}',
    label: 'Behavioural',
    headerBg: '#95ADD5', headerBorder: '#7BA6E0', headerColor: '#0E3F87',
    whatBuild: 'Build confidence in speaking up early, especially when I see risks, gaps, or a different point of view.',
    whyMatters: 'There have been situations where I noticed a concern but waited too long to raise it because I wanted to be completely sure first. I want to become more comfortable contributing my perspective earlier, even when my view is still developing. Silence can slow down decisions or prevent the team from seeing a risk in time.',
    grownWhen: 'In meetings or project discussions I am able to respectfully raise concerns, ask clarifying questions, or offer a different perspective without overthinking whether my input is perfect.',
    actionDo: 'In key meetings I will prepare one question, risk, or point of view in advance and make sure I contribute it during the discussion. When I disagree I will practise framing it constructively, such as: "One concern I have is..." or "Another way to look at this could be..."',
    actionLearn: 'Read or complete short learning on difficult conversations, influencing without authority, and assertive communication. Reflect after important meetings on where I spoke up and where I held back.',
    actionConnect: 'Observe colleagues who challenge ideas constructively and ask them how they prepare for difficult conversations. Request feedback from my manager on whether my communication is clear, timely, and balanced.',
    support: 'Opportunities to present updates or risks in team forums, even if the topic is small initially. Coaching from my manager before and after difficult stakeholder conversations so I can build confidence through real situations.'
  },
  leadership: {
    icon: '\u{1F465}',
    label: 'Leadership',
    headerBg: '#1E5FBA', headerBorder: '#0E3F87', headerColor: '#FFFFFF',
    whatBuild: 'Own the onboarding of new operators on my line end-to-end, instead of just answering their questions when they happen to ask.',
    whyMatters: 'New hires currently pick things up by trial and error and by bothering whoever is free, including me, but nobody actually owns getting them competent. I am already one of the people they come to, so the gap is in taking responsibility for it properly, not in being asked to.',
    grownWhen: 'A new operator I have onboarded is running the line independently and correctly within two weeks, without needing to be walked through the same step twice.',
    actionDo: 'Build a simple one-page checklist of what a new operator needs to know in their first two weeks on this line, and personally walk the next new hire through it instead of leaving it to whoever is nearby.',
    actionLearn: 'Look at how the changeover team structures their cross-training so new people get hands-on practice early instead of just shadowing.',
    actionConnect: 'Ask the trainer who runs new-hire induction what they have seen work and fail when operators try to onboard people informally on the floor.',
    support: 'Time with tenured employees and supervisors to understand what works and fails for activities outside of my domain. Alignment and guidance on expectations, responsibilities, and how progress should be tracked.'
  }
};

function openSampleGoal(type){
  const g = sampleGoalsData[type];
  if(!g) return;
  const body = document.getElementById('sample-detail-body');
  if(!body) return;
  const sec = (label, val) => `
    <div style="padding:16px 0;border-bottom:1px solid var(--cream-border)">
      <div style="font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:6px">${label}</div>
      <div style="font-size:13.5px;color:var(--mid);line-height:1.7">${escapeHtml(val)}</div>
    </div>`;
  body.innerHTML = `
    <div style="background:var(--ink);padding:18px 26px 16px;border-radius:18px 18px 0 0">
      <div style="font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:6px">Sample goal for goal setting</div>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;padding:4px 12px;border-radius:20px;background:${g.headerBg};color:${g.headerColor};border:1px solid ${g.headerBorder}">${g.icon} ${g.label}</span>
        <div style="font-family:var(--serif);font-size:19px;font-weight:500;color:#fff">Example ${escapeHtml(g.label.toLowerCase())} goal</div>
      </div>
    </div>
    <div style="padding:6px 26px 22px">
      ${sec('What I want to build', g.whatBuild)}
      ${sec('Why does this matter to me', g.whyMatters)}
      ${sec('I will know I have grown when', g.grownWhen)}
      <div style="padding:16px 0;border-bottom:1px solid var(--cream-border)">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:12px">Action Plan</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;gap:14px;align-items:flex-start">
            <span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:4px 10px;border-radius:4px;background:var(--blue-xl);color:var(--blue);white-space:nowrap;flex-shrink:0;min-width:96px;text-align:center">Do \u00b7 70%</span>
            <div style="font-size:13px;color:var(--mid);line-height:1.7;flex:1">${escapeHtml(g.actionDo)}</div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start">
            <span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:4px 10px;border-radius:4px;background:#95ADD5;color:#0E3F87;white-space:nowrap;flex-shrink:0;min-width:96px;text-align:center">Learn \u00b7 10%</span>
            <div style="font-size:13px;color:var(--mid);line-height:1.7;flex:1">${escapeHtml(g.actionLearn)}</div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start">
            <span style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:4px 10px;border-radius:4px;background:#1E5FBA;color:#FFFFFF;white-space:nowrap;flex-shrink:0;min-width:96px;text-align:center">Connect \u00b7 20%</span>
            <div style="font-size:13px;color:var(--mid);line-height:1.7;flex:1">${escapeHtml(g.actionConnect)}</div>
          </div>
        </div>
      </div>
      <div style="padding:16px 0 4px">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--blue);margin-bottom:6px">Support I need</div>
        <div style="font-size:13px;color:var(--mid);line-height:1.7">${escapeHtml(g.support)}</div>
      </div>
    </div>`;
  document.getElementById('modal-sample-detail').classList.add('open');
}


// =====================================================
// BU HR VIEW: data, rendering, view-switching, nudges
// =====================================================
const buhrEmployees = [
  { id:1, name:'Rohan Mehta', role:'Sr. Production Engineer', dept:'Production', manager:'Vikram Singh', buHead:'Rajesh Kapoor',
    sdp:'2026-04-18', sdpScope:'all', growth:'2026-04-22', planFb:'pending', q1:'pending', mid:null, midFb:null, q2:null, end:null, endFb:null },
  { id:2, name:'Arjun Patel', role:'Plant Operations Lead', dept:'Operations', manager:'Vikram Singh', buHead:'Rajesh Kapoor',
    sdp:'2026-03-30', sdpScope:'goals', growth:'2026-04-04', planFb:'2026-04-08', q1:'2026-07-08', mid:'pending', midFb:null, q2:null, end:null, endFb:null },
  { id:3, name:'Meera Iyer', role:'Quality Engineer', dept:'Quality', manager:'Vikram Singh', buHead:'Rajesh Kapoor',
    sdp:'2026-03-22', sdpScope:'all', growth:'2026-03-28', planFb:'2026-04-02', q1:'2026-07-05', mid:'2026-10-14', midFb:'2026-10-16', q2:'pending', end:null, endFb:null },
  { id:4, name:'Priya Sharma', role:'Maintenance Engineer', dept:'Maintenance', manager:'Vikram Singh', buHead:'Rajesh Kapoor',
    sdp:'pending', sdpScope:null, growth:null, planFb:null, q1:null, mid:null, midFb:null, q2:null, end:null, endFb:null },
  { id:5, name:'Rajiv Kumar', role:'Process Engineer', dept:'Production', manager:'Anil Desai', buHead:'Rajesh Kapoor',
    sdp:'2026-04-02', sdpScope:'all', growth:'2026-04-09', planFb:'2026-04-12', q1:'2026-07-10', mid:'pending', midFb:null, q2:null, end:null, endFb:null },
  { id:6, name:'Nisha Reddy', role:'Reliability Analyst', dept:'Reliability', manager:'Anil Desai', buHead:'Sunita Verma',
    sdp:'2026-03-28', sdpScope:'goals', growth:'2026-04-03', planFb:'2026-04-08', q1:'pending', mid:null, midFb:null, q2:null, end:null, endFb:null },
  { id:7, name:'Vikas Choudhary', role:'Logistics Coordinator', dept:'Supply Chain', manager:'Anil Desai', buHead:'Sunita Verma',
    sdp:'2026-04-12', sdpScope:'all', growth:'2026-04-18', planFb:'pending', q1:'pending', mid:null, midFb:null, q2:null, end:null, endFb:null },
  { id:8, name:'Anaya Joshi', role:'Industrial Engineer', dept:'Production', manager:'Sunita Verma', buHead:'Sunita Verma',
    sdp:'pending', sdpScope:null, growth:null, planFb:null, q1:null, mid:null, midFb:null, q2:null, end:null, endFb:null },
  { id:9, name:'Karthik Rao', role:'Sr. Quality Lead', dept:'Quality', manager:'Sunita Verma', buHead:'Sunita Verma',
    sdp:'2026-03-18', sdpScope:'all', growth:'2026-03-25', planFb:'2026-03-30', q1:'2026-07-02', mid:'2026-10-08', midFb:'2026-10-12', q2:'pending', end:null, endFb:null },
  { id:10, name:'Pooja Menon', role:'Supply Chain Analyst', dept:'Supply Chain', manager:'Sunita Verma', buHead:'Sunita Verma',
    sdp:'2026-04-20', sdpScope:'all', growth:'pending', planFb:null, q1:null, mid:null, midFb:null, q2:null, end:null, endFb:null }
];
const buhrNudged = {};
let buhrFiltered = [...buhrEmployees];

// Email templates
const defaultEmailTemplates = {
  sdp:     'Hi {employee},\n\nThis is a friendly reminder to complete and submit your Self Development Plan (SDP) for this year. Your SDP is your opportunity to reflect on your growth and set meaningful development goals.\n\nPlease submit it by {deadline}.\n\nBest regards,\nHR Team',
  growth:  'Hi {employee},\n\nNow that your SDP is submitted, the next step is to have a Growth Conversation with your manager ({manager}). This is a chance to align on your development goals and discuss how to move forward together.\n\nPlease schedule this conversation at the earliest.\n\nBest regards,\nHR Team',
  planFb:  'Hi {manager},\n\nYour reportee {employee} has submitted their Self Development Plan and is awaiting your feedback. Please take a few minutes to review their plan and share your thoughts.\n\nYour feedback is an important part of their development journey.\n\nBest regards,\nHR Team',
  q1:      'Hi {employee},\n\nIt is time for your Quarterly Check-in 1. Please log into the SDP tool and update your progress on each development goal.\n\nPlease complete this by {deadline}.\n\nBest regards,\nHR Team',
  mid:     'Hi {employee},\n\nYour Mid-Year Conversation is due. Please complete your mid-year reflection in the SDP tool and schedule time with your manager ({manager}) to discuss.\n\nBest regards,\nHR Team',
  midFb:   'Hi {manager},\n\n{employee} has completed their Mid-Year Conversation and is awaiting your feedback. Please share your observations in the SDP tool.\n\nBest regards,\nHR Team',
  q2:      'Hi {employee},\n\nIt is time for your Quarterly Check-in 2. Please update your progress on each development goal in the SDP tool.\n\nBest regards,\nHR Team',
  end:     'Hi {employee},\n\nYour Year-End Conversation is due. Please complete your year-end reflection and schedule time with your manager ({manager}).\n\nBest regards,\nHR Team',
  endFb:   'Hi {manager},\n\n{employee} has completed their Year-End Conversation. Please provide your year-end feedback in the SDP tool.\n\nBest regards,\nHR Team'
};
const emailTemplates = JSON.parse(JSON.stringify(defaultEmailTemplates));
let activeEmailKey = 'sdp';

function buhrStatus(val){
  if(val==='pending') return 'pending';
  if(val===null || typeof val==='undefined') return 'notdue';
  return 'done';
}

const buhrNudgeTarget = {
  sdp:'employee', growth:'employee', planFb:'manager',
  q1:'employee', mid:'employee', midFb:'manager',
  q2:'employee', end:'employee', endFb:'manager'
};

function buhrCell(emp, milestone){
  const val = emp[milestone];
  const status = buhrStatus(val);
  const nudgedKey = emp.id+':'+milestone;
  const isNudged = !!buhrNudged[nudgedKey];
  if(status==='done'){
    return `<td><span class="buhr-chip done">\u2713 ${fmtBuhrDate(val)||'Done'}</span></td>`;
  } else if(status==='pending'){
    let html = `<span class="buhr-chip pending">Pending</span>`;
    if(isNudged) html += `<br><span class="buhr-nudge sent">\u2709 Sent</span>`;
    else html += `<br><button class="buhr-nudge" onclick="sendNudge(${emp.id},'${milestone}',this)">\u2709 Nudge</button>`;
    return `<td>${html}</td>`;
  }
  return `<td><span class="buhr-chip notdue">-</span></td>`;
}

function buhrSdpCell(emp){
  const val = emp.sdp;
  const status = buhrStatus(val);
  const nudgedKey = emp.id+':sdp';
  const isNudged = !!buhrNudged[nudgedKey];
  if(status==='done'){
    const scopeCls = emp.sdpScope==='all' ? 'all' : 'goals';
    const scopeLbl = emp.sdpScope==='all' ? 'Full' : 'Goals only';
    return `<td><span class="buhr-chip done">\u2713 ${fmtBuhrDate(val)}</span><br><span class="buhr-scope-tag ${scopeCls}">${scopeLbl}</span></td>`;
  }
  if(status==='pending'){
    let html = '<span class="buhr-chip pending">Not submitted</span>';
    if(isNudged) html += '<br><span class="buhr-nudge sent">\u2709 Sent</span>';
    else html += `<br><button class="buhr-nudge" onclick="sendNudge(${emp.id},'sdp',this)">\u2709 Nudge</button>`;
    return `<td>${html}</td>`;
  }
  return `<td><span class="buhr-chip notdue">-</span></td>`;
}

function fmtBuhrDate(iso){
  if(!iso || iso==='pending') return '';
  return fmtDate(iso);
}

function renderBuhrStats(){
  const el = document.getElementById('buhr-stats');
  if(!el) return;
  const list = buhrFiltered;
  const total = list.length;
  const submitted = list.filter(e=>buhrStatus(e.sdp)==='done').length;
  const pendingAny = list.filter(e=>buhrStatus(e.planFb)==='pending' || buhrStatus(e.q1)==='pending' || buhrStatus(e.mid)==='pending' || buhrStatus(e.q2)==='pending').length;
  const doneAll = list.filter(e=>{
    const steps = ['sdp','growth','planFb','q1'];
    return steps.every(k=>buhrStatus(e[k])==='done');
  }).length;
  const pendingMgrFb = list.filter(e=>buhrStatus(e.planFb)==='pending' || buhrStatus(e.midFb)==='pending' || buhrStatus(e.endFb)==='pending').length;
  el.innerHTML = `
    <div class="buhr-stat ok">
      <div class="buhr-stat-lbl">SDPs submitted</div>
      <div class="buhr-stat-val">${submitted} <span style="font-size:16px;color:var(--muted);font-weight:500">/ ${total}</span></div>
      <div class="buhr-stat-sub">${total-submitted===0?'All submitted':''+( total-submitted)+' remaining'}</div>
    </div>
    <div class="buhr-stat ${pendingAny>0?'warn':'ok'}">
      <div class="buhr-stat-lbl">Pending actions</div>
      <div class="buhr-stat-val">${pendingAny}</div>
      <div class="buhr-stat-sub">Employees with overdue steps</div>
    </div>
    <div class="buhr-stat ok">
      <div class="buhr-stat-lbl">On track (through Q1)</div>
      <div class="buhr-stat-val">${doneAll}</div>
      <div class="buhr-stat-sub">SDP + Growth + Mgr fb + Q1 done</div>
    </div>
    <div class="buhr-stat ${pendingMgrFb>0?'warn':'ok'}">
      <div class="buhr-stat-lbl">Manager feedback pending</div>
      <div class="buhr-stat-val">${pendingMgrFb}</div>
      <div class="buhr-stat-sub">Plan, mid-year, or year-end</div>
    </div>`;
}

function renderBuhrTable(){
  const body = document.getElementById('buhr-table-body');
  if(!body) return;
  body.innerHTML = buhrFiltered.map(emp=>`<tr>
    <td class="col-emp">
      <div class="buhr-emp-name">${escapeHtml(emp.name)}</div>
      <div class="buhr-emp-role">${escapeHtml(emp.role)}</div>
      <div class="buhr-emp-dept">${escapeHtml(emp.dept)}</div>
    </td>
    <td class="col-mgr"><div class="buhr-mgr">${escapeHtml(emp.manager)}</div></td>
    ${buhrSdpCell(emp)}
    ${buhrCell(emp,'growth')}
    ${buhrCell(emp,'planFb')}
    ${buhrCell(emp,'q1')}
    ${buhrCell(emp,'mid')}
    ${buhrCell(emp,'midFb')}
    ${buhrCell(emp,'q2')}
    ${buhrCell(emp,'end')}
    ${buhrCell(emp,'endFb')}
  </tr>`).join('');
}

function populateBuhrFilterDropdowns(){
  const mgrs = [...new Set(buhrEmployees.map(e=>e.manager))].sort();
  const heads = [...new Set(buhrEmployees.map(e=>e.buHead))].sort();
  const depts = [...new Set(buhrEmployees.map(e=>e.dept))].sort();
  const mgrSel = document.getElementById('buhr-f-mgr');
  const headSel = document.getElementById('buhr-f-buhead');
  const deptSel = document.getElementById('buhr-f-dept');
  if(mgrSel) mgrSel.innerHTML = '<option value="">All managers</option>' + mgrs.map(m=>`<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
  if(headSel) headSel.innerHTML = '<option value="">All BU Heads</option>' + heads.map(h=>`<option value="${escapeHtml(h)}">${escapeHtml(h)}</option>`).join('');
  if(deptSel) deptSel.innerHTML = '<option value="">All departments</option>' + depts.map(d=>`<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
}

function applyBuhrFilters(){
  const empQ = (document.getElementById('buhr-f-emp')||{}).value||'';
  const mgrQ = (document.getElementById('buhr-f-mgr')||{}).value||'';
  const headQ = (document.getElementById('buhr-f-buhead')||{}).value||'';
  const deptQ = (document.getElementById('buhr-f-dept')||{}).value||'';
  buhrFiltered = buhrEmployees.filter(e=>{
    if(empQ && !e.name.toLowerCase().includes(empQ.toLowerCase())) return false;
    if(mgrQ && e.manager!==mgrQ) return false;
    if(headQ && e.buHead!==headQ) return false;
    if(deptQ && e.dept!==deptQ) return false;
    return true;
  });
  renderBuhrStats();
  renderBuhrTable();
}

function renderBuhrDashboard(){
  populateBuhrFilterDropdowns();
  buhrFiltered = [...buhrEmployees];
  applyBuhrFilters();
}

function sendNudge(empId, milestone, btn){
  const emp = buhrEmployees.find(e=>e.id===empId);
  if(!emp) return;
  const target = buhrNudgeTarget[milestone] || 'employee';
  const recipient = target==='employee' ? emp.name : emp.manager+' (manager of '+emp.name+')';
  const milestoneLabel = {
    sdp:'SDP submission', growth:'Growth conversation', planFb:'Manager plan feedback',
    q1:'Q1 check-in', mid:'Mid-year conversation', midFb:'Manager mid-year feedback',
    q2:'Q2 check-in', end:'Year-end conversation', endFb:'Manager year-end feedback'
  }[milestone] || milestone;
  buhrNudged[empId+':'+milestone] = true;
  if(btn){ btn.disabled=true; btn.className='buhr-nudge sent'; btn.innerHTML='\u2709 Sent'; }
  showToast('Nudge queued for '+recipient+': '+milestoneLabel);
}

// Email template editor (proper modal)
const emailTplMeta = {
  sdp:    {category:'EMPLOYEE NUDGE',  label:'SDP submission',           recipient:'Employee', subject:'Action needed: Please submit your Self Development Plan'},
  growth: {category:'EMPLOYEE NUDGE',  label:'Growth conversation',      recipient:'Employee', subject:'Schedule your Growth Conversation with your manager'},
  planFb: {category:'MANAGER NUDGE',   label:'Manager plan feedback',    recipient:'Manager',  subject:'Action needed: Review {employee}\'s Self Development Plan'},
  q1:     {category:'EMPLOYEE NUDGE',  label:'Quarterly Check-in 1',     recipient:'Employee', subject:'Time for your Q1 check-in'},
  mid:    {category:'EMPLOYEE NUDGE',  label:'Mid-year conversation',    recipient:'Employee', subject:'Your Mid-Year Conversation is due'},
  midFb:  {category:'MANAGER NUDGE',   label:'Manager mid-year feedback',recipient:'Manager',  subject:'Action needed: Share mid-year feedback for {employee}'},
  q2:     {category:'EMPLOYEE NUDGE',  label:'Quarterly Check-in 2',     recipient:'Employee', subject:'Time for your Q2 check-in'},
  end:    {category:'EMPLOYEE NUDGE',  label:'Year-end conversation',    recipient:'Employee', subject:'Your Year-End Conversation is due'},
  endFb:  {category:'MANAGER NUDGE',   label:'Manager year-end feedback',recipient:'Manager',  subject:'Action needed: Share year-end feedback for {employee}'}
};
const emailSubjects = {};
Object.keys(emailTplMeta).forEach(k=>{emailSubjects[k] = emailTplMeta[k].subject;});

function openEmailTemplates(){
  document.getElementById('modal-email-templates').classList.add('open');
  renderEmailTplList();
  loadEmailTemplate(activeEmailKey);
}
function renderEmailTplList(){
  const el = document.getElementById('email-tpl-list');
  if(!el) return;
  const order = ['sdp','growth','planFb','q1','mid','midFb','q2','end','endFb'];
  // Group by category
  let html = '';
  let lastCat = '';
  order.forEach(k=>{
    const m = emailTplMeta[k];
    if(m.category !== lastCat){
      if(lastCat) html += '<div style="height:1px;background:var(--border);margin:8px 14px"></div>';
      html += `<div style="font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--pale);padding:8px 18px 4px">${m.category}</div>`;
      lastCat = m.category;
    }
    const isActive = k===activeEmailKey;
    html += `<button onclick="loadEmailTemplate('${k}')" style="display:block;width:100%;text-align:left;background:${isActive?'var(--blue-xl)':'transparent'};border:none;border-left:3px solid ${isActive?'var(--blue)':'transparent'};padding:9px 16px 9px 15px;cursor:pointer;font-family:var(--sans);font-size:12.5px;color:${isActive?'var(--blue)':'var(--ink)'};font-weight:${isActive?'600':'500'};transition:background .15s" onmouseover="if(!this.dataset.active)this.style.background='var(--cream-d)'" onmouseout="if(!this.dataset.active)this.style.background='transparent'" ${isActive?'data-active="1"':''}>${escapeHtml(m.label)}</button>`;
  });
  el.innerHTML = html;
}
function loadEmailTemplate(key){
  activeEmailKey = key;
  const meta = emailTplMeta[key];
  const ta = document.getElementById('buhr-email-ta');
  const subj = document.getElementById('email-tpl-subject');
  if(ta) ta.value = emailTemplates[key] || '';
  if(subj) subj.value = emailSubjects[key] || '';
  const cat = document.getElementById('email-tpl-active-cat');
  const title = document.getElementById('email-tpl-active-title');
  const rec = document.getElementById('email-tpl-recipient');
  if(cat) cat.textContent = meta.category;
  if(title) title.textContent = meta.label;
  if(rec) rec.textContent = meta.recipient;
  const flag = document.getElementById('email-tpl-saved-flag');
  if(flag) flag.textContent = '';
  renderEmailTplList();
}
function saveEmailTemplate(){
  const ta = document.getElementById('buhr-email-ta');
  const subj = document.getElementById('email-tpl-subject');
  if(ta) emailTemplates[activeEmailKey] = ta.value;
  if(subj) emailSubjects[activeEmailKey] = subj.value;
  const flag = document.getElementById('email-tpl-saved-flag');
  if(flag){ flag.textContent = '✓ Saved just now'; flag.style.color = 'var(--green)'; flag.style.fontStyle = 'normal'; flag.style.fontWeight = '600'; }
  showToast('Template saved: '+(emailTplMeta[activeEmailKey]||{}).label);
}
function resetEmailTemplate(){
  emailTemplates[activeEmailKey] = defaultEmailTemplates[activeEmailKey];
  emailSubjects[activeEmailKey] = emailTplMeta[activeEmailKey].subject;
  loadEmailTemplate(activeEmailKey);
  showToast('Template reset to default');
}

// Export to Excel (CSV download)
function exportBuhrExcel(){
  const headers = ['Employee','Role','Department','Manager','BU Head','SDP submitted','Scope','Growth conv.','Mgr plan fb','Q1 check-in','Mid-year','Mgr mid fb','Q2 check-in','Year-end','Mgr year fb'];
  const stat = v => v===null||typeof v==='undefined' ? '' : v==='pending' ? 'Pending' : v;
  const rows = buhrFiltered.map(e=>[
    e.name, e.role, e.dept, e.manager, e.buHead,
    stat(e.sdp), e.sdpScope||'', stat(e.growth), stat(e.planFb),
    stat(e.q1), stat(e.mid), stat(e.midFb),
    stat(e.q2), stat(e.end), stat(e.endFb)
  ]);
  const csvContent = [headers, ...rows].map(r=>r.map(c=>'"'+(c||'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob = new Blob(['\ufeff'+csvContent], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SDP_Tracking_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Export downloaded ('+buhrFiltered.length+' employees)');
}

// =====================================================
// VIEW SWITCHING: Employee view <-> Manager view <-> BU HR view
// =====================================================
let currentView = 'employee';
let lastEmployeeScreen = 'landing';

function toggleUserMenu(e){
  if(e) e.stopPropagation();
  const dd = document.getElementById('user-dropdown');
  if(dd) dd.classList.toggle('open');
}
function closeUserMenu(){
  const dd = document.getElementById('user-dropdown');
  if(dd) dd.classList.remove('open');
}
document.addEventListener('click', function(e){
  const menu = document.getElementById('view-toggle-pill');
  const dd = document.getElementById('user-dropdown');
  if(!menu || !dd) return;
  if(menu.contains(e.target) || dd.contains(e.target)) return;
  dd.classList.remove('open');
});

function updateViewToggleUI(){
  const optEmp = document.getElementById('ud-employee');
  const optMgr = document.getElementById('ud-manager');
  const optHr  = document.getElementById('ud-buhr');
  const chkEmp = document.getElementById('ud-check-employee');
  const chkMgr = document.getElementById('ud-check-manager');
  const chkHr  = document.getElementById('ud-check-buhr');
  const lbl    = document.getElementById('view-toggle-label');
  const views=[
    {key:'employee',opt:optEmp,chk:chkEmp,label:'Employee view'},
    {key:'manager',opt:optMgr,chk:chkMgr,label:'Manager view'},
    {key:'buhr',opt:optHr,chk:chkHr,label:'BU HR view'}
  ];
  views.forEach(v=>{
    const active=currentView===v.key;
    if(v.opt) v.opt.classList.toggle('active',active);
    if(v.chk) v.chk.style.visibility=active?'visible':'hidden';
    if(active && lbl) lbl.textContent=v.label;
  });
}

function updateRoleChrome(){
  const employeeItems=['snav-landing','snav-reflect','snav-goals','snav-action','snav-review','snav-manager','snav-dash'];
  const managerItems=['snav-team','snav-toolkit'];
  const managerOnlyItems=['snav-manager-title','snav-manager-group'];
  employeeItems.forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display='';
  });
  managerItems.forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display='';
  });
  managerOnlyItems.forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display=currentView==='manager'?'':'none';
  });
  const label=document.querySelector('#sidebar .sidebar-label');
  if(label) label.textContent=currentView==='manager'?'My SDP':'My SDP';
  const prog=document.querySelector('#sidebar .snav-progress');
  if(prog) prog.style.display='';
}

function openRoleView(view){
  if(view!==currentView){ switchView(view); return; }
  closeUserMenu();
  if(view==='manager'){
    goToScreen('landing');
  }else if(view==='buhr'){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const sc=document.getElementById('screen-buhr');
    if(sc) sc.classList.add('active');
    renderBuhrDashboard();
    window.scrollTo({top:0,behavior:'smooth'});
  }else{
    goToScreen('landing');
  }
}

function switchView(view){
  if(view===currentView){ closeUserMenu(); return; }
  if(currentView==='employee'){
    const active=document.querySelector('.screen.active');
    if(active && active.id!=='screen-role-landing') lastEmployeeScreen=active.id.replace('screen-','');
  }
  const sb = document.getElementById('sidebar');
  if(view==='buhr'){
    if(sb){ sb.style.display = 'none'; }
    const fab1 = document.getElementById('sdp-fab'); if(fab1) fab1.style.display='none';
    const fab2 = document.getElementById('journal-fab'); if(fab2) fab2.style.display='none';
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const sc = document.getElementById('screen-buhr');
    if(sc) sc.classList.add('active');
    currentView = 'buhr';
    renderBuhrDashboard();
    window.scrollTo({top:0,behavior:'smooth'});
  } else if(view==='manager'){
    if(sb){ sb.style.display = 'block'; sb.className = 'sidebar visible'; }
    const fab1 = document.getElementById('sdp-fab'); if(fab1) fab1.style.display='';
    const fab2 = document.getElementById('journal-fab'); if(fab2) fab2.style.display='';
    currentView = 'manager';
    goToScreen('landing');
  } else {
    if(sb){ sb.style.display = 'block'; sb.className = 'sidebar visible'; }
    const fab1 = document.getElementById('sdp-fab'); if(fab1) fab1.style.display='';
    const fab2 = document.getElementById('journal-fab'); if(fab2) fab2.style.display='';
    currentView = 'employee';
    goToScreen(lastEmployeeScreen || 'landing');
  }
  updateViewToggleUI();
  updateRoleChrome();
  closeUserMenu();
}


// FAQ MODAL
const faqData = [
  { heading: 'About the SDP', questions: [
    { q: 'How is the SDP different from what we have done before?', a: 'Previous processes focused primarily on performance targets, KRAs, and business outcomes. The SDP is entirely about your personal development. It is employee-owned and the quality of it depends entirely on how honestly you engage with it.' },
    { q: 'Who is responsible for my development plan?', a: 'You are. Your manager, the organisation, and development champions can provide support, guidance, and resources, but the ownership of your reflection, goals, and growth journey remains with you.' },
    { q: 'What mindset should I bring to this exercise?', a: 'Approach it with curiosity, honesty, and ownership. This is an opportunity to better understand yourself, identify meaningful areas for growth, and create a development plan that genuinely supports the professional you want to become.' },
    { q: 'Can my manager see my reflection answers?', a: 'Your reflection responses remain private and in draft mode until you choose to share them. You may share either your full reflection and goals or only the development goals and action plan during your growth conversation.' },
    { q: 'What support is available to help me?', a: 'You have access to an SDP workbook with reflection questions and goal-setting frameworks, good vs weak answer examples for questions, a goal-setting guide, and a growth conversation checklist. Your manager is also available to support you through the process.' }
  ]},
  { heading: 'About the Reflection', questions: [
    { q: 'How much time should I set aside for this exercise?', a: 'Set aside at least 30 uninterrupted minutes in a quiet and comfortable space where you will not be disturbed. All responses on the tool are automatically saved, so you can return to your reflection at any time and continue where you left off. Reflection done in a hurry often leads to surface-level answers rather than meaningful insights.' },
    { q: 'What should I do if I feel stuck or uncomfortable while reflecting?', a: 'Feeling stuck or uncomfortable is a normal part of reflection. Often, the thoughts and questions that are hardest to explore provide the most valuable insights. Give yourself time and continue exploring those areas thoughtfully.' },
    { q: 'How specific should my answers be?', a: 'Be as specific as possible. Instead of making broad statements, think about real situations, experiences, and moments. Specific examples lead to clearer insights and more meaningful development goals.' },
    { q: 'How can I get more value from my responses?', a: 'Try reviewing each answer as if you were advising a colleague. Ask yourself: What advice would I give them? What might they be avoiding? What important point remains unsaid? This perspective can help uncover deeper insights.' }
  ]},
  { heading: 'About Development Goals', questions: [
    { q: 'What is the difference between a functional, behavioural, and leadership goal?', a: 'A functional goal is about building a specific skill or knowledge area in your field of work, <em>for example getting better at financial analysis or learning a new technical process.</em> A behavioural goal is about how you show up and work with people, <em>for example becoming more direct in difficult conversations or building the habit of giving timely feedback.</em> A leadership goal is about how you influence, develop, and create clarity for others, <em>for example learning to lead a cross-functional room or developing the people around you.</em>' },
    { q: 'What is the difference between a development goal and a KRA?', a: 'A development goal focuses on building capabilities, behaviours, skills, or mindsets that support your long-term growth. A KRA focuses on business deliverables or performance outcomes. The reflection process is intended to help you identify meaningful development goals.' },
    { q: 'What if I do not know what my development goals should be?', a: 'That is exactly what the reflection is for. Go through the questions honestly and read your answers back. The goal usually becomes visible in the gap between who you are today and who you want to become.' },
    { q: 'How do I identify the right development goal?', a: 'Look for the common thread across your reflection responses. The development goal should emerge naturally from the patterns you observe rather than being chosen independently of your reflections.' }
  ]},
  { heading: 'The Manager Conversation', questions: [
    { q: 'What role does my manager play in the SDP?', a: 'Your manager is a development partner, not an evaluator. Their role is to listen to the goals you share, align on what support they can provide, and commit to specific actions that will help you grow. You lead the growth conversation and your manager supports it.' },
    { q: 'What happens during the growth conversation with my manager?', a: 'The growth conversation is a structured discussion where you walk your manager through the development goals you want to share, discuss what support or opportunities you need, and agree on a concrete action plan together.' }
  ]},
  { heading: 'The Timeline', questions: [
    { q: 'What is the timeline for the SDP cycle?', a: "The cycle begins with an annual reflection and goal-setting at the start of the year. A quarterly pulse check follows to help you stay honest with yourself about progress. A mid-year review with your manager allows for adjustments if needed. A year-end assessment closes the cycle and feeds into the next year\u2019s plan." }
  ]}
];

function renderFAQ(){
  const body = document.getElementById('faq-body');
  if(!body) return;
  let counter = 0;
  let html = '';
  faqData.forEach(sec=>{
    html += `<div class="faq-section-h">${escapeHtml(sec.heading)}</div>`;
    sec.questions.forEach(qd=>{
      counter += 1;
      const num = String(counter).padStart(2,'0');
      html += `<div class="faq-q"><div class="faq-q-num">${num}</div><div class="faq-q-body"><div class="faq-q-question">${escapeHtml(qd.q)}</div><div class="faq-q-answer">${qd.a}</div></div></div>`;
    });
  });
  body.innerHTML = html;
}
function openFAQModal(){
  renderFAQ();
  document.getElementById('modal-faq').classList.add('open');
}

// GROWTH CONVERSATION CHECKLIST (persisted via localStorage)
const GCL_KEY = 'sdp_growth_checklist_v2';
function gclLoadState(){
  try { return JSON.parse(localStorage.getItem(GCL_KEY) || '{}'); }
  catch(e){ return {}; }
}
function gclSaveState(state){
  try { localStorage.setItem(GCL_KEY, JSON.stringify(state)); }
  catch(e){}
}
function gclRefresh(){
  const state = gclLoadState();
  const items = document.querySelectorAll('[data-gcl]');
  let done = 0;
  items.forEach(el=>{
    const id = el.dataset.gcl;
    if(state[id]){ el.classList.add('checked'); done += 1; }
    else { el.classList.remove('checked'); }
  });
  const prog = document.getElementById('gcl-progress');
  if(prog) prog.textContent = done + ' of ' + items.length + ' complete';
}
function toggleGCLItem(el){
  if(!el || !el.dataset || !el.dataset.gcl) return;
  const state = gclLoadState();
  const id = el.dataset.gcl;
  state[id] = !state[id];
  gclSaveState(state);
  gclRefresh();
}
function resetGCLChecklist(){
  if(!confirm('Reset the entire checklist? All ticks will be cleared.')) return;
  gclSaveState({});
  gclRefresh();
  showToast('Checklist reset');
}
function openGrowthChecklist(){
  document.getElementById('modal-growth-checklist').classList.add('open');
  setTimeout(gclRefresh, 0);
}
function openChecklistFromCongrats(){
  openGrowthChecklist();
}

showPillar('will');
renderJE();
initChips();
document.getElementById('sidebar').style.display='none';
updateSidebar('landing');
updateViewToggleUI();
updateRoleChrome();
const initFab1=document.getElementById('sdp-fab'); if(initFab1) initFab1.style.display='none';
const initFab2=document.getElementById('journal-fab'); if(initFab2) initFab2.style.display='none';
