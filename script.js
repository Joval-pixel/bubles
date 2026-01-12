const statusDiv = document.getElementById("status");
const priceDiv = document.getElementById("price");

// WebSocket da Binance 
const socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

socket.onopen = () => {
  statusDiv.innerText = "Conectado ⚡ (Binance)";
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.p) {
    const price = Number(data.p);
    priceDiv.innerText = `$ ${price.toLocaleString("en-US")}`;
  }
};

socket.onclose = () => {
  statusDiv.innerText = "Desconectado ❌";
};

socket.onerror = (e) => {
  statusDiv.innerText = "Erro no socket";
  console.error(e);
};
