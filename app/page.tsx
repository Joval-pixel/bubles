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
            e aumentar sua produtividade
          </h1>

          <p className="subtitle">
            Método estruturado para aplicar Inteligência Artificial no seu negócio
            ou renda extra — mesmo começando do zero.
          </p>

          <a href={checkout} className="btn-primary large">
            🚀 Quero acesso imediato
          </a>

          <p className="micro">
            ✔ Acesso vitalício • ✔ Atualizações incluídas • ✔ Garantia 7 dias
          </p>
        </div>
      </section>

      {/* MERCADO */}
      <section className="market">
        <div className="container">
          <h2>A Inteligência Artificial já está redefinindo o mercado</h2>
          <p>
            Empresas estão usando IA para reduzir custos e aumentar lucro.
            Profissionais estão produzindo mais em menos tempo.
            Quem aprende agora sai na frente.
          </p>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="benefits">
        <div className="container">
          <h2>O que você vai dominar</h2>

          <div className="grid">
            <div className="card">✔ Criar prompts estratégicos</div>
            <div className="card">✔ Automatizar tarefas repetitivas</div>
            <div className="card">✔ Aplicar IA em marketing e vendas</div>
            <div className="card">✔ Criar produtos digitais com IA</div>
            <div className="card">✔ Aumentar produtividade e margem</div>
            <div className="card">✔ Implementação prática imediata</div>
          </div>
        </div>
      </section>

      {/* INSTITUCIONAL */}
      <section className="brand">
        <div className="container">
          <h2>Sobre a Bubles IA</h2>

          <div className="brand-box">
            <p>
              A Bubles IA é uma iniciativa educacional focada na aplicação prática
              da Inteligência Artificial em negócios, produtividade e geração de renda.
            </p>

            <p>
              Nosso objetivo é simplificar o uso de ferramentas como ChatGPT
              e torná-las acessíveis para profissionais e empreendedores.
            </p>

            <p>
              Desenvolvemos métodos estruturados com foco em clareza,
              eficiência e aplicação real.
            </p>
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

          <p className="total">Valor total estimado: R$488</p>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="social-proof">
        <div className="container">
          <h2>Aplicações práticas</h2>

          <div className="grid">
            <div className="card">✔ Automatização de atendimento</div>
            <div className="card">✔ Estruturação de ofertas</div>
            <div className="card">✔ Criação de conteúdo estratégico</div>
            <div className="card">✔ Otimização de processos internos</div>
          </div>
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
            <p>Não. O curso começa do zero.</p>
          </div>

          <div className="faq-item">
            <strong>O acesso é vitalício?</strong>
            <p>Sim, incluindo futuras atualizações.</p>
          </div>

          <div className="faq-item">
            <strong>Funciona para qualquer área?</strong>
            <p>Sim. IA pode ser aplicada em diversos contextos profissionais.</p>
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
