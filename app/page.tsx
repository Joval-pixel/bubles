import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              Transforme Inteligência Artificial em 
              <span> vantagem competitiva real</span>
            </h1>

            <p className="subtitle">
              A Bubles IA é uma formação prática focada em aplicação estratégica
              de IA para negócios, produtividade e geração de renda.
            </p>

            <div className="hero-buttons">
              <Link href="/curso" className="btn-primary">
                Conhecer Formação
              </Link>

              <Link href="/pack" className="btn-outline">
                Ver Biblioteca
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <h3>O que você vai dominar</h3>
            <ul>
              <li>✔ Automação com IA</li>
              <li>✔ Prompt Engineering estratégico</li>
              <li>✔ IA aplicada a marketing e vendas</li>
              <li>✔ Criação de produtos digitais</li>
              <li>✔ Implementação prática imediata</li>
            </ul>
          </div>
        </div>
      </section>

      {/* POSICIONAMENTO */}
      <section className="section-dark">
        <div className="container center">
          <h2>A IA já está redefinindo o mercado</h2>
          <p>
            Empresas estão reduzindo custos e aumentando margens.
            Profissionais estão produzindo mais em menos tempo.
            Quem aprende agora constrói vantagem estrutural.
          </p>
        </div>
      </section>

      {/* ECOSSISTEMA */}
      <section className="section">
        <div className="container">
          <h2 className="center">Ecossistema Bubles IA</h2>

          <div className="cards-3">
            <div className="card">
              <h3>🎓 Formação Executiva</h3>
              <p>
                Método estruturado para aplicar IA de forma estratégica
                em negócios e carreira.
              </p>
              <Link href="/curso" className="btn-small">
                Acessar
              </Link>
            </div>

            <div className="card">
              <h3>📚 Biblioteca de Prompts</h3>
              <p>
                Prompts profissionais prontos para aplicar e gerar resultado
                imediato.
              </p>
              <Link href="/pack" className="btn-small">
                Ver Biblioteca
              </Link>
            </div>

            <div className="card">
              <h3>🤝 Programa Embaixadores</h3>
              <p>
                Divulgue a Bubles IA e receba comissões recorrentes.
              </p>
              <Link href="/embaixadores" className="btn-small">
                Participar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="container center">
          <h2>Decisão estratégica é agir antes da maioria</h2>
          <p>
            Quem aprende IA hoje constrói margem, velocidade e escala amanhã.
          </p>

          <Link href="/curso" className="btn-primary big">
            Entrar na Formação
          </Link>
        </div>
      </section>
    </div>
  );
}