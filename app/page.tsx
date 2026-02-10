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

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <main className="sales">

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <h1>
            DOMINE O <span>CHATGPT</span> E A <span>INTELIGÊNCIA ARTIFICIAL</span>
            <br /> E TRANSFORME TEMPO EM DINHEIRO
          </h1>

          <p className="subtitle">
            Aprenda IA do zero ao avançado e comece a gerar resultados reais.
          </p>

          <a href="https://pay.kiwify.com.br/3veb8Bd" target="_blank" className="cta">
            🚀 QUERO ACESSO IMEDIATO
          </a>
        </div>
      </section>

      {/* VÍDEO */}
      <section className="video">
        <div className="container">
          <h2>Assista e entenda tudo em 2 minutos</h2>
          <div className="video-box">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Video"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="content">
        <div className="container">
          <h2>O que você vai dominar</h2>
          <div className="grid">
            <div className="card">✔ Criar prompts profissionais</div>
            <div className="card">✔ Automatizar tarefas</div>
            <div className="card">✔ Usar IA para vender mais</div>
            <div className="card">✔ Criar renda extra</div>
            <div className="card">✔ Ferramentas práticas</div>
            <div className="card">✔ Estratégias reais</div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="testimonials">
        <div className="container">
          <h2>Resultados de alunos</h2>
          <div className="grid">
            <div className="card">💬 “Consegui automatizar meu negócio em 1 semana.”</div>
            <div className="card">💬 “Já paguei o curso no primeiro mês.”</div>
            <div className="card">💬 “Hoje uso IA todos os dias no trabalho.”</div>
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section className="offer">
        <div className="container">
          <h2>OFERTA ENCERRA EM:</h2>
          <p className="timer">
            {hours}h {minutes}m {seconds}s
          </p>

          <p className="old">De R$ 997</p>
          <p className="new">Por apenas R$ 197</p>

          <a href="https://pay.kiwify.com.br/3veb8Bd" target="_blank" className="cta large">
            🔥 GARANTIR MINHA VAGA
          </a>

          <p className="guarantee">
            🔒 Garantia incondicional de 7 dias
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="container">
          <h2>Perguntas Frequentes</h2>
          <div className="faq-item">
            <strong>Preciso saber tecnologia?</strong>
            <p>Não. O curso é para iniciantes.</p>
          </div>
          <div className="faq-item">
            <strong>Por quanto tempo tenho acesso?</strong>
            <p>Acesso vitalício + atualizações.</p>
          </div>
          <div className="faq-item">
            <strong>Tem garantia?</strong>
            <p>Sim, 7 dias para testar sem risco.</p>
          </div>
        </div>
      </section>

      {/* BOTÃO FIXO */}
      <a href="https://pay.kiwify.com.br/3veb8Bd" target="_blank" className="floating">
        🔥 Comprar Agora
      </a>

    </main>
  );
}
