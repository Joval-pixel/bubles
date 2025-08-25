// BUBLES — Palpites em Bolhas (futebol). Tudo focado em apostas e probabilidades.
// Front estático + função serverless. Picks (PT/EN) e bolhas por confiança/viés.

const ADMIN_EMAIL = "bubles@joval.com.br";
const PIX_KEY = "388.335.408-20";
const PLAN_AMOUNT = 39.90;
const SUB_DAYS = 30;

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const todayISO = () => new Date().toISOString().slice(0,10);
const fmtHour = s => new Date(s).toLocaleTimeString("pt-BR", {hour:'2-digit', minute:'2-digit', hour12:false});
function toast(msg){ alert(msg); }

// Router
function showSection(id){ $$('.section').forEach(sec=>sec.classList.remove('visible')); $(id)?.classList.add('visible'); if(id==="#dashboard") guardDashboard(); }
window.addEventListener('hashchange', ()=> showSection(location.hash||'#home'));
$$('[data-route]').forEach(a=> a.addEventListener('click', e=>{ const href=a.getAttribute('href'); if(href.startsWith('#')){ e.preventDefault(); location.hash=href; }}));
if(!location.hash) location.hash = '#home';
showSection(location.hash || '#home');

// Auth simulado + paywall
const store = {
  get session(){return localStorage.getItem("bs_session")},
  set session(v){v?localStorage.setItem("bs_session",v):localStorage.removeItem("bs_session")},
  get subs(){return JSON.parse(localStorage.getItem("bs_subs")||"{}")},
  set subs(v){localStorage.setItem("bs_subs",JSON.stringify(v))},
  get users(){return JSON.parse(localStorage.getItem("bs_users")||"[]")},
  set users(v){localStorage.setItem("bs_users",JSON.stringify(v))},
  get picks(){return JSON.parse(localStorage.getItem("bs_picks")||"[]")},
  set picks(v){localStorage.setItem("bs_picks",JSON.stringify(v))},
};
const isSubscribed = (email)=>{ const s=store.subs[email]; return !!s && Date.now()<s.expiresAt; };

// forms
$('#form-register')?.addEventListener('submit', (e)=>{ e.preventDefault();
  const email=$('#reg-email').value.trim().toLowerCase(); const pass=$('#reg-pass').value;
  if(!email||!pass) return; const users=store.users;
  if(users.find(u=>u.email===email)) return toast('E-mail já cadastrado.');
  users.push({email,pass}); store.users=users; store.session=email; toast('Cadastro realizado.'); location.hash='#assinatura';
});
$('#form-login')?.addEventListener('submit', (e)=>{ e.preventDefault();
  const email=$('#log-email').value.trim().toLowerCase(); const pass=$('#log-pass').value;
  const u=store.users.find(u=>u.email===email&&u.pass===pass); if(!u) return toast('Credenciais inválidas.');
  store.session=email; toast('Bem-vindo!'); location.hash='#dashboard';
});
$('#btn-logout')?.addEventListener('click', ()=>{ store.session=''; toast('Sessão encerrada.'); location.hash='#home'; });
$('#btn-mark-paid')?.addEventListener('click', ()=>{ const email=store.session; if(!email) return toast('Faça login'); const subs=store.subs; subs[email]={plan:'mensal',startsAt:Date.now(),expiresAt:Date.now()+SUB_DAYS*86400000}; store.subs=subs; updateSubStatus(); toast('Assinatura ATIVADA (simulação).'); });
$('#go-dashboard')?.addEventListener('click', ()=> location.hash = '#dashboard');
function updateSubStatus(){ const email=store.session; $('#sub-status').textContent = !email ? 'Você não está logado.' : (isSubscribed(email) ? 'Assinatura ativa' : 'Sem assinatura ativa.'); if(location.hash==='#dashboard') guardDashboard(); }
function guardDashboard(){ const email=store.session; $('#user-email').textContent=email||'—'; const paywall=$('#paywall'); const content=$('#content'); if(!email){ paywall.classList.remove('hidden'); content.classList.add('hidden'); return; } if(isSubscribed(email)){ paywall.classList.add('hidden'); content.classList.remove('hidden'); renderPicksToday(); } else { paywall.classList.remove('hidden'); content.classList.add('hidden'); } }
updateSubStatus();

// ---------- API helpers
async function api(path, params={}){
  const url = new URL('/api/footy', location.origin);
  url.searchParams.set('path', path);
  Object.entries(params).forEach(([k,v])=> url.searchParams.set(k,v));
  const res = await fetch(url);
  if(!res.ok) throw new Error('API error '+res.status);
  return (await res.json()).response || [];
}
// Picks endpoint (mock), para depois plugar IA
async function fetchPicks(){
  const res = await fetch('/api/picks');
  if(!res.ok) return [];
  return await res.json();
}

// ---------- Probabilidades / vig / confiança
const implied = (o)=> o ? 1/o : 0;
function removeVig1X2({home,draw,away}){
  const ih = implied(home), id = implied(draw), ia = implied(away);
  const s = ih + id + ia || 1;
  return { pHome: ih/s, pDraw: id/s, pAway: ia/s };
}
function removeVigOU({over, under}){
  const io = implied(over), iu = implied(under);
  const s = io + iu || 1;
  return { pOver: io/s, pUnder: iu/s };
}
function confidenceFrom(bookmakers, delta){
  const pop = Math.min(1, Math.log2(1 + (bookmakers||1)) / 5);
  return Math.max(0, Math.min(1, 0.35 + 0.4*pop + 0.25*Math.abs(delta)));
}
function radius(conf){ return 18 + Math.sqrt(Math.max(conf,0.05))*38; }

// ---------- Bubbles engine (Canvas 2D)
class Bubble{
  constructor(d){
    this.label=d.t; this.bias=d.c; this.volume=d.v; this.conf=d.conf; this.meta=d.meta||{};
    this.r = radius(this.conf);
    this.x = Math.random()*420 + this.r; this.y = Math.random()*260 + this.r;
    this.vx = (Math.random()*1.2 - 0.6); this.vy = (Math.random()*1.2 - 0.6);
  }
  setBounds(w,h){ this.w=w; this.h=h; }
  step(dt){
    this.x += this.vx*dt; this.y += this.vy*dt;
    const F=0.995; this.vx*=F; this.vy*=F;
    if(this.x<this.r){ this.x=this.r; this.vx*=-1; }
    if(this.x>this.w-this.r){ this.x=this.w-this.r; this.vx*=-1; }
    if(this.y<this.r){ this.y=this.r; this.vy*=-1; }
    if(this.y>this.h-this.r){ this.y=this.h-this.r; this.vy*=-1; }
  }
  draw(ctx){
    const up = this.bias>=0;
    const grd = ctx.createRadialGradient(this.x-this.r*0.35, this.y-this.r*0.35, this.r*0.1, this.x, this.y, this.r);
    const base = up? 'rgba(0,255,170,0.95)':'rgba(255,70,85,0.95)';
    const mid  = up? 'rgba(0,180,120,0.9)':'rgba(200,40,60,0.9)';
    const dark = up? 'rgba(0,100,70,0.85)':'rgba(140,20,35,0.85)';
    grd.addColorStop(0, base); grd.addColorStop(0.45, mid); grd.addColorStop(1, dark);
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
    ctx.shadowBlur=18; ctx.shadowColor = up? 'rgba(0,255,170,0.75)' : 'rgba(255,70,85,0.75)';
    ctx.strokeStyle='white'; ctx.lineWidth=Math.max(2, this.r*0.04); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle='white'; ctx.font=`${Math.max(10, this.r*0.26)}px Inter, Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
    wrapText(ctx, this.label, this.x, this.y, this.r*1.7, Math.max(10, this.r*0.24));
  }
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  const lines=[]; let line='';
  words.forEach(w=>{ const test=line? line+' '+w : w; if(ctx.measureText(test).width > maxWidth){ lines.push(line); line=w; } else line=test; });
  lines.push(line);
  const h = (lines.length-1)*lineHeight;
  lines.forEach((ln,i)=> ctx.fillText(ln, x, y - h/2 + i*lineHeight));
}
function collide(a,b){
  const dx=b.x-a.x, dy=b.y-a.y; const dist=Math.hypot(dx,dy); const min=a.r+b.r;
  if(dist<min){
    const overlap=(min-dist)+0.5; const ux=dx/(dist||1), uy=dy/(dist||1);
    a.x -= ux*overlap/2; a.y -= uy*overlap/2; b.x += ux*overlap/2; b.y += uy*overlap/2;
    const k=0.85; const tvx=a.vx,tvy=a.vy; a.vx=b.vx*k; a.vy=b.vy*k; b.vx=tvx*k; b.vy=tvy*k;
  }
}
function BubbleScene(canvasId, dataset, onClick, tooltipEl){
  const cvs=document.getElementById(canvasId); if(!cvs) return;
  const ctx=cvs.getContext('2d');
  let W=cvs.clientWidth, H=cvs.clientHeight; cvs.width=W*2; cvs.height=H*2; ctx.scale(2,2);
  const bubbles = dataset.map(d=> new Bubble(d));
  bubbles.forEach(b=> b.setBounds(W,H));
  let last=performance.now();
  function frame(ts){ const dt=Math.min(1.6,(ts-last)/16); last=ts; ctx.clearRect(0,0,W,H);
    bubbles.forEach(b=>{ b.setBounds(W,H); b.step(dt); });
    for(let i=0;i<bubbles.length;i++) for(let j=i+1;j<bubbles.length;j++) collide(bubbles[i],bubbles[j]);
    bubbles.forEach(b=> b.draw(ctx));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // hit detection for tooltip/click
  cvs.addEventListener('mousemove', (e)=>{
    if(!tooltipEl) return;
    const rect = cvs.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    const hit = bubbles.find(b => Math.hypot(b.x - x, b.y - y) <= b.r);
    if(hit){
      tooltipEl.classList.remove('hidden');
      tooltipEl.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltipEl.style.top  = (e.clientY - rect.top + 12) + 'px';
      const m = hit.meta||{};
      tooltipEl.innerHTML = `<b>${m.game||hit.label.split('\n')[0]}</b><br>${m.league||''}${m.country? ' — '+m.country : ''}<br>${m.market||''} • ${m.selection||''} • odds: ${m.odds||'-'}`;
    } else {
      tooltipEl.classList.add('hidden');
    }
  });
  cvs.addEventListener('mouseleave', ()=> tooltipEl && tooltipEl.classList.add('hidden'));
  cvs.addEventListener('click', (e)=>{
    const rect = cvs.getBoundingClientRect();
    const x = (e.clientX - rect.left); const y = (e.clientY - rect.top);
    const hit = bubbles.find(b => Math.hypot(b.x - x, b.y - y) <= b.r);
    if(hit && onClick) onClick(hit.meta);
  });

  new ResizeObserver(()=>{ W=cvs.clientWidth; H=cvs.clientHeight; cvs.width=W*2; cvs.height=H*2; ctx.setTransform(1,0,0,1,0,0); ctx.scale(2,2); bubbles.forEach(b=> b.setBounds(W,H)); }).observe(cvs);
}

// ---------- Dataset builder (a partir de picks)
function datasetFromPicks(picks, filterMarket, filterLeague){
  const rows = picks.filter(p=> (!filterMarket || p.market===filterMarket) &&
                                (!filterLeague || (p.league||'').toLowerCase().includes(filterLeague.toLowerCase())));
  return rows.map(p=>{
    const delta = p.market==="OU25" ? (p.pOver - p.pUnder) : (Math.max(p.pHome,p.pDraw,p.pAway) - [p.pHome,p.pDraw,p.pAway].sort((a,b)=>b-a)[1] || 0);
    const conf  = p.confidence!=null ? p.confidence : Math.max(0.35, Math.min(1, 0.35 + 0.4*Math.log2(1+(p.bookmakers||5))/5 + 0.25*Math.abs(delta)));
    const label = `${p.game}\n${p.datetime_brt.slice(11,16)} | ${p.market==="OU25" ? ("O2.5:"+p.odds_over+" U2.5:"+p.odds_under) : ("H:"+p.odds_home+" D:"+p.odds_draw+" A:"+p.odds_away)}`;
    return { t: label, c: delta*100, v: p.bookmakers||5, conf, meta: p };
  });
}

// ---------- Render details
function renderDetails(meta){
  const box = $('#details');
  box.classList.remove('hidden');
  const pt = meta.analysis_pt || "-";
  const en = meta.analysis_en || "-";
  const h2h = meta.h2h || "-";
  const stats = meta.stats || "-";
  box.innerHTML = `
    <div class="kvs">
      <div><b>Jogo</b><br>${meta.game}</div>
      <div><b>Liga</b><br>${meta.league||''}</div>
      <div><b>Data/Hora (BRT)</b><br>${meta.datetime_brt||''}</div>
      <div><b>Mercado</b><br>${meta.market} • ${meta.selection} • odds ${meta.odds||'-'}</div>
    </div>
    <div class="line"></div>
    <h4>Análise (PT)</h4>
    <pre>${pt}</pre>
    <h4>Analysis (EN)</h4>
    <pre>${en}</pre>
    <div class="line"></div>
    <h4>H2H / Estatísticas</h4>
    <pre>${h2h}\n${stats}</pre>
  `;
  box.scrollIntoView({behavior:"smooth", block:"start"});
}

// ---------- Refresh
async function refreshBubbles(){
  try{
    $('#last-update').textContent='Carregando palpites...';
    const picks = await fetchPicks(); // vem de /api/picks (mock agora)
    const filterLeague = ($('#league-filter')?.value||'').trim();
    const market = $('#market-select')?.value || 'OU25';
    const data = datasetFromPicks(picks, market, filterLeague);
    $('#last-update').textContent=`Atualizado: ${new Date().toLocaleTimeString('pt-BR',{hour12:false})} — ${data.length} palpites`;
    BubbleScene('bubble-canvas', data, renderDetails, $('#tooltip'));
    BubbleScene('bubble-canvas-mini', data.slice(0,18));
  } catch(e){
    console.error(e);
    $('#last-update').textContent='Erro ao atualizar.';
    toast('Erro ao carregar palpites.');
  }
}
$('#btn-refresh')?.addEventListener('click', refreshBubbles);
window.addEventListener('load', refreshBubbles);

// ---------- Dashboard list (para assinantes)
function renderPicksToday(){
  const el = $('#picks-today');
  fetch('/api/picks').then(r=>r.json()).then(picks=>{
    if(!picks.length){ el.innerHTML = '<p class="muted">Sem palpites publicados hoje.</p>'; return; }
    el.innerHTML = picks.map(p=>`
      <div class="post">
        <div class="post-head"><strong>${p.game}</strong> · <span>${p.league||''}</span> <span class="muted">— ${p.datetime_brt||''}</span></div>
        <div class="post-body">
          <ul>
            <li><b>Mercado:</b> ${p.market} • ${p.selection} • odds ${p.odds||'-'}</li>
            <li><b>Desempenho Recente:</b> ${p.recent||'-'}</li>
            <li><b>H2H:</b> ${p.h2h||'-'}</li>
            <li><b>Estatísticas:</b> ${p.stats||'-'}</li>
            <li><b>Situação da Equipe:</b> ${p.squad||'-'}</li>
          </ul>
          <div class="line"></div>
          <div class="recos">
            <div class="reco"><b>Opção 1:</b> ${p.option1||'-'}<br><span class="muted">${p.reason1||''}</span></div>
            ${p.option2?`<div class="reco"><b>Opção 2:</b> ${p.option2}<br><span class="muted">${p.reason2||''}</span></div>`:''}
          </div>
        </div>
      </div>
    `).join("");
  }).catch(()=> el.innerHTML = '<p class="muted">Erro ao carregar.</p>');
}
