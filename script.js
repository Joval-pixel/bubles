// Lista de ativos para tabela (pode mudar)
const tickers = ["VALE3", "PETR4", "ITUB4", "BBDC4", "BBAS3"];

async function mockPrices() {
  return tickers.map(t => ({
    ativo: t,
    ultimo: (Math.random()*50+10).toFixed(2),
    variacao: (Math.random()*4-2).toFixed(2)
  }));
}

async function updateTable() {
  const rows = await mockPrices();
  const tbody = document.getElementById("b3body");
  tbody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    const color = r.variacao >= 0 ? "#00e676" : "#ff1744";
    tr.innerHTML = `
      <td>${r.ativo}</td>
      <td>${r.ultimo}</td>
      <td style="color:${color};">${r.variacao}%</td>
    `;
    tbody.appendChild(tr);
  });
}

// Atualiza a tabela a cada 5 segundos
updateTable();
setInterval(updateTable, 5000);
