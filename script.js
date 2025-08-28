async function loadData() {
  try {
    const res = await fetch('/api/footy');
    const data = await res.json();
    document.getElementById('app').innerText = JSON.stringify(data, null, 2);
  } catch (e) {
    document.getElementById('app').innerText = 'Erro carregando dados';
  }
}
loadData();