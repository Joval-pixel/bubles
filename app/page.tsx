"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowCTA(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="logo">Bubles AI™</div>

        <nav className="nav">
          <a href="#inicio">Início</a>
          <a href="#programa">Programa Executivo</a>
          <a href="#garantia">Garantia</a>
          <Link href="/login" className="btn-header">
            Ingressar
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero" id="inicio">
        <h1>
          Programa Executivo <br />
          <span>Bubles AI™</span>
        </h1>

        <p>
          Método estruturado para implementar Inteligência Artificial em
          marketing, vendas e operação com foco em lucro e escala.
        </p>

        <div className="price-old">De R$ 997</div>
        <div className="price-new">Investimento único: R$ 197</div>
        <div className="installments">ou 12x no cartão</div>

        <a href="#garantia" className="btn-primary">
          🔥 Garantir minha vaga
        </a>
      </section>

      {/* COMO FUNCIONA */}
      <section className="section" id="programa">
        <h2>Como funciona o programa</h2>
        <p>
          Formação dividida em módulos estratégicos com aplicação prática.
          Você aprende, estrutura e implementa imediatamente.
        </p>
      </section>

      {/* O QUE VOCÊ VAI DOMINAR */}
      <section className="section">
        <h2>O que você vai dominar</h2>
        <ul>
          <li>✔ Estrutura estratégica com IA</li>
          <li>✔ Automação de marketing</li>
          <li>✔ Processos e escala</li>
          <li>✔ Aplicação prática real</li>
        </ul>
      </section>

      {/* GARANTIA */}
      <section className="section" id="garantia">
        <h2>Garantia incondicional</h2>
        <p>
          Você tem 7 dias de garantia total. Se não fizer sentido para você,
          devolvemos 100% do investimento.
        </p>
      </section>

      {/* BOTÃO FLUTUANTE */}
      {showCTA && (
        <div className="floating-cta">
          <a href="#garantia">
            🔥 Garantir vaga por R$ 197
          </a>
        </div>
      )}
    </>
  );
}