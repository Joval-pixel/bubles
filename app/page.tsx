export default function Home() {
  return (
    <>
      <header className="header">
        <div className="logo">Bubles AI™</div>

        <nav className="nav">
          <a href="#inicio">Início</a>
          <a href="#programa">Programa Executivo</a>
          <a href="#garantia">Garantia</a>
          <a href="#" className="btn-header">Ingressar</a>
        </nav>
      </header>

      <main>

        {/* HERO */}
        <section id="inicio" className="hero">
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

          <a href="#" className="btn-primary">
            🔥 Garantir minha vaga
          </a>

          <div className="anchors">
            <a href="#programa">Como funciona</a>
            <a href="#aprende">O que você aprende</a>
            <a href="#garantia">Garantia</a>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="programa" className="section">
          <h2>Como funciona o programa</h2>
          <p>
            Formação dividida em módulos estratégicos com aplicação prática.
            Você aprende, estrutura e implementa imediatamente no seu negócio.
          </p>
        </section>

        {/* O QUE APRENDE */}
        <section id="aprende" className="section">
          <h2>O que você vai dominar</h2>
          <ul>
            <li>✔ Estrutura estratégica com IA</li>
            <li>✔ Automação de marketing</li>
            <li>✔ Processos e escala</li>
            <li>✔ Aplicação prática real</li>
          </ul>
        </section>

        {/* GARANTIA */}
        <section id="garantia" className="section">
          <h2>Garantia incondicional</h2>
          <p>
            Você tem 7 dias de garantia total. Se não fizer sentido para você,
            devolvemos 100% do investimento.
          </p>
        </section>

      </main>

      {/* BOTÃO FLUTUANTE */}
      <div className="floating-cta">
        <a href="#">🔥 Garantir vaga por R$ 197</a>
      </div>
    </>
  );
}