import { useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao criar checkout");
      }
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff", padding: 40 }}>
      
      <h1 style={{ fontSize: 40 }}>🎯 BET BUBBLES</h1>

      <p style={{ opacity: 0.7 }}>
        Radar de apostas com valor (EV+)
      </p>

      <div style={{ marginTop: 30 }}>
        <h2>🔥 Premium</h2>

        <p>
          Acesse sinais exclusivos + alertas automáticos
        </p>

        <button
          onClick={handleCheckout}
          style={{
            marginTop: 20,
            padding: "15px 30px",
            fontSize: 18,
            background: "#00ff88",
            color: "#000",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          {loading ? "Carregando..." : "Assinar Premium 🚀"}
        </button>
      </div>

    </div>
  );
}
