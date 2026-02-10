"use client";
import { useEffect, useState } from "react";

export default function Curso() {
  const [timeLeft, setTimeLeft] = useState(5400);
  const [online, setOnline] = useState(127);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setOnline((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
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
          <div className="alert">
            🔴 {online} pessoas estão vendo essa oferta agora
          </div>

          <h1>
            PARE DE PERDER DINHEIRO POR NÃO SABER USAR
            <span> CHATGPT & IA </span>
          </h1>

          <p className="subtitle">
            Em poucas semanas você pode automatizar tarefas, vender mais e criar renda extra usando Inteligência Artificial.
          </p>

          <a href="https://pay.kiwify.com.br/3veb8Bd" target="_blank" className="cta">
            🚀 QUERO ACESSO IMEDIATO
          </a>

          <p className="micro">
            ✔ Acesso vitalício • ✔ Atualizações incluídas • ✔ Garantia 7 dias
          </p>
        </div>
      </section>

      {/* BLOCO DOR */}
      <section className="pain">
        <div className="container">
          <h2>Quanto você já deixou de ganhar por não usar IA?</h2>
          <p>
            Empresas estão economizando horas por dia com automação.
            Profissionais estão produzindo 3x mais.
            Enquanto isso, quem não sabe usar IA está ficando para trás.
          </p>
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

      {/* SIMULADOR */}
      <section className="simulator">
        <div className="container">
          <h2>Simule seu ganho mensal com IA</h2>
          <p className="sim-value">
            Se você economizar apenas 2h por dia, isso pode gerar +R$ 1.500/mês.
          </p>
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
            🔥 GARANTIR MINHA VAGA AGORA
          </a>

          <p className="guarantee">
            🔒 Garantia incondicional de 7 dias
          </p>
        </div>
      </section>

      {/* BOTÃO FIXO */}
      <a href="https://pay.kiwify.com.br/3veb8Bd" target="_blank" className="floating">
        🔥 Comprar Agora
      </a>

    </main>
  );
}
