export default function Home() {
  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="container nav">
          <div className="logo">Bubles AI™</div>

          <nav className="menu">
            <a href="#">Início</a>
            <a href="#como">Programa Executivo</a>
            <a href="#garantia">Garantia</a>
          </nav>

          <a href="#garantia" className="btn-small">
            Ingressar
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <h1>
            Programa Executivo <br />
            <span>Bubles AI™</span>
          </h1>

          <p className="subtitle">
            Método estruturado para implementar Inteligência Artificial em
            marketing, vendas e operação com foco em lucro e escala.
          </p>

          <p className="old-price">De R$ 997</p>

          <p className="price">Investimento único: R$ 197</p>

          <p className="installments">ou 12x no cartão</p>

          <a href="#garantia" className="btn-primary">
            🔥 Garantir minha vaga
          </a>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="section">
        <div className="container">
          <h2>Como funciona o programa</h2>
          <p>
            Formação dividida em módulos estratégicos com aplicação prática.
            Você aprende, estrutura e implementa imediatamente.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section id="conteudo" className="section darker">
        <div className="container">
          <h2>O que você vai dominar</h2>

          <ul className="list">
            <li>✔ Estrutura estratégica com IA</li>
            <li>✔ Automação de marketing</li>
            <li>✔ Processos e escala</li>
            <li>✔ Aplicação prática real</li>
          </ul>
        </div>
      </section>

      {/* GARANTIA */}
      <section id="garantia" className="section">
        <div className="container">
          <h2>Garantia incondicional</h2>
          <p>
            Você tem 7 dias de garantia total. Se não fizer sentido para você,
            devolvemos 100% do investimento.
          </p>
        </div>
      </section>

      {/* BOTÃO FIXO INFERIOR */}
      <a href="#garantia" className="floating-btn">
        🔥 Garantir vaga por R$ 197
      </a>
    </>
  );
}