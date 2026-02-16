export default function Home() {
  return (
    <main>

      {/* HERO EXECUTIVO */}
      <section className="hero">
        <div className="container">

          <p className="tag">Centro Executivo de Formação</p>

          <h1>
            Programa Executivo<br />
            <span>Bubles AI™</span>
          </h1>

          <p className="subtitle">
            Formação estruturada para aplicação estratégica de Inteligência Artificial
            em marketing, vendas e operação.
          </p>

          <p className="positioning">
            Não é sobre usar IA.  
            É sobre estruturar vantagem competitiva.
          </p>

          <p className="old-price">De R$ 997</p>

          <p className="highlight-price">
            Investimento executivo: R$ 197
          </p>

          <p className="installments">ou 12x no cartão</p>

          <a
            href="https://pay.kiwify.com.br/dup2Pxz"
            className="btn-primary"
          >
            Garantir participação
          </a>

          <p className="trust-line">
            ✔ Acesso vitalício <br />
            ✔ Atualizações estratégicas incluídas <br />
            ✔ Garantia incondicional de 7 dias
          </p>

        </div>
      </section>


      {/* CONTEXTO MERCADO */}
      <section className="section">
        <div className="container">

          <h2>A Inteligência Artificial já redefiniu o mercado.</h2>

          <p>
            Empresas que aplicam IA de forma estruturada estão reduzindo custos,
            aumentando margem e escalando operação.
          </p>

          <p>
            A diferença não está na ferramenta.  
            Está no método.
          </p>

        </div>
      </section>


      {/* DIFERENCIAL */}
      <section className="section dark">
        <div className="container">

          <h2>O Diferencial Bubles AI™</h2>

          <ul className="list">
            <li>✔ Estrutura de aplicação prática</li>
            <li>✔ Implementação orientada a resultado</li>
            <li>✔ IA aplicada à geração de lucro</li>
            <li>✔ Processo replicável e escalável</li>
          </ul>

        </div>
      </section>


      {/* ESTRUTURA */}
      <section className="section">
        <div className="container">

          <h2>Estrutura da Formação</h2>

          <ul className="list">
            <li>Módulo 1 — Fundamentos estratégicos de IA</li>
            <li>Módulo 2 — Estruturação de processos</li>
            <li>Módulo 3 — IA aplicada a marketing e vendas</li>
            <li>Módulo 4 — Automação operacional</li>
            <li>Módulo 5 — Escala e posicionamento</li>
          </ul>

        </div>
      </section>


      {/* POSICIONAMENTO FINAL */}
      <section className="offer">
        <div className="container">

          <h2>Posicione-se na nova economia.</h2>

          <p className="old-price">De R$ 997</p>

          <p className="highlight-price">
            Investimento executivo: R$ 197
          </p>

          <a
            href="https://pay.kiwify.com.br/dup2Pxz"
            className="btn-primary"
          >
            Iniciar minha formação
          </a>

          <p className="trust-line">
            Garantia total de 7 dias. Risco zero.
          </p>

        </div>
      </section>


      {/* BOTÃO FLUTUANTE */}
      <div className="mobile-cta">
        <a href="https://pay.kiwify.com.br/dup2Pxz">
          Garantir vaga por R$ 197
        </a>
      </div>

    </main>
  );
}