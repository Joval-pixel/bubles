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

function showSection(id){ 
  $$('.section').forEach(sec=>sec.classList.remove('visible')); 
  $(id)?.classList.add('visible'); 
  if(id==="#dashboard") guardDashboard(); 
}

window.addEventListener('hashchange', ()=> showSection(location.hash||'#home'));
$$('[data-route]').forEach(a=> a.addEventListener('click', e=>{ 
  const href=a.getAttribute('href'); 
  if(href.startsWith('#')){ 
    e.preventDefault(); 
    location.hash=href; 
  }
}));

if(!location.hash) location.hash = '#home';
showSection(location.hash || '#home');

// Event Listeners para formulários
$('#form-register')?.addEventListener('submit', (e)=>{ 
  e.preventDefault(); 
  const email=$('#reg-email').value.trim().toLowerCase(); 
  const pass=$('#reg-pass').value; 
  if(!email||!pass) return; 
  const users=JSON.parse(localStorage.getItem('bs_users')||'[]'); 
  if(users.find(u=>u.email===email)) return toast('E-mail já cadastrado.'); 
  users.push({email,pass}); 
  localStorage.setItem('bs_users', JSON.stringify(users)); 
  store.session=email; 
  toast('Cadastro realizado.'); 
  location.hash='#assinatura'; 
});

$('#form-login')?.addEventListener('submit', (e)=>{ 
  e.preventDefault(); 
  const email=$('#log-email').value.trim().toLowerCase(); 
  const pass=$('#log-pass').value; 
  const users=JSON.parse(localStorage.getItem('bs_users')||'[]'); 
  if(!users.find(u=>u.email===email&&u.pass===pass)) return toast('Credenciais inválidas.'); 
  store.session=email; 
  toast('Bem-vindo!'); 
  location.hash='#dashboard'; 
});

$('#btn-logout')?.addEventListener('click', ()=>{ 
  store.session=''; 
  toast('Sessão encerrada.'); 
  location.hash='#home'; 
});

$('#btn-mark-paid')?.addEventListener('click', ()=>{ 
  const email=store.session; 
  if(!email) return toast('Faça login'); 
  const subs=store.subs; 
  subs[email]={plan:'mensal',startsAt:Date.now(),expiresAt:Date.now()+SUB_DAYS*86400000}; 
  store.subs=subs; 
  updateSubStatus(); 
  toast('Assinatura ATIVADA (simulação).'); 
});

$('#go-dashboard')?.addEventListener('click', ()=> location.hash = '#dashboard');

function updateSubStatus(){ 
  const email=store.session; 
  $('#sub-status').textContent = !email ? 'Você não está logado.' : (isSubscribed(email) ? 'Assinatura ativa' : 'Sem assinatura ativa.'); 
  if(location.hash==='#dashboard') guardDashboard(); 
}

function guardDashboard(){ 
  const email=store.session; 
  $('#user-email').textContent=email||'—'; 
  const paywall=$('#paywall'); 
  const content=$('#content'); 
  if(!email){ 
    paywall.classList.remove('hidden'); 
    content.classList.add('hidden'); 
    return; 
  } 
  if(isSubscribed(email)){ 
    paywall.classList.add('hidden'); 
    content.classList.remove('hidden'); 
  } else { 
    paywall.classList.remove('hidden'); 
    content.classList.add('hidden'); 
  } 
}

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
  let bookmakersCount = odds.length; 
  let ou=null; 
  let win1x2=null;
  
  for(const b of odds){
    for(const mk of (b.bookmakers?.[0]?.bets || b.bets || [])){
      const name=(mk.name||'').toLowerCase();
      if(name.includes('winner')||name==='1x2'){
        const map={}; 
        (mk.values||[]).forEach(v=>{ 
          const vv=(v.value||'').toLowerCase(); 
          if(vv.includes('home')||vv==='1') map.home=parseFloat(v.odd); 
          if(vv.includes('draw')||vv==='x') map.draw=parseFloat(v.odd); 
          if(vv.includes('away')||vv==='2') map.away=parseFloat(v.odd); 
        });
        if(Object.keys(map).length) win1x2=map;
      }
      if(name.includes('over/under')||name.includes('totals')){
        const twoFive=(mk.values||[]).filter(v=> (v.value||'').includes('2.5'));
        if(twoFive.length){ 
          const mapOU={}; 
          twoFive.forEach(v=>{ 
            const vv=(v.value||'').toLowerCase(); 
            if(vv.includes('over')) mapOU.over=parseFloat(v.odd); 
            if(vv.includes('under')) mapOU.under=parseFloat(v.odd); 
          }); 
          if(mapOU.over||mapOU.under) ou=mapOU; 
        }
      }
    }
  }
  return { bookmakersCount, ou, win1x2 };
}

const prob = o=> o ? (1/o) : 0;

async function buildBubbles(leagueFilter){
  const fixtures = await fetchTodayFixtures(leagueFilter);
  const out=[]; 
  const pick=fixtures.slice(0,40);
  
  for(const fx of pick){
    const id=fx.fixture?.id; 
    const home=fx.teams?.home?.name||'Home'; 
    const away=fx.teams?.away?.name||'Away'; 
    const time=fx.fixture?.date;
    let overBias=0, vol=1, label=`${home} vs ${away}`;
    
    try{
      const { bookmakersCount, ou } = await fetchOddsForFixture(id);
      vol = Math.max(1, bookmakersCount||1);
      if(ou){ 
        const pO=prob(ou.over), pU=prob(ou.under); 
        const z=pO+pU||1; 
        overBias=((pO-pU)/z)*100; 
        label += `\n${fmtHour(time)} | O2.5:${ou.over||'-'} U2.5:${ou.under||'-'}`; 
      } else { 
        label += `\n${fmtHour(time)} | odds O/U indisponíveis`; 
      }
    }catch(e){ 
      console.warn('odds fail', e); 
      overBias=0; 
    }
    out.push({ t: label, c: overBias, v: vol });
  }
  return out;
}

// ======= Bolhas (engine)
class Bubble{ 
  constructor(label,bias,volume){ 
    this.label=label; 
    this.bias=bias; 
    this.volume=volume; 
    this.r=Math.max(16, Math.min(76, 18 + Math.sqrt(Math.abs(bias)+1)*Math.log2(volume+1)*3)); 
    this.x=Math.random()*400+this.r; 
    this.y=Math.random()*260+this.r; 
    this.vx=(Math.random()*1.2-0.6); 
    this.vy=(Math.random()*1.2-0.6);
  } 
  
  setBounds(w,h){ 
    this.w=w; 
    this.h=h; 
  } 
  
  step(dt){ 
    this.x+=this.vx*dt; 
    this.y+=this.vy*dt; 
    const F=0.995; 
    this.vx*=F; 
    this.vy*=F; 
    
    if(this.x<this.r){ this.x=this.r; this.vx*=-1;} 
    if(this.x>this.w-this.r){ this.x=this.w-this.r; this.vx*=-1;} 
    if(this.y<this.r){ this.y=this.r; this.vy*=-1;} 
    if(this.y>this.h-this.r){ this.y=this.h-this.r; this.vy*=-1;} 
  } 
  
  draw(ctx){ 
    const up=this.bias>=0; 
    const grd=ctx.createRadialGradient(this.x-this.r*0.35,this.y-this.r*0.35,this.r*0.1,this.x,this.y,this.r); 
    const base=up?'rgba(0,255,170,0.95)':'rgba(255,70,85,0.95)'; 
    const mid=up?'rgba(0,180,120,0.9)':'rgba(200,40,60,0.9)'; 
    const dark=up?'rgba(0,100,70,0.85)':'rgba(140,20,35,0.85)'; 
    
    grd.addColorStop(0,base); 
    grd.addColorStop(0.45,mid); 
    grd.addColorStop(1,dark); 
    
    ctx.beginPath(); 
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2); 
    ctx.fillStyle=grd; 
    ctx.fill(); 
    
    ctx.shadowBlur=18; 
    ctx.shadowColor=up?'rgba(0,255,170,0.75)':'rgba(255,70,85,0.75)'; 
    ctx.strokeStyle='white'; 
    ctx.lineWidth=Math.max(2,this.r*0.04); 
    ctx.stroke(); 
    ctx.shadowBlur=0; 
    
    ctx.fillStyle='white'; 
    ctx.font=`${Math.max(10,this.r*0.26)}px Inter, Arial`; 
    ctx.textAlign='center'; 
    ctx.textBaseline='middle'; 
    wrapText(ctx,this.label,this.x,this.y,this.r*1.7,Math.max(10,this.r*0.24)); 
  } 
}

function wrapText(ctx,text,x,y,maxWidth,lineHeight){ 
  const words=text.split(' '); 
  const lines=[]; 
  let line=''; 
  
  words.forEach(w=>{ 
    const test=line? line+' '+w : w; 
    if(ctx.measureText(test).width>maxWidth){ 
      lines.push(line); 
      line=w; 
    } else line=test; 
  }); 
  lines.push(line); 
  
  const h=(lines.length-1)*lineHeight; 
  lines.forEach((ln,i)=> ctx.fillText(ln,x,y-h/2+i*lineHeight)); 
}

function collide(a,b){ 
  const dx=b.x-a.x, dy=b.y-a.y; 
  const dist=Math.hypot(dx,dy); 
  const min=a.r+b.r; 
  
  if(dist<min){ 
    const overlap=(min-dist)+0.5; 
    const ux=dx/(dist||1), uy=dy/(dist||1); 
    a.x-=ux*overlap/2; 
    a.y-=uy*overlap/2; 
    b.x+=ux*overlap/2; 
    b.y+=uy*overlap/2; 
    
    const k=0.85; 
    const tvx=a.vx,tvy=a.vy; 
    a.vx=b.vx*k; 
    a.vy=b.vy*k; 
    b.vx=tvx*k; 
    b.vy=tvy*k; 
  } 
}

function BubbleScene(canvasId, dataset){ 
  const cvs=document.getElementById(canvasId); 
  if(!cvs) return; 
  
  const ctx=cvs.getContext('2d'); 
  let W=cvs.clientWidth, H=cvs.clientHeight; 
  cvs.width=W*2; 
  cvs.height=H*2; 
  ctx.scale(2,2); 
  
  const bubbles=dataset.map(d=> new Bubble(d.t,d.c,d.v)); 
  bubbles.forEach(b=> b.setBounds(W,H)); 
  
  let last=performance.now(); 
  
  function frame(ts){ 
    const dt=Math.min(1.6,(ts-last)/16); 
    last=ts; 
    ctx.clearRect(0,0,W,H); 
    
    bubbles.forEach(b=>{ 
      b.setBounds(W,H); 
      b.step(dt); 
    }); 
    
    for(let i=0;i<bubbles.length;i++) 
      for(let j=i+1;j<bubbles.length;j++) 
        collide(bubbles[i],bubbles[j]); 
        
    bubbles.forEach(b=> b.draw(ctx)); 
    requestAnimationFrame(frame);
  } 
  
  requestAnimationFrame(frame); 
  
  new ResizeObserver(()=>{ 
    W=cvs.clientWidth; 
    H=cvs.clientHeight; 
    cvs.width=W*2; 
    cvs.height=H*2; 
    ctx.setTransform(1,0,0,1,0,0); 
    ctx.scale(2,2); 
    bubbles.forEach(b=> b.setBounds(W,H)); 
  }).observe(cvs); 
}

// Função para criar dados de demonstração quando a API não estiver disponível
function createDemoData(){
  const teams = [
    ['Flamengo', 'Palmeiras'], ['Real Madrid', 'Barcelona'], ['Manchester City', 'Liverpool'],
    ['Bayern Munich', 'Borussia Dortmund'], ['PSG', 'Marseille'], ['Juventus', 'Inter Milan'],
    ['Arsenal', 'Chelsea'], ['Atletico Madrid', 'Valencia'], ['AC Milan', 'Napoli'],
    ['Tottenham', 'Manchester United'], ['Leicester', 'Brighton'], ['Sevilla', 'Real Betis']
  ];
  
  return teams.map(([home, away]) => ({
    t: `${home} vs ${away}\n${Math.floor(Math.random()*24).toString().padStart(2,'0')}:${Math.floor(Math.random()*60).toString().padStart(2,'0')} | O2.5:${(1.5 + Math.random()).toFixed(2)} U2.5:${(1.5 + Math.random()).toFixed(2)}`,
    c: (Math.random() - 0.5) * 100, // bias entre -50 e +50
    v: Math.floor(Math.random() * 10) + 1 // volume entre 1 e 10
  }));
}

async function refreshBubbles(){ 
  try{ 
    $('#last-update').textContent='Atualizando...'; 
    const filter=($('#league-filter')?.value||'').trim(); 
    
    let data;
    try {
      data = await buildBubbles(filter);
    } catch(e) {
      console.warn('API não disponível, usando dados de demonstração:', e);
      data = createDemoData();
    }
    
    $('#last-update').textContent=`Atualizado: ${new Date().toLocaleTimeString('pt-BR',{hour12:false})} — ${data.length} jogos`; 
    BubbleScene('bubble-canvas', data); 
    BubbleScene('bubble-canvas-mini', data.slice(0,18)); 
  } catch(e){ 
    console.error(e); 
    $('#last-update').textContent='Erro ao atualizar.'; 
    toast('Erro ao buscar dados.'); 
  } 
}

$('#btn-refresh')?.addEventListener('click', refreshBubbles);
window.addEventListener('load', refreshBubbles);
