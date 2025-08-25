/*************************************************
: 'Sem assinatura ativa.';
if(location.hash === '#dashboard') guardDashboard();
}
updateSubStatus();


// ====== POSTS ======
function renderPosts(){
const posts = store.posts.sort((a,b)=> b.createdAt - a.createdAt);
const today = todayKey();
const wrapToday = $('#posts-today');
const wrapHist = $('#posts-history');
wrapToday.innerHTML = ''; wrapHist.innerHTML = '';


const todays = posts.filter(p=>p.dateKey===today);
if(todays.length===0){ wrapToday.innerHTML = '<p class="muted">Nenhuma análise publicada hoje.</p>'; }
else { todays.forEach(p=> wrapToday.appendChild(postCard(p))); }


const weekAgo = Date.now() - 7*24*60*60*1000;
posts.filter(p=>p.createdAt>=weekAgo).forEach(p=> wrapHist.appendChild(postCard(p)) );
}


function postCard(p){
const div = document.createElement('div');
div.className = 'post';
div.innerHTML = `
<div class="post-head">
<strong>${p.jogo}</strong> · <span>${p.comp}</span>
<span class="muted">— ${p.dh}</span>
</div>
<div class="post-body">
<ul>
<li><b>Desempenho Recente:</b> ${p.rec||'-'}</li>
<li><b>H2H:</b> ${p.h2h||'-'}</li>
<li><b>Ofensivo/Defensivo:</b> ${p.stats||'-'}</li>
<li><b>Situação da Equipe:</b> ${p.sit||'-'}</li>
</ul>
<div class="recos">
${p.op1? `<div class="reco"><b>Opção 1:</b> ${p.op1}<br><span class="muted">${p.j1||''}</span></div>`:''}
${p.op2? `<div class="reco"><b>Opção 2:</b> ${p.op2}<br><span class="muted">${p.j2||''}</span></div>`:''}
</div>
</div>`;
return div;
}


$('#form-post')?.addEventListener('submit', (e)=>{
e.preventDefault();
if(store.session !== ADMIN_EMAIL){ return toast('Apenas o admin pode publicar.'); }
const post = {
id: crypto.randomUUID(),
jogo: $('#p-jogo').value.trim(),
comp: $('#p-comp').value.trim(),
dh: $('#p-dh').value.trim(),
rec: $('#p-rec').value.trim(),
h2h: $('#p-h2h').value.trim(),
stats: $('#p-stats').value.trim(),
sit: $('#p-sit').value.trim(),
op1: $('#p-op1').value.trim(),
j1: $('#p-j1').value.trim(),
op2: $('#p-op2').value.trim(),
j2: $('#p-j2').value.trim(),
createdAt: Date.now(),
dateKey: todayKey(),
};
if(!post.jogo || !post.comp || !post.dh) return toast('Preencha Jogo, Competição e Data/Hora.');
const posts = store.posts; posts.push(post); store.posts = posts;
toast('Análise publicada!'); renderPosts(); $('#form-post').reset();
});


// copiar prompts
$$('[data-copy]').forEach(btn=> btn.addEventListener('click', ()=>{ const sel = btn.getAttribute('data-copy'); const el = $(sel); el.select(); document.execCommand('copy'); toast('Copiado!'); }));


// print
$('#btn-print')?.addEventListener('click', ()=> window.print());


// render quando abrir dashboard
if(location.hash === '#dashboard') renderPosts();
window.addEventListener('hashchange', ()=>{ if(location.hash==='#dashboard') renderPosts(); });
