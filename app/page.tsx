export default function Home() {
  return (
    <>
      <header className="header">
        <div className="container nav">
          <div className="logo">Bubles AI™</div>

          <div className="menu">
            <a href="#como">Início</a>
            <a href="#conteudo">Programa</a>
            <a href="#" className="btn-login">Ingressar</a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container">
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

          <div className="hero-links">
            <a href="#como">Como funciona</a>
            <a href="#conteudo">O que você aprende</a>
          </div>
        </div>
      </section>

      <section id="como" className="section">
        <div className="container">
          <h2>Como funciona o programa</h2>
          <p>
            Formação dividida em módulos estratégicos com aplicação prática.
            Você aprende, estrutura e implementa imediatamente.
          </p>
        </div>
      </section>

      <section id="conteudo" className="section">
        <div className="container">
          <h2>O que você vai dominar</h2>
          <p>✔ Estrutura estratégica com IA</p>
          <p>✔ Automação de marketing</p>
          <p>✔ Processos e escala</p>
        </div>
      </section>

      <a href="#" className="floating-btn">
        🔥 Garantir vaga por R$ 197
      </a>
    </>
  );
}