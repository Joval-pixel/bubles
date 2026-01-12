const statusDiv = document.getElementById("status");
const priceDiv = document.getElementById("price");

// TradingView WebSocket
// Usa datafeed oficial da TV (pontos WS conhecidos)
const socket = new WebSocket("wss://data.tradingview.com/socket.io/websocket", {
  headers: {
    origin: "https://www.tradingview.com"
  }
});

let session = "qs_" + Math.random().toString(36).substring(2, 12);

function send(o) {
  socket.send(JSON.stringify(o));
}

socket.onopen = () => {
  statusDiv.innerText = "Conectado ⚡";

  // Inicia sessão
  send({ session_id: session });

  // Cria stream
  send({
    session: session,
    symbol: "BINANCE:BTCUSDT",
    command: "quote_add_symbols",
    params: {
      symbols: [
        {
          name: "BINANCE:BTCUSDT",
          is_futures: false
        }
      ]
    }
  });

  // Liga canal realtime
  send({
    session: session,
    command: "quote_fast_symbols",
    params: {
      symbols: ["BINANCE:BTCUSDT"]
    }
  });
};

socket.onmessage = (e) => {
  try {
    const m = JSON.parse(e.data);

    if (!m || !m.data) return;

    m.data.forEach(row => {
      if (row.lp) {
        priceDiv.innerText = `$ ${row.lp.toLocaleString("en-US")}`;
      }
    });
  } catch (_) {}
};

socket.onclose = () => {
  statusDiv.innerText = "Desconectado";
};

socket.onerror = (e) => {
  statusDiv.innerText = "Erro na conexão";
  console.error(e);
};
