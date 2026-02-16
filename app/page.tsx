export default function Home() {
  return (
    <main>
      <section id="inicio" className="hero">
        <div className="container center">
          <h1>
            Programa Executivo
            <span>Bubles AI™</span>
          </h1>

          <p>
            Método estruturado para implementar Inteligência Artificial em
            marketing, vendas e operação com foco em lucro e escala.
          </p>

          <div className="price-old">De R$ 997</div>

          <div className="price">
            Investimento único: R$ 197
          </div>

          <div className="installments">
            ou 12x no cartão
          </div>

          <a href="#ingressar" className="btn-primary">
            🔥 Garantir minha vaga
          </a>
        </div>
      </section>

      <section id="programa" className="section">
        <div className="container">
          <h2>O que você vai dominar</h2>

          <ul className="list">
            <li>✔ Estrutura estratégica com IA</li>
            <li>✔ Automação de marketing</li>
            <li>✔ Processos e escala</li>
            <li>✔ Aplicação prática real</li>
          </ul>
        </div>
      </section>

      <section id="garantia" className="section">
        <div className="container">
          <h2>Garantia incondicional</h2>
          <p>
            Você tem 7 dias de garantia total. Se não fizer sentido para você,
            devolvemos 100% do investimento.
          </p>
        </div>
      </section>
    </main>
  );
}