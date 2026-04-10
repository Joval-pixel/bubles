<script>

function gerarJogosFake(){

  return [
    {nome:"Flamengo x Palmeiras", liga:"Brasil", min:63},
    {nome:"Real Madrid x Barcelona", liga:"La Liga", min:55},
    {nome:"City x Liverpool", liga:"Premier League", min:70},
    {nome:"PSG x Bayern", liga:"Champions", min:48}
  ];
}

function gerarStats(){
  return {
    ataques: Math.floor(Math.random()*50),
    chutes: Math.floor(Math.random()*10),
    escanteios: Math.floor(Math.random()*10),
    posse: Math.floor(Math.random()*100)
  }
}

function score(s,min){
  let sc = s.ataques*0.9 + s.chutes*6 + s.escanteios*2 + s.posse*0.2;
  if(min>15 && min<75) sc+=10;
  return Math.min(100,Math.floor(sc));
}

function sinal(s,sc){
  if(sc>75 && s.chutes>=5 && s.ataques>20)
    return {txt:"🔥 ENTRAR", cor:"verde"};

  if(sc>60)
    return {txt:"👀 OBSERVAR", cor:"amarelo"};

  return {txt:"⏳ AGUARDAR", cor:"vermelho"};
}

function render(){

  let jogos = gerarJogosFake();

  let lista = jogos.map(j=>{

    let st = gerarStats();
    let sc = score(st,j.min);
    let sn = sinal(st,sc);

    return {...j, stats:st, score:sc, sinal:sn}
  });

  lista.sort((a,b)=>b.score-a.score);

  let div = document.getElementById("jogos");
  div.innerHTML="";

  lista.forEach((j,i)=>{

    div.innerHTML += `
    <div class="card ${i==0?"top":""}">
      <div class="jogo">${j.nome}</div>
      <div class="info">${j.liga} • ${j.min}'</div>

      <div class="score">Score: ${j.score}</div>

      <div class="barra">
        <span style="width:${j.score}%"></span>
      </div>

      <div class="info">
        ⚡ ${j.stats.ataques} | 🎯 ${j.stats.chutes} | 🚩 ${j.stats.escanteios}
      </div>

      <div class="sinal ${j.sinal.cor=='verde'?'entrar':''}">
        ${j.sinal.txt}
      </div>
    </div>`;
  });
}

setInterval(render,5000);
render();

</script>
