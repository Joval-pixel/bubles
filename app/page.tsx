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
            Transforme <span>ChatGPT</span> em uma ferramenta para gerar dinheiro
            e economizar horas todos os dias
          </h1>

          <p className="subtitle">
            Método prático para aplicar Inteligência Artificial no seu negócio,
            aumentar produtividade e criar novas fontes de renda — mesmo começando do zero.
          </p>

          <a href={checkout} className="btn-primary large">
            🚀 Quero acesso imediato
          </a>

          <p className="micro">
            ✔ Acesso vitalício • ✔ Atualizações incluídas • ✔ Garantia 7 dias
          </p>
        </div>
      </section>

      {/* REALIDADE DO MERCADO */}
      <section className="market">
        <div className="container">
          <h2>A Inteligência Artificial já está mudando o mercado</h2>
          <p>
            Empresas estão usando IA para reduzir custos e aumentar lucro.
            Profissionais estão produzindo mais em menos tempo.
            Quem aprende agora sai na frente. Quem ignora, fica para trás.
          </p>
        </div>
      </section>

      {/* O QUE VOCÊ VAI DOMINAR */}
      <section className="benefits">
        <div className="container">
          <h2>O que você vai dominar</h2>

          <div className="grid">
            <div className="card">✔ Criar prompts estratégicos</div>
            <div className="card">✔ Automatizar tarefas repetitivas</div>
            <div className="card">✔ Usar IA para marketing e vendas</div>
            <div className="card">✔ Criar produtos digitais com IA</div>
            <div className="card">✔ Aumentar produtividade e margem</div>
            <div className="card">✔ Aplicação prática imediata</div>
          </div>
        </div>
      </section>

      {/* BÔNUS */}
      <section className="bonus">
        <div className="container">
          <h2>Bônus inclusos</h2>

          <ul>
            <li>📦 Biblioteca de prompts profissionais (R$197)</li>
            <li>📊 Modelos prontos de aplicação (R$197)</li>
            <li>🔄 Atualizações futuras (R$97)</li>
            <li>💬 Suporte direto</li>
          </ul>

          <p className="total">
            Valor total estimado: R$488
          </p>
        </div>
      </section>

      {/* OFERTA */}
      <section className="offer">
        <div className="container">
          <h2>Oferta especial termina em:</h2>

          <p className="timer">{formatTime(timeLeft)}</p>

          <p className="old">De R$ 997</p>
          <p className="new">Por apenas R$ 197</p>

          <a href={checkout} className="btn-primary large">
            🔥 Garantir minha vaga agora
          </a>

          <p className="guarantee">
            🛡 Garantia incondicional de 7 dias.  
            Se não fizer sentido para você, devolvemos 100% do valor.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="container">
          <h2>Perguntas Frequentes</h2>

          <div className="faq-item">
            <strong>Preciso ter experiência?</strong>
            <p>Não. O curso começa do zero e evolui passo a passo.</p>
          </div>

          <div className="faq-item">
            <strong>O acesso é vitalício?</strong>
            <p>Sim, incluindo futuras atualizações.</p>
          </div>

          <div className="faq-item">
            <strong>Funciona para qualquer área?</strong>
            <p>Sim. IA pode ser aplicada em negócios, marketing, serviços e produtividade.</p>
          </div>
        </div>
      </section>

      {/* BOTÃO FIXO */}
      <a href={checkout} className="floating-btn">
        🚀 Comprar agora
      </a>

    </main>
  );
}
