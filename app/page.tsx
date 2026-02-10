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

  const checkout = "https://pay.kiwify.com.br/3veb8Bd";

  return (
    <main style={{ background: "#0b1220", color: "#fff", fontFamily: "Arial, sans-serif" }}>

      {/* HEADLINE */}
      <section style={{ padding: "70px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "38px", fontWeight: "bold" }}>
          DESCUBRA COMO USAR <span style={{ color: "#00c2ff" }}>CHATGPT & IA</span>
          <br />
          PARA CRIAR RENDA E AUTOMATIZAR SUA VIDA
        </h1>

        <p style={{ marginTop: "20px", fontSize: "18px", opacity: 0.8 }}>
          Mesmo que você esteja começando do zero.
        </p>
      </section>

      {/* VSL */}
      <section style={{ padding: "20px", textAlign: "center" }}>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#000",
          borderRadius: "10px",
          overflow: "hidden"
        }}>
          <iframe
            width="100%"
            height="450"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="VSL"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>

        <a href={checkout}
          style={{
            display: "inline-block",
            marginTop: "30px",
            padding: "18px 50px",
            background: "#00c2ff",
            color: "#000",
            fontWeight: "bold",
            fontSize: "18px",
            borderRadius: "8px",
            textDecoration: "none"
          }}>
          🚀 QUERO ACESSO IMEDIATO
        </a>
      </section>

      {/* DOR */}
      <section style={{ padding: "70px 20px", background: "#111827" }}>
        <h2 style={{ textAlign: "center", fontSize: "30px" }}>
          Quanto dinheiro você já deixou na mesa por não usar IA?
        </h2>

        <p style={{ textAlign: "center", maxWidth: "800px", margin: "30px auto", fontSize: "18px", opacity: 0.8 }}>
          Empresas estão economizando horas todos os dias.  
          Profissionais estão produzindo 3x mais.  
          Enquanto isso, quem não domina IA está ficando para trás.
        </p>
      </section>

      {/* O QUE VOCÊ RECEBE */}
      <section style={{ padding: "70px 20px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "30px" }}>📦 O que você recebe</h2>

        <ul style={{ fontSize: "18px", lineHeight: "2", marginTop: "20px" }}>
          <li>✔ Curso completo do zero ao avançado</li>
          <li>✔ Biblioteca de prompts profissionais</li>
          <li>✔ Estratégias para vender usando IA</li>
          <li>✔ Modelos prontos para aplicar</li>
          <li>✔ Atualizações futuras incluídas</li>
        </ul>
      </section>

      {/* PARA QUEM É */}
      <section style={{ padding: "70px 20px", background: "#111827" }}>
        <h2 style={{ textAlign: "center", fontSize: "30px" }}>🎯 Para quem é esse curso?</h2>

        <ul style={{ maxWidth: "800px", margin: "30px auto", lineHeight: "2", fontSize: "18px" }}>
          <li>✔ Empreendedores</li>
          <li>✔ Profissionais liberais</li>
          <li>✔ Criadores de conteúdo</li>
          <li>✔ Quem quer renda extra</li>
          <li>✔ Quem quer sair na frente no mercado</li>
        </ul>
      </section>

      {/* PROVA SOCIAL */}
      <section style={{ padding: "70px 20px" }}>
        <h2 style={{ textAlign: "center", fontSize: "30px" }}>💬 Depoimentos</h2>

        <div style={{ maxWidth: "900px", margin: "40px auto", display: "grid", gap: "20px" }}>
          <div style={{ background: "#1f2937", padding: "20px", borderRadius: "10px" }}>
            “Comecei do zero e hoje uso IA para automatizar meu negócio.”
          </div>
          <div style={{ background: "#1f2937", padding: "20px", borderRadius: "10px" }}>
            “Já recuperei o valor investido em poucas semanas.”
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section style={{ padding: "80px 20px", textAlign: "center", background: "#0f172a" }}>
        <h2 style={{ fontSize: "32px" }}>🔥 Oferta especial termina em:</h2>

        <p style={{ fontSize: "28px", color: "#00c2ff", marginTop: "15px" }}>
          {formatTime(timeLeft)}
        </p>

        <p style={{ marginTop: "20px", textDecoration: "line-through", opacity: 0.6 }}>
          De R$ 997
        </p>

        <p style={{ fontSize: "36px", fontWeight: "bold", color: "#00c2ff" }}>
          Por apenas R$ 197
        </p>

        <a href={checkout}
          style={{
            display: "inline-block",
            marginTop: "30px",
            padding: "20px 60px",
            background: "#00c2ff",
            color: "#000",
            fontWeight: "bold",
            fontSize: "20px",
            borderRadius: "8px",
            textDecoration: "none"
          }}>
          🔥 GARANTIR MINHA VAGA AGORA
        </a>

        <p style={{ marginTop: "20px", fontSize: "14px", opacity: 0.7 }}>
          🛡️ Garantia incondicional de 7 dias
        </p>
      </section>

    </main>
  );
}
