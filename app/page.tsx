export default function Home() {
  return (
    <main>

      {/* HERO */}
      <section className="hero-executivo">
        <div className="container">
          <span className="badge">Centro Executivo de Formação</span>

          <h1>
            Aplicação Estratégica de Inteligência Artificial
            <br />
            para negócios e alta performance
          </h1>

          <p>
            Estrutura, método e implementação prática de IA
            para marketing, vendas e operação.
          </p>

          <a href="/curso" className="btn-primary">
            Conhecer Programa Executivo
          </a>
        </div>
      </section>

      {/* SOBRE */}
      <section className="section-light">
        <div className="container">
          <h2>Sobre a Bubles AI</h2>

          <p>
            A Bubles AI é um centro de formação focado na aplicação estruturada
            de Inteligência Artificial em ambientes reais de negócio.
          </p>

          <p>
            Não se trata de teoria técnica. Trata-se de método, organização
            e execução estratégica.
          </p>
        </div>
      </section>

      {/* MÉTODO */}
      <section className="section-dark">
        <div className="container">
          <h2>Método Bubles AI™</h2>

          <div className="grid-3">
            <div className="card">
              <h3>Estrutura</h3>
              <p>Organização clara de processos e aplicação estratégica.</p>
            </div>

            <div className="card">
              <h3>Aplicação</h3>
              <p>Implementação prática em marketing, vendas e operação.</p>
            </div>

            <div className="card">
              <h3>Escala</h3>
              <p>Automação e ganho de produtividade com inteligência.</p>
            </div>
          </div>
        </div>
      </section>

      {/* APLICAÇÕES */}
      <section className="section-light">
        <div className="container">
          <h2>Aplicações Estratégicas</h2>

          <ul className="lista-aplicacoes">
            <li>Automação de atendimento</li>
            <li>Criação de ofertas e funis</li>
            <li>Produção de conteúdo estratégico</li>
            <li>Otimização de processos internos</li>
            <li>Estruturação de operações digitais</li>
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="container">
          <h2>Programa Executivo Bubles AI</h2>
          <p>Formação estruturada para aplicação imediata.</p>

          <a href="/curso" className="btn-primary">
            Acessar Programa Executivo
          </a>
        </div>
      </section>

    </main>
  );
}