export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>
            Programa Executivo <br />
            <span>Bubles AI™</span>
          </h1>

          <p>
            Método estruturado para implementar Inteligência Artificial
            em marketing, vendas e operação com foco em lucro e escala.
          </p>

          <div className="price-old">De R$ 997</div>
          <div className="price-new">Investimento único: R$ 197</div>
          <div className="price-installments">ou 12x no cartão</div>

          <a
            href="https://pay.kiwify.com.br/dup2Pxz"
            className="btn-primary"
          >
            🔥 Garantir minha vaga
          </a>

          <div className="hero-links">
            <a href="#como">Como funciona</a>
            <a href="#aprende">O que você aprende</a>
            <a href="#garantia">Garantia</a>
          </div>
        </div>
      </section>

      <section id="como">
        <div className="container">
          <h2>Como funciona o programa</h2>
          <p>
            Formação dividida em módulos estratégicos com aplicação prática.
            Você aprende, estrutura e implementa imediatamente.
          </p>
        </div>
      </section>

      <section id="aprende">
        <div className="container">
          <h2>O que você vai dominar</h2>
          <p>
            • Estrutura estratégica com IA <br />
            • Automação de marketing <br />
            • Processos e escala <br />
            • Aplicação prática real
          </p>
        </div>
      </section>

      <section id="garantia">
        <div className="container">
          <h2>Garantia incondicional</h2>
          <p>
            Você tem 7 dias para testar. Se não fizer sentido para você,
            devolvemos 100% do valor.
          </p>
        </div>
      </section>
    </>
  );
}