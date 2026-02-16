export default function Home() {
  return (
    <main>

      {/* HERO PRINCIPAL */}
      <section className="hero">
        <div className="container">
          <h1>
            Bubles IA <span className="highlight">Premium</span>
          </h1>

          <p className="subtitle">
            Plataforma estratégica de aplicação de Inteligência Artificial
            para empreendedores que desejam estruturar, automatizar e escalar.
          </p>

          <a
            href="https://kiwify.app/E1GPb6s"
            className="btn-primary large"
          >
            Tornar-se membro Premium
          </a>

          <div className="hero-info">
            Plano Founder – R$49/mês • Cancelamento simples
          </div>
        </div>
      </section>


      {/* PROBLEMA DE MERCADO */}
      <section className="section">
        <div className="container">
          <h2>A maioria usa IA de forma superficial</h2>

          <p>
            Perguntas aleatórias não geram vantagem competitiva.
            O que gera resultado é estrutura, método e aplicação estratégica.
          </p>
        </div>
      </section>


      {/* O QUE É A PLATAFORMA */}
      <section className="section dark-section">
        <div className="container">
          <h2>O que é o Bubles IA Premium</h2>

          <div className="grid">
            <div className="card">
              <strong>Sistemas Estratégicos</strong>
              <p style={{ marginTop: 10 }}>
                Método organizado para aplicar IA em negócios.
              </p>
            </div>

            <div className="card">
              <strong>Biblioteca Atualizada</strong>
              <p style={{ marginTop: 10 }}>
                Prompts e frameworks adicionados continuamente.
              </p>
            </div>

            <div className="card">
              <strong>Playbooks Mensais</strong>
              <p style={{ marginTop: 10 }}>
                Novos sistemas de marketing e vendas todo mês.
              </p>
            </div>

            <div className="card">
              <strong>Ferramentas Futuras Incluídas</strong>
              <p style={{ marginTop: 10 }}>
                Planilhas, modelos e estruturas adicionadas ao longo do tempo.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* COMPARAÇÃO RÁPIDA */}
      <section className="section">
        <div className="container">
          <h2>Produto único ou acesso completo?</h2>

          <div className="grid">

            <div className="card">
              <h3>Sistema Bubles IA</h3>
              <p>Pagamento único de R$197</p>
              <p style={{ marginTop: 10 }}>
                Ideal para quem quer acesso apenas ao método base.
              </p>
              <a
                href="https://pay.kiwify.com.br/dup2Pxz"
                className="btn-primary"
                style={{ marginTop: 20 }}
              >
                Comprar Sistema
              </a>
            </div>

            <div className="card" style={{ border: "2px solid #00e0a4" }}>
              <h3>Bubles IA Premium</h3>
              <p>R$49 por mês</p>
              <p style={{ marginTop: 10 }}>
                Inclui todos os sistemas + atualizações contínuas.
              </p>
              <a
                href="https://kiwify.app/E1GPb6s"
                className="btn-primary large"
                style={{ marginTop: 20 }}
              >
                Assinar Premium
              </a>
            </div>

          </div>
        </div>
      </section>


      {/* CTA FINAL */}
      <section className="section dark-section">
        <div className="container">
          <h2>Comece a aplicar IA com estrutura</h2>

          <a
            href="https://kiwify.app/E1GPb6s"
            className="btn-primary large"
          >
            Quero acesso Premium
          </a>
        </div>
      </section>

    </main>
  )
}