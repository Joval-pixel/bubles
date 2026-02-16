"use client"
import { useEffect, useState } from "react"

export default function Home() {
  const [showFixed, setShowFixed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowFixed(true)
      } else {
        setShowFixed(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="page">
      <section className="hero">
        <h1>
          Programa Executivo
          <br />
          <span>Bubles AI™</span>
        </h1>

        <p className="subtitle">
          Método estruturado para implementar Inteligência Artificial em marketing,
          vendas e operação com foco em lucro e escala.
        </p>

        <p className="old-price">De R$ 997</p>

        <p className="price">
          Investimento único: <strong>R$ 197</strong>
        </p>

        <p className="installments">ou 12x no cartão</p>

        <a href="#comprar" className="cta-main">
          🔥 Garantir minha vaga
        </a>
      </section>

      <section className="content">
        <h2>Como funciona o programa</h2>
        <p>
          Formação dividida em módulos estratégicos com aplicação prática.
          Você aprende, estrutura e implementa imediatamente.
        </p>

        <h2>O que você vai dominar</h2>
        <ul>
          <li>✔ Estrutura estratégica com IA</li>
          <li>✔ Automação de marketing</li>
          <li>✔ Processos e escala</li>
          <li>✔ Aplicação prática real</li>
        </ul>

        <h2>Garantia incondicional</h2>
        <p>
          Você tem 7 dias de garantia total. Se não fizer sentido,
          devolvemos 100% do investimento.
        </p>
      </section>

      {showFixed && (
        <a href="#comprar" className="cta-fixed">
          🔥 Garantir vaga por R$ 197
        </a>
      )}
    </main>
  )
}