import Link from "next/link";

export default function Home() {
  return (
    <div>

      {/* HERO INSTITUCIONAL */}
      <section className="hero-executive">
        <div className="container center">

          <span className="badge">
            CENTRO EXECUTIVO DE FORMAÇÃO
          </span>

          <h1>
            Bubles IA
          </h1>

          <p className="subtitle-strong">
            Aplicação estratégica de Inteligência Artificial para negócios,
            produtividade e geração de vantagem competitiva.
          </p>

          <div className="hero-buttons">
            <Link href="/curso" className="btn-primary big">
              Conhecer Programa Executivo
            </Link>
          </div>

        </div>
      </section>


      {/* SOBRE O CENTRO */}
      <section className="section-light">
        <div className="container center">

          <h2>Sobre o Centro Executivo</h2>

          <p>
            A Bubles IA é um centro de formação focado na aplicação estruturada
            de Inteligência Artificial em ambientes reais de negócio.
          </p>

          <p>
            Não se trata de teoria técnica. Trata-se de método, estrutura e
            implementação estratégica.
          </p>

        </div>
      </section>


      {/* MÉTODO BUBLES IA */}
      <section className="section">
        <div className="container">

          <h2 className="center">Método Bubles IA™</h2>

          <div className="grid-3">

            <div className="pillar">
              <h3>Estrutura</h3>
              <p>
                Organização clara de processos e aplicação estratégica.
              </p>
            </div>

            <div className="pillar">
              <h3>Aplicação</h3>
              <p>
                Implementação prática em marketing, vendas e operação.
              </p>
            </div>

            <div className="pillar">
              <h3>Escala</h3>
              <p>
                Otimização contínua e crescimento estruturado.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* PROGRAMAS DISPONÍVEIS */}
      <section className="section-light">
        <div className="container">

          <h2 className="center">Programas Disponíveis</h2>

          <div className="grid-3">

            <div className="program-card">
              <h3>Programa Executivo</h3>
              <p>
                Formação estruturada para aplicação estratégica de IA.
              </p>
              <Link href="/curso" className="btn-outline">
                Ver Programa
              </Link>
            </div>

            <div className="program-card">
              <h3>Biblioteca Estratégica</h3>
              <p>
                Prompts profissionais e frameworks organizados.
              </p>
              <Link href="/pack" className="btn-outline">
                Acessar Biblioteca
              </Link>
            </div>

            <div className="program-card">
              <h3>Programa de Implementação</h3>
              <p>
                Mentoria estratégica para aplicação avançada.
              </p>
              <Link href="/embaixadores" className="btn-outline">
                Saber Mais
              </Link>
            </div>

          </div>
        </div>
      </section>


      {/* PARA QUEM É */}
      <section className="section">
        <div className="container center">

          <h2>Para quem é o Centro Executivo</h2>

          <p>
            Empreendedores, profissionais e gestores que desejam aplicar
            Inteligência Artificial de forma estruturada e estratégica.
          </p>

        </div>
      </section>


      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="container center">

          <h2>Formação estratégica começa com decisão.</h2>

          <Link href="/curso" className="btn-primary big">
            Iniciar Programa Executivo
          </Link>

        </div>
      </section>

    </div>
  );
}