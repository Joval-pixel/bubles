export default function Home() {
  return (
    <main>

      {/* HERO */}
      <section id="inicio" className="hero">
        <div className="container center">
          
          <h1>
            Programa Executivo <br />
            <span>Bubles AI™</span>
          </h1>

          <p>
            Método estruturado para implementar Inteligência Artificial em marketing,
            vendas e operação com foco em lucro e escala.
          </p>

          <div className="price-old">
            De R$ 999
          </div>

          <div className="price">
            Investimento único: R$ 199
          </div>

          <div className="installments">
            ou 12x no cartão
          </div>

          <a
            href="https://pay.kiwify.com.br/3veb8Bd"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            🔥 Garantir minha vaga
          </a>

        </div>
      </section>


      {/* PROGRAMA */}
      <section id="programa" className="section">
        <div className="container">

          <h2>O que você vai dominar</h2>

          <ul className="list">
            <li>✔ Estrutura estratégica com IA</li>
            <li>✔ Automação de marketing</li>
            <li>✔ Processos e escala</li>
            <li>✔ Aplicação prática real</li>
          </ul>

          <a
            href="https://pay.kiwify.com.br/3veb8Bd"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            🔥 Garantir vaga por R$ 199
          </a>

        </div>
      </section>


      {/* GARANTIA */}
      <section id="garantia" className="section">
        <div className="container">

          <h2>Garantia incondicional</h2>

          <p>
            Você tem 7 dias de garantia total.
            Se não fizer sentido para você, devolvemos 100% do investimento.
          </p>

          <a
            href="https://pay.kiwify.com.br/3veb8Bd"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            🔥 Quero começar agora
          </a>

        </div>
      </section>

    </main>
  );
}
