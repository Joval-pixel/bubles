import Link from "next/link";

export default function Home() {
  return (
    <main>

      {/* HERO INSTITUCIONAL */}
      <section className="hero">
        <div className="container center">
          <h1>
            Bubles AI
          </h1>
          <h2 className="subtitle">
            Centro Executivo de Aplicação Estratégica em Inteligência Artificial
          </h2>

          <p className="description">
            Aplicação estruturada de IA para empresas, empresários e gestores
            que desejam transformar tecnologia em vantagem competitiva real.
          </p>

          <div className="buttons">
            <Link href="/programa" className="btn-primary">
              Conhecer o Programa Executivo
            </Link>
          </div>
        </div>
      </section>


      {/* SOBRE */}
      <section className="section">
        <div className="container">
          <h2>Sobre a Bubles AI</h2>
          <p>
            A Bubles AI é um centro executivo focado na aplicação prática
            de Inteligência Artificial em ambientes reais de negócio.
          </p>
          <p>
            Não se trata de teoria técnica. Trata-se de método,
            estrutura e implementação estratégica.
          </p>
        </div>
      </section>


      {/* MÉTODO */}
      <section className="section dark">
        <div className="container">
          <h2>Método Bubles AI™</h2>

          <div className="grid">
            <div className="card">
              <h3>Estrutura</h3>
              <p>Organização estratégica de processos com IA.</p>
            </div>

            <div className="card">
              <h3>Aplicação</h3>
              <p>Implementação prática em marketing, vendas e operação.</p>
            </div>

            <div className="card">
              <h3>Escala</h3>
              <p>Otimização contínua e crescimento estruturado.</p>
            </div>
          </div>
        </div>
      </section>


      {/* PÚBLICO */}
      <section className="section">
        <div className="container">
          <h2>Para quem é</h2>
          <ul className="list">
            <li>Empresários que desejam aumentar margem e eficiência</li>
            <li>Gestores que buscam automação estratégica</li>
            <li>Profissionais que querem produtividade executiva</li>
          </ul>
        </div>
      </section>


      {/* CTA */}
      <section className="cta">
        <div className="container center">
          <h2>Conheça o Programa Executivo</h2>
          <Link href="/programa" className="btn-primary">
            Acessar Programa
          </Link>
        </div>
      </section>

    </main>
  );
}