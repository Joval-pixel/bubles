export default function CursoPage() {
  return (
    <main>

      {/* HERO */}
      <section className="hero">
        <div className="container">

          <h1>
            Programa Executivo <br />
            <span>Bubles AI™</span>
          </h1>

          <p className="subtitle">
            Método estruturado para implementar Inteligência Artificial
            em marketing, vendas e operação com foco em lucro e escala.
          </p>

          <div className="price-box">
            <p className="old-price">De R$ 997</p>
            <p className="new-price">Investimento único: R$ 197</p>
            <p className="installments">ou 12x no cartão</p>
          </div>

          <a
            href="https://pay.kiwify.com.br/dup2Pxz"
            className="btn-primary"
          >
            🔥 Garantir minha vaga
          </a>

          <div className="hero-links">
            <a href="#como-funciona" className="btn-secondary">
              Como funciona
            </a>
            <a href="#conteudo" className="btn-secondary">
              O que você aprende
            </a>
            <a href="#garantia" className="btn-secondary">
              Garantia
            </a>
          </div>

        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="section">
        <div className="container">
          <h2>Como funciona o programa</h2>
          <p>
            Formação dividida em módulos estratégicos com aplicação prática.
            Você aprende, estrutura e implementa imediatamente.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section id="conteudo" className="section dark">
        <div className="container">
          <h2>O que você vai dominar</h2>

          <div className="cards">
            <div className="card">Estrutura estratégica com IA</div>
            <div className="card">Automação de marketing</div>
            <div className="card">Processos e escala</div>
            <div className="card">Aplicação prática real</div>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section id="garantia" className="section">
        <div className="container">
          <h2>Garantia incondicional</h2>
          <p>
            Você tem 7 dias de garantia total.
            Se não fizer sentido para você,
            devolvemos 100% do valor.
          </p>
        </div>
      </section>

      {/* BOTÃO FLUTUANTE */}
      <a
        href="https://pay.kiwify.com.br/dup2Pxz"
        className="floating-cta"
      >
        🔥 Garantir vaga por R$ 197
      </a>

    </main>
  );
}