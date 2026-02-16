export default function CursoPage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <h1>
            Programa Executivo <br />
            <span>Bubles AI™</span>
          </h1>

          <p>
            Método estruturado para implementar Inteligência Artificial em
            marketing, vendas e operação com foco em lucro e escala.
          </p>

          <div className="price-box">
            <p className="old-price">De R$ 997</p>
            <p className="new-price">Investimento único: R$ 197</p>
            <p className="installments">ou 12x no cartão</p>
          </div>

          <a
            href="https://pay.kiwify.com.br/dup2Pxz"
            className="btn-primary"
          >
            Garantir minha vaga
          </a>
        </div>
      </section>

      {/* BOTÃO FLUTUANTE MOBILE */}
      <div className="mobile-cta">
        <a href="https://pay.kiwify.com.br/dup2Pxz">
          🔥 Garantir vaga por R$ 197
        </a>
      </div>
    </>
  );
}