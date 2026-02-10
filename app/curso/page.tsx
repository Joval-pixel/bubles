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
    <main className="sales">

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <h1>
            Domine <span>ChatGPT & IA</span> e transforme conhecimento em renda
          </h1>

          <p className="subtitle">
            Método prático para automatizar tarefas, vender mais e criar renda extra usando Inteligência Artificial.
          </p>

          <a href={checkout} className="btn-primary">
            🚀 Quero acesso imediato
          </a>

          <p className="micro">
            ✔ Acesso vitalício • ✔ Atualizações incluídas • ✔ Garantia 7 dias
          </p>
        </div>
      </section>

      {/* VSL */}
      <section className="vsl">
        <div className="container">
          <div className="video-box">
            <iframe
              width="100%"
              height="450"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="VSL"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="benefits">
        <div className="container">
          <h2>O que você vai dominar</h2>

          <div className="grid">
            <div className="card">✔ Criar prompts profissionais</div>
            <div className="card">✔ Automatizar tarefas</div>
            <div className="card">✔ Usar IA para vender mais</div>
            <div className="card">✔ Criar novas fontes de renda</div>
            <div className="card">✔ Aplicação prática imediata</div>
            <div className="card">✔ Estratégias reais</div>
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="testimonials">
        <div className="container">
          <h2>Resultados de alunos</h2>

          <div className="grid">
            <div className="card">
              “Comecei do zero e hoje uso IA todos os dias no meu negócio.”
            </div>
            <div className="card">
              “Já paguei o curso no primeiro mês.”
            </div>
            <div className="card">
              “Automatizei meu atendimento e ganhei tempo.”
            </div>
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section className="offer">
        <div className="container">
          <h2>🔥 Oferta especial termina em:</h2>

          <p className="timer">{formatTime(timeLeft)}</p>

          <p className="old">De R$ 997</p>
          <p className="new">Por apenas R$ 197</p>

          <a href={checkout} className="btn-primary large">
            🔥 Garantir minha vaga agora
          </a>

          <p className="guarantee">
            🛡 Garantia incondicional de 7 dias
          </p>
        </div>
      </section>

      {/* BOTÃO FIXO */}
      <a href={checkout} className="floating-btn">
        🚀 Comprar agora
      </a>

    </main>
  );
}
