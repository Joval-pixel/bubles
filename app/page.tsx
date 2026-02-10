"use client";
import { useEffect, useState } from "react";

export default function Curso() {
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <main style={{ background: "#06142b", color: "#fff", fontFamily: "Arial, sans-serif" }}>

      {/* HERO */}
      <section style={{ padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "42px", fontWeight: "bold" }}>
          PARE DE PERDER DINHEIRO POR NÃO SABER USAR <span style={{ color: "#00c2ff" }}>CHATGPT & IA</span>
        </h1>

        <p style={{ fontSize: "20px", marginTop: "20px", opacity: 0.8 }}>
          Aprenda a automatizar tarefas, vender mais e criar renda extra usando Inteligência Artificial.
        </p>

        <a href="https://pay.kiwify.com.br/3veb8Bd"
          style={{
            display: "inline-block",
            marginTop: "30px",
            padding: "18px 40px",
            background: "#00c2ff",
            color: "#000",
            fontWeight: "bold",
            fontSize: "18px",
            borderRadius: "8px",
            textDecoration: "none"
          }}>
          🚀 QUERO ACESSO IMEDIATO
        </a>

        <p style={{ marginTop: "15px", fontSize: "14px", opacity: 0.6 }}>
          ✔ Acesso vitalício • ✔ Atualizações • ✔ Garantia 7 dias
        </p>
      </section>

      {/* MOCKUP */}
      <section style={{ textAlign: "center", padding: "40px 20px" }}>
        <img
          src="https://images.unsplash.com/photo-1581091870627-3c9f3d98c88b"
          alt="Curso Online"
          style={{ maxWidth: "600px", width: "100%", borderRadius: "10px" }}
        />
      </section>

      {/* BENEFÍCIOS */}
      <section style={{ padding: "60px 20px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "30px" }}>🔥 O que você vai dominar</h2>
        <ul style={{ fontSize: "18px", lineHeight: "2", marginTop: "20px" }}>
          <li>✔ Criar prompts profissionais</li>
          <li>✔ Automatizar tarefas</li>
          <li>✔ Usar IA para vender mais</li>
          <li>✔ Criar novas fontes de renda</li>
          <li>✔ Estratégias reais aplicáveis</li>
        </ul>
      </section>

      {/* DEPOIMENTOS */}
      <section style={{ background: "#0b1f3d", padding: "60px 20px" }}>
        <h2 style={{ textAlign: "center", fontSize: "30px" }}>💬 O que estão dizendo</h2>

        <div style={{ maxWidth: "900px", margin: "40px auto", display: "grid", gap: "20px" }}>
          <div style={{ background: "#13294b", padding: "20px", borderRadius: "10px" }}>
            “Comecei do zero e hoje automatizo todo meu atendimento.” – Carlos M.
          </div>
          <div style={{ background: "#13294b", padding: "20px", borderRadius: "10px" }}>
            “Apliquei no meu negócio e aumentei minhas vendas.” – Fernanda R.
          </div>
          <div style={{ background: "#13294b", padding: "20px", borderRadius: "10px" }}>
            “O melhor investimento que fiz em 2026.” – Rafael T.
          </div>
        </div>
      </section>

      {/* OFERTA COM TIMER */}
      <section style={{ padding: "70px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px" }}>🔥 OFERTA ENCERRA EM:</h2>

        <p style={{ fontSize: "28px", marginTop: "15px", color: "#00c2ff" }}>
          {formatTime(timeLeft)}
        </p>

        <p style={{ marginTop: "20px", textDecoration: "line-through", opacity: 0.6 }}>
          De R$ 997
        </p>

        <p style={{ fontSize: "36px", fontWeight: "bold", color: "#00c2ff" }}>
          Por apenas R$ 197
        </p>

        <a href="https://pay.kiwify.com.br/3veb8Bd"
          style={{
            display: "inline-block",
            marginTop: "30px",
            padding: "18px 50px",
            background: "#00c2ff",
            color: "#000",
            fontWeight: "bold",
            fontSize: "20px",
            borderRadius: "8px",
            textDecoration: "none"
          }}>
          🔥 GARANTIR MINHA VAGA AGORA
        </a>

        <p style={{ marginTop: "15px", fontSize: "14px", opacity: 0.7 }}>
          🔒 Garantia incondicional de 7 dias
        </p>
      </section>

      {/* FAQ */}
      <section style={{ background: "#0b1f3d", padding: "60px 20px" }}>
        <h2 style={{ textAlign: "center", fontSize: "30px" }}>❓ Perguntas Frequentes</h2>

        <div style={{ maxWidth: "800px", margin: "40px auto", lineHeight: "2" }}>
          <p><strong>Preciso ter experiência?</strong><br />Não. O curso começa do zero.</p>
          <p><strong>O acesso é vitalício?</strong><br />Sim, você poderá acessar quando quiser.</p>
          <p><strong>Tem garantia?</strong><br />Sim, 7 dias de garantia incondicional.</p>
        </div>
      </section>

      {/* BOTÃO FIXO */}
      <a href="https://pay.kiwify.com.br/3veb8Bd"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#00c2ff",
          color: "#000",
          padding: "15px 25px",
          fontWeight: "bold",
          borderRadius: "50px",
          textDecoration: "none",
          boxShadow: "0 0 15px rgba(0,0,0,0.5)"
        }}>
        🚀 Comprar Agora
      </a>

    </main>
  );
}
