export default function Curso() {
  return (
    <main className="curso-premium">

      {/* HERO EXECUTIVO */}
      <section className="hero-exec">
        <div className="container hero-grid">

          <div className="hero-text">
            <h1>
              Formação Executiva<br />
              em <span>IA Aplicada</span>
            </h1>

            <p>
              Aprenda a aplicar Inteligência Artificial de forma estratégica
              para aumentar produtividade, margem e receita no seu negócio.
            </p>

            <a
              href="LINK_CHECKOUT_PREMIUM"
              className="btn-primary large"
            >
              Quero entrar para a formação
            </a>

            <div className="hero-badges">
              ✔ Acesso imediato  
              ✔ Método estruturado  
              ✔ Garantia 7 dias
            </div>
          </div>

          <div className="hero-image">
            <div className="mockup-box">
              Instituto Bubles IA
            </div>
          </div>

        </div>
      </section>

      {/* MERCADO */}
      <section className="section-dark">
        <div className="container">
          <h2>A Inteligência Artificial já redefiniu o mercado</h2>
          <p>
            Empresas estão automatizando processos, reduzindo custos e
            aumentando margens. Profissionais que dominam IA produzem mais,
            vendem mais e crescem mais rápido.
          </p>
        </div>
      </section>

      {/* DOMÍNIOS */}
      <section className="section">
        <div className="container">
          <h2>O que você vai dominar</h2>

          <div className="grid">
            <div className="card">Automação estratégica com IA</div>
            <div className="card">Engenharia de prompts profissionais</div>
            <div className="card">Aplicação em marketing e vendas</div>
            <div className="card">Criação de ativos digitais</div>
            <div className="card">Produtividade executiva</div>
            <div className="card">Implementação prática imediata</div>
          </div>
        </div>
      </section>

      {/* ESTRUTURA */}
      <section className="section-dark">
        <div className="container">
          <h2>Estrutura da Formação</h2>

          <div className="modules">
            <div>Módulo 1 – Fundamentos da IA</div>
            <div>Módulo 2 – Prompt Engineering</div>
            <div>Módulo 3 – Aplicação em Negócios</div>
            <div>Módulo 4 – Monetização com IA</div>
            <div>Módulo 5 – Escala e Automação</div>
          </div>
        </div>
      </section>

      {/* INSTITUCIONAL */}
      <section className="section">
        <div className="container">
          <h2>Sobre o Instituto Bubles IA</h2>
          <p>
            A Bubles IA é um instituto de formação executiva especializado
            na aplicação prática da Inteligência Artificial em negócios,
            produtividade e geração de receita.
          </p>
          <p>
            Nosso objetivo é transformar tecnologia em vantagem competitiva real.
          </p>
        </div>
      </section>

      {/* OFERTA */}
      <section className="offer-exec">
        <div className="container">
          <h2>Investimento na Formação</h2>

          <p className="price-old">De R$ 997</p>
          <p className="price-new">Por R$ 197</p>

          <a
            href="LINK_CHECKOUT_PREMIUM"
            className="btn-primary large"
          >
            Garantir minha vaga agora
          </a>

          <p className="guarantee">
            Garantia incondicional de 7 dias.
          </p>
        </div>
      </section>

    </main>
  );
}
