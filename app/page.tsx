export default function Home() {
  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="logo">Bubles AI™</div>
          <nav className="nav">
            <a href="#inicio">Início</a>
            <a href="#programa">Programa</a>
            <a href="#garantia">Garantia</a>
            <a href="#" className="btn-header">Ingressar</a>
          </nav>
        </div>
      </header>

      <main id="inicio" className="container">

        <section className="hero">
          <h1>Programa Executivo</h1>
          <h2>Bubles AI™</h2>
          <p>
            Método estruturado para implementar Inteligência Artificial
            em marketing, vendas e operação com foco em lucro e escala.
          </p>

          <div className="price-old">De R$ 997</div>
          <div className="price-new">Investimento único: R$ 197</div>
          <div className="price-installments">ou 12x no cartão</div>

          <a href="#" className="cta-button">
            🔥 Garantir minha vaga
          </a>
        </section>

        <section id="programa" className="section">
          <h2>Como funciona o programa</h2>
          <p>
            Formação dividida em módulos estratégicos com aplicação prática.
            Você aprende, estrutura e implementa imediatamente.
          </p>
        </section>

        <section className="section">
          <h2>O que você vai dominar</h2>
          <p>
            Estrutura estratégica com IA<br />
            Automação de marketing<br />
            Processos e escala<br />
            Aplicação prática real
          </p>
        </section>

        <section id="garantia" className="section">
          <h2>Garantia</h2>
          <p>
            Você tem 7 dias de garantia total. Se não fizer sentido,
            devolvemos 100% do seu investimento.
          </p>
        </section>

      </main>

      <div className="floating-cta">
        <a href="#">🔥 Garantir vaga por R$ 197</a>
      </div>
    </>
  );
}