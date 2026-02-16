export default function Home() {
  return (
    <>
      <section id="inicio" className="hero">
        <h1>
          Programa Executivo <br />
          <span>Bubles AI™</span>
        </h1>

        <p>
          Método estruturado para implementar Inteligência Artificial em
          marketing, vendas e operação com foco em lucro e escala.
        </p>

        <p className="old-price">De R$ 997</p>
        <p className="new-price">Investimento único: R$ 197</p>
        <p className="installments">ou 12x no cartão</p>

        <a id="comprar" href="#" className="btn-primary">
          🔥 Garantir minha vaga
        </a>
      </section>

      <section id="programa" className="section">
        <h2>Como funciona o programa</h2>
        <p>
          Formação dividida em módulos estratégicos com aplicação prática.
          Você aprende, estrutura e implementa imediatamente.
        </p>

        <h3>O que você vai dominar</h3>
        <ul>
          <li>✔ Estrutura estratégica com IA</li>
          <li>✔ Automação de marketing</li>
          <li>✔ Processos e escala</li>
          <li>✔ Aplicação prática real</li>
        </ul>
      </section>

      <section id="garantia" className="section">
        <h2>Garantia</h2>
        <p>
          Você tem 7 dias de garantia total. Se não fizer sentido para seu
          negócio, devolvemos 100% do investimento.
        </p>
      </section>

      <div className="floating-cta">
        <a href="#">🔥 Garantir vaga por R$ 197</a>
      </div>
    </>
  );
}