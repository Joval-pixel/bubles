export default function Comparativo() {
  return (
    <main>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <h1>
            Escolha o nível ideal para aplicar <span className="highlight">IA estrategicamente</span>
          </h1>

          <p className="subtitle">
            Compare o Sistema Bubles IA com a Assinatura Premium.
          </p>
        </div>
      </section>


      {/* TABELA COMPARATIVA */}
      <section className="section">
        <div className="container">

          <div className="grid">

            {/* SISTEMA */}
            <div className="card">
              <h2>Sistema Bubles IA</h2>

              <p style={{ marginTop: 20 }}>
                ✔ Sistema Estratégico completo <br />
                ✔ Biblioteca base de prompts <br />
                ✔ Templates executivos <br />
                ✔ Plano 90 dias <br />
                ❌ Atualizações futuras <br />
                ❌ Novos playbooks mensais <br />
                ❌ Ferramentas futuras incluídas
              </p>

              <p className="price" style={{ marginTop: 20 }}>
                R$ 197 (pagamento único)
              </p>

              <a
                href="https://pay.kiwify.com.br/dup2Pxz"
                className="btn-primary"
              >
                Comprar Sistema
              </a>
            </div>


            {/* PREMIUM */}
            <div className="card" style={{ border: "2px solid #00e0a4" }}>
              <h2>Bubles IA Premium</h2>

              <p style={{ marginTop: 20 }}>
                ✔ Sistema completo incluído <br />
                ✔ Biblioteca completa atualizada <br />
                ✔ Templates executivos <br />
                ✔ Plano 90 dias <br />
                ✔ Novos playbooks mensais <br />
                ✔ Ferramentas futuras incluídas <br />
                ✔ Atualizações contínuas
              </p>

              <p className="price" style={{ marginTop: 20 }}>
                R$ 49 / mês
              </p>

              <a
                href="https://kiwify.app/E1GPb6s"
                className="btn-primary large"
              >
                Tornar-se Premium
              </a>

              <p style={{ marginTop: 15, fontSize: 14, opacity: 0.7 }}>
                Plano Founder – valor garantido para membros iniciais
              </p>
            </div>

          </div>

        </div>
      </section>

    </main>
  )
}