# 📦 Bubles Stats — Versão com **API oficial** + **Proxy Serverless** (Vercel)

> Pronto para **deploy**: bolhas alimentadas por **API‑Football** (via RapidAPI) através de **função serverless** (oculta sua chave). Checkout **PIX somente** (CPF **388.335.408-20**), paywall e área do assinante mantidos.

---

## 1) `index.html`

```html
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bubles Stats — Palpites com Bolhas (ao vivo)</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <div class="brand">
        <div class="logo">BS</div>
        <div class="brand-text">
          <h1>Bubles Stats</h1>
          <p>Bolhas com odds e viés estatístico</p>
        </div>
      </div>
      <nav class="nav">
        <a href="#home" data-route>Início</a>
        <a href="#planos" data-route>Planos</a>
        <a href="#entrar" data-route class="btn btn-outline">Entrar</a>
        <a href="#dashboard" data-route class="btn btn-primary">Área do Assinante</a>
      </nav>
    </div>
  </header>

  <main>
    <section id="home" class="section visible">
      <div class="container home-wrap">
        <div class="home-left">
          <h2>Palpites com <span class="highlight">dados reais</span>.</h2>
          <p>Bolhas mostram viés do mercado (Over/Under 2.5) e popularidade (nº de casas). Fonte: API oficial via proxy.</p>
          <div class="filters">
            <label>País/Liga: <input id="league-filter" placeholder="Ex.: Brazil, England, Spain" /></label>
            <button class="btn btn-primary" id="btn-refresh">Atualizar hoje</button>
          </div>
          <ul class="bullets">
            <li>Busca jogos de <b>hoje</b> + odds 1X2 e Over/Under 2.5</li>
            <li>Cor: <b>verde</b> (viés Over) / <b>vermelho</b> (viés Under)</li>
            <li>Tamanho: popularidade (~ nº de casas/odds)</li>
          </ul>
        </div>
        <div class="home-right">
          <canvas id="bubble-canvas" width="520" height="420"></canvas>
          <div class="muted smallpad" id="last-update">—</div>
        </div>
      </div>
    </section>

    <section id="planos" class="section">
      <div class="container">
        <h2>Planos</h2>
        <div class="plans">
          <div class="plan-card shadow">
            <h3>Mensal</h3>
            <div class="price">R$ <strong>39,90</strong> <span>/mês</span></div>
            <ul>
              <li>Análises diárias (PT/EN)</li>
              <li>Relatórios com H2H, xG/xGA</li>
              <li>Exportação e alertas</li>
            </ul>
            <a href="#assinatura" class="btn btn-primary" data-route>Assinar</a>
          </div>
        </div>
      </div>
    </section>

    <section id="entrar" class="section">
      <div class="container grid-2">
        <div class="card shadow">
          <h3>Criar conta</h3>
          <form id="form-register" class="form">
            <label>Email <input type="email" id="reg-email" required /></label>
            <label>Senha <input type="password" id="reg-pass" required /></label>
            <button class="btn btn-primary" type="submit">Cadastrar</button>
          </form>
        </div>
        <div class="card shadow">
          <h3>Entrar</h3>
          <form id="form-login" class="form">
            <label>Email <input type="email" id="log-email" required /></label>
            <label>Senha <input type="password" id="log-pass" required /></label>
            <button class="btn btn-primary" type="submit">Entrar</button>
          </form>
        </div>
      </div>
    </section>

    <section id="assinatura" class="section">
      <div class="container grid-2">
        <div class="card shadow">
          <h3>Checkout — PIX</h3>
          <p>Efetue o pagamento via PIX com a chave CPF <b>388.335.408-20</b> (simulado).</p>
          <input id="pix-key" value="388.335.408-20" readonly />
          <input id="pix-amount" value="39,90" readonly />
          <button class="btn btn-primary" id="btn-mark-paid">Confirmar Pagamento (Simulação)</button>
        </div>
        <div class="card shadow">
          <h3>Status</h3>
          <p id="sub-status">Você não está logado.</p>
          <button class="btn btn-outline" id="go-dashboard">Ir para Área do Assinante</button>
        </div>
      </div>
    </section>

    <section id="dashboard" class="section">
      <div class="container">
        <div class="dash-top">
          <h2>Área do Assinante</h2>
          <div class="session">
            <span id="user-email">—</span>
            <button class="btn btn-ghost" id="btn-logout">Sair</button>
          </div>
        </div>

        <div id="paywall" class="paywall hidden">
          <p>Assinatura inativa. <a href="#assinatura" data-route>Assine</a>.</p>
        </div>

        <div id="content" class="hidden">
          <div class="grid-2">
            <div class="card shadow">
              <h3>Postagens de Hoje</h3>
              <div id="posts-today"></div>
            </div>
            <div class="card shadow">
              <h3>Bolhas (snapshot)</h3>
              <canvas id="bubble-canvas-mini" width="480" height="360"></canvas>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div><strong>Bubles Stats</strong> — conteúdo educacional.</div>
    </div>
  </footer>

  <script src="/script.js"></script>
</body>
</html>
```

---

## 2) `style.css`

```css
:root{
  --bg:#0e1013; --panel:#151922; --muted:#97a0af; --text:#e6eaf2;
  --brand:#6ae3a1; --brand-2:#4cc2ff; --border:#232838;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
.container{max-width:1100px;margin:0 auto;padding:28px}
.section{display:none;padding:24px 0}
.section.visible{display:block}
.site-header{position:sticky;top:0;background:#0c0f14;border-bottom:1px solid var(--border);z-index:20}
.header-inner{display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;gap:12px;align-items:center}
.logo{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--brand),var(--brand-2));display:grid;place-items:center;color:#0b1020;font-weight:800}
.brand-text h1{margin:0;font-size:18px}
.brand-text p{margin:2px 0 0;color:var(--muted);font-size:12px}
.nav{display:flex;gap:12px;align-items:center}
.nav a{color:var(--text);text-decoration:none;opacity:.9}

h2{font-size:28px;margin:0 0 16px}
.highlight{color:var(--brand)}
.home-wrap{display:grid;grid-template-columns:1.15fr .85fr;gap:24px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:18px}
.shadow{box-shadow:0 10px 30px rgba(0,0,0,.35)}
.muted{color:var(--muted);font-size:12px}
.smallpad{padding-top:6px}

.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;border:1px solid var(--border);cursor:pointer;text-decoration:none;color:var(--text)}
.btn-primary{background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#071020;border:none}
.btn-outline{background:transparent}
.btn-ghost{background:transparent;border-color:transparent}

.filters{display:flex;gap:8px;align-items:center;margin:10px 0}
.bullets{margin:14px 0;padding-left:18px}
.bullets li{margin:8px 0}

#bubble-canvas, #bubble-canvas-mini{
  width:100%;height:420px;display:block;
  background:radial-gradient(1200px 600px at 30% 10%, #0f1421 0%, #0c0f16 60%, #0a0d13 100%);
  border-radius:14px;border:1px solid var(--border)
}

@media (max-width: 900px){
  .home-wrap, .grid-2{grid-template-columns:1fr}
}
```

---

## 3) `script.js`

```js
/*************************************************
 * Bubles Stats — Bolhas com dados (API-Football)
 * - Via função serverless /api/footy (proxy)
 * - Busca fixtures HOJE + odds O/U 2.5 e 1X2
 *************************************************/

const ADMIN_EMAIL = "bubles@joval.com.br";
const PIX_KEY = "388.335.408-20";
const PLAN_AMOUNT = 39.90;
const SUB_DAYS = 30;

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const todayISO = () => new Date().toISOString().slice(0,10);
const fmtHour = s => new Date(s).toLocaleTimeString("pt-BR", {hour:'2-digit', minute:'2-digit', hour12:false});
function toast(msg){ alert(msg); }

// ======= Auth/Paywall (simulado)
const store = {
  get session(){return localStorage.getItem("bs_session")},
  set session(v){v?localStorage.setItem("bs_session",v):localStorage.removeItem("bs_session")},
  get subs(){return JSON.parse(localStorage.getItem("bs_subs")||"{}")},
  set subs(v){localStorage.setItem("bs_subs",JSON.stringify(v))},
};
const isSubscribed = (email)=>{ const s=store.subs[email]; return !!s && Date.now()<s.expiresAt; };

function showSection(id){ $$('.section').forEach(sec=>sec.classList.remove('visible')); $(id)?.classList.add('visible'); if(id==="#dashboard") guardDashboard(); }
window.addEventListener('hashchange', ()=> showSection(location.hash||'#home'));
$$('[data-route]').forEach(a=> a.addEventListener('click', e=>{ const href=a.getAttribute('href'); if(href.startsWith('#')){ e.preventDefault(); location.hash=href; }}));
if(!location.hash) location.hash = '#home';
showSection(location.hash || '#home');

$('#form-register')?.addEventListener('submit', (e)=>{ e.preventDefault(); const email=$('#reg-email').value.trim().toLowerCase(); const pass=$('#reg-pass').value; if(!email||!pass) return; const users=JSON.parse(localStorage.getItem('bs_users')||'[]'); if(users.find(u=>u.email===email)) return toast('E-mail já cadastrado.'); users.push({email,pass}); localStorage.setItem('bs_users', JSON.stringify(users)); store.session=email; toast('Cadastro realizado.'); location.hash='#assinatura'; });
$('#form-login')?.addEventListener('submit', (e)=>{ e.preventDefault(); const email=$('#log-email').value.trim().toLowerCase(); const pass=$('#log-pass').value; const users=JSON.parse(localStorage.getItem('bs_users')||'[]'); if(!users.find(u=>u.email===email&&u.pass===pass)) return toast('Credenciais inválidas.'); store.session=email; toast('Bem-vindo!'); location.hash='#dashboard'; });
$('#btn-logout')?.addEventListener('click', ()=>{ store.session=''; toast('Sessão encerrada.'); location.hash='#home'; });
$('#btn-mark-paid')?.addEventListener('click', ()=>{ const email=store.session; if(!email) return toast('Faça login'); const subs=store.subs; subs[email]={plan:'mensal',startsAt:Date.now(),expiresAt:Date.now()+SUB_DAYS*86400000}; store.subs=subs; updateSubStatus(); toast('Assinatura ATIVADA (simulação).'); });
$('#go-dashboard')?.addEventListener('click', ()=> location.hash = '#dashboard');

function updateSubStatus(){ const email=store.session; $('#sub-status').textContent = !email ? 'Você não está logado.' : (isSubscribed(email) ? 'Assinatura ativa' : 'Sem assinatura ativa.'); if(location.hash==='#dashboard') guardDashboard(); }
function guardDashboard(){ const email=store.session; $('#user-email').textContent=email||'—'; const paywall=$('#paywall'); const content=$('#content'); if(!email){ paywall.classList.remove('hidden'); content.classList.add('hidden'); return; } if(isSubscribed(email)){ paywall.classList.add('hidden'); content.classList.remove('hidden'); } else { paywall.classList.remove('hidden'); content.classList.add('hidden'); } }
updateSubStatus();

// ======= API via Proxy (/api/footy)
async function api(path, params={}){
  const url = new URL('/api/footy', location.origin);
  url.searchParams.set('path', path);
  Object.entries(params).forEach(([k,v])=> url.searchParams.set(k,v));
  const res = await fetch(url);
  if(!res.ok) throw new Error('API error '+res.status);
  return (await res.json()).response || [];
}

async function fetchTodayFixtures(leagueFilter){
  const fixtures = await api('/v3/fixtures', { date: todayISO(), timezone: 'America/Sao_Paulo' });
  const f = (leagueFilter||'').trim().toLowerCase();
  if(!f) return fixtures;
  return fixtures.filter(x=> `${x.league?.country||''} ${x.league?.name||''}`.toLowerCase().includes(f) );
}

async function fetchOddsForFixture(fixtureId){
  const odds = await api('/v3/odds', { fixture: fixtureId });
  let bookmakersCount = odds.length; let ou=null; let win1x2=null;
  for(const b of odds){
    for(const mk of (b.bookmakers?.[0]?.bets || b.bets || [])){
      const name=(mk.name||'').toLowerCase();
      if(name.includes('winner')||name==='1x2'){
        const map={}; (mk.values||[]).forEach(v=>{ const vv=(v.value||'').toLowerCase(); if(vv.includes('home')||vv==='1') map.home=parseFloat(v.odd); if(vv.includes('draw')||vv==='x') map.draw=parseFloat(v.odd); if(vv.includes('away')||vv==='2') map.away=parseFloat(v.odd); });
        if(Object.keys(map).length) win1x2=map;
      }
      if(name.includes('over/under')||name.includes('totals')){
        const twoFive=(mk.values||[]).filter(v=> (v.value||'').includes('2.5'));
        if(twoFive.length){ const mapOU={}; twoFive.forEach(v=>{ const vv=(v.value||'').toLowerCase(); if(vv.includes('over')) mapOU.over=parseFloat(v.odd); if(vv.includes('under')) mapOU.under=parseFloat(v.odd); }); if(mapOU.over||mapOU.under) ou=mapOU; }
      }
    }
  }
  return { bookmakersCount, ou, win1x2 };
}

const prob = o=> o ? (1/o) : 0;

async function buildBubbles(leagueFilter){
  const fixtures = await fetchTodayFixtures(leagueFilter);
  const out=[]; const pick=fixtures.slice(0,40);
  for(const fx of pick){
    const id=fx.fixture?.id; const home=fx.teams?.home?.name||'Home'; const away=fx.teams?.away?.name||'Away'; const time=fx.fixture?.date;
    let overBias=0, vol=1, label=`${home} vs ${away}`;
    try{
      const { bookmakersCount, ou } = await fetchOddsForFixture(id);
      vol = Math.max(1, bookmakersCount||1);
      if(ou){ const pO=prob(ou.over), pU=prob(ou.under); const z=pO+pU||1; overBias=((pO-pU)/z)*100; label += `
${fmtHour(time)} | O2.5:${ou.over||'-'} U2.5:${ou.under||'-'}`; }
      else { label += `
${fmtHour(time)} | odds O/U indisponíveis`; }
    }catch(e){ console.warn('odds fail', e); overBias=0; }
    out.push({ t: label, c: overBias, v: vol });
  }
  return out;
}

// ======= Bolhas (engine)
class Bubble{ constructor(label,bias,volume){ this.label=label; this.bias=bias; this.volume=volume; this.r=Math.max(16, Math.min(76, 18 + Math.sqrt(Math.abs(bias)+1)*Math.log2(volume+1)*3)); this.x=Math.random()*400+this.r; this.y=Math.random()*260+this.r; this.vx=(Math.random()*1.2-0.6); this.vy=(Math.random()*1.2-0.6);} setBounds(w,h){ this.w=w; this.h=h; } step(dt){ this.x+=this.vx*dt; this.y+=this.vy*dt; const F=0.995; this.vx*=F; this.vy*=F; if(this.x<this.r){ this.x=this.r; this.vx*=-1;} if(this.x>this.w-this.r){ this.x=this.w-this.r; this.vx*=-1;} if(this.y<this.r){ this.y=this.r; this.vy*=-1;} if(this.y>this.h-this.r){ this.y=this.h-this.r; this.vy*=-1;} } draw(ctx){ const up=this.bias>=0; const grd=ctx.createRadialGradient(this.x-this.r*0.35,this.y-this.r*0.35,this.r*0.1,this.x,this.y,this.r); const base=up?'rgba(0,255,170,0.95)':'rgba(255,70,85,0.95)'; const mid=up?'rgba(0,180,120,0.9)':'rgba(200,40,60,0.9)'; const dark=up?'rgba(0,100,70,0.85)':'rgba(140,20,35,0.85)'; grd.addColorStop(0,base); grd.addColorStop(0.45,mid); grd.addColorStop(1,dark); ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill(); ctx.shadowBlur=18; ctx.shadowColor=up?'rgba(0,255,170,0.75)':'rgba(255,70,85,0.75)'; ctx.strokeStyle='white'; ctx.lineWidth=Math.max(2,this.r*0.04); ctx.stroke(); ctx.shadowBlur=0; ctx.fillStyle='white'; ctx.font=`${Math.max(10,this.r*0.26)}px Inter, Arial`; ctx.textAlign='center'; ctx.textBaseline='middle'; wrapText(ctx,this.label,this.x,this.y,this.r*1.7,Math.max(10,this.r*0.24)); } }
function wrapText(ctx,text,x,y,maxWidth,lineHeight){ const words=text.split(' '); const lines=[]; let line=''; words.forEach(w=>{ const test=line? line+' '+w : w; if(ctx.measureText(test).width>maxWidth){ lines.push(line); line=w; } else line=test; }); lines.push(line); const h=(lines.length-1)*lineHeight; lines.forEach((ln,i)=> ctx.fillText(ln,x,y-h/2+i*lineHeight)); }
function collide(a,b){ const dx=b.x-a.x, dy=b.y-a.y; const dist=Math.hypot(dx,dy); const min=a.r+b.r; if(dist<min){ const overlap=(min-dist)+0.5; const ux=dx/(dist||1), uy=dy/(dist||1); a.x-=ux*overlap/2; a.y-=uy*overlap/2; b.x+=ux*overlap/2; b.y+=uy*overlap/2; const k=0.85; const tvx=a.vx,tvy=a.vy; a.vx=b.vx*k; a.vy=b.vy*k; b.vx=tvx*k; b.vy=tvy*k; } }
function BubbleScene(canvasId, dataset){ const cvs=document.getElementById(canvasId); if(!cvs) return; const ctx=cvs.getContext('2d'); let W=cvs.clientWidth, H=cvs.clientHeight; cvs.width=W*2; cvs.height=H*2; ctx.scale(2,2); const bubbles=dataset.map(d=> new Bubble(d.t,d.c,d.v)); bubbles.forEach(b=> b.setBounds(W,H)); let last=performance.now(); function frame(ts){ const dt=Math.min(1.6,(ts-last)/16); last=ts; ctx.clearRect(0,0,W,H); bubbles.forEach(b=>{ b.setBounds(W,H); b.step(dt); }); for(let i=0;i<bubbles.length;i++) for(let j=i+1;j<bubbles.length;j++) collide(bubbles[i],bubbles[j]); bubbles.forEach(b=> b.draw(ctx)); requestAnimationFrame(frame);} requestAnimationFrame(frame); new ResizeObserver(()=>{ W=cvs.clientWidth; H=cvs.clientHeight; cvs.width=W*2; cvs.height=H*2; ctx.setTransform(1,0,0,1,0,0); ctx.scale(2,2); bubbles.forEach(b=> b.setBounds(W,H)); }).observe(cvs); }

async function refreshBubbles(){ try{ $('#last-update').textContent='Atualizando...'; const filter=($('#league-filter')?.value||'').trim(); const data=await buildBubbles(filter); $('#last-update').textContent=`Atualizado: ${new Date().toLocaleTimeString('pt-BR',{hour12:false})} — ${data.length} jogos`; BubbleScene('bubble-canvas', data); BubbleScene('bubble-canvas-mini', data.slice(0,18)); } catch(e){ console.error(e); $('#last-update').textContent='Erro ao atualizar.'; toast('Erro ao buscar dados.'); } }
$('#btn-refresh')?.addEventListener('click', refreshBubbles);
window.addEventListener('load', refreshBubbles);
```

---

## 4) **Função Serverless** (Vercel) — `api/footy.js`

```js
// /api/footy.js — Proxy para API-Football (RapidAPI)
// Configure a env var: RAPIDAPI_KEY

export default async function handler(req, res){
  try{
    const { path = "/v3/fixtures", ...query } = req.query;
    const host = "api-football-v1.p.rapidapi.com";
    const url = new URL(`https://${host}${path}`);
    Object.entries(query).forEach(([k,v])=> url.searchParams.set(k, v));

    const r = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": host
      }
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(err){
    res.status(500).json({ error: true, message: err.message });
  }
}
```

---

## ☁️ Deploy na Vercel

1. **Arquivos** no repositório: `index.html`, `style.css`, `script.js`, **pasta** `api/footy.js`.
2. Na Vercel, em **Settings → Environment Variables**: crie `RAPIDAPI_KEY` com sua chave da RapidAPI (API‑Football).
3. Deploy como **Static + Functions** (Vercel detecta a pasta `api/`).
4. A página inicial já mostrará as **bolhas ao vivo**; use o filtro de país/liga se quiser.

> Depois, posso adicionar: refresh automático, cache serverless, mais mercados (BTTS, AH), e ligar as análises da Área do Assinante a este mesmo backend.
