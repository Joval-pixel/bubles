export default function Home() {
  return (
    <main>

      {/* HERO */}
      <section className="hero">
        <div className="container">

          <h1>
            Programa Executivo<br />
            <span>Bubles AI™</span>
          </h1>

          <p className="subtitle">
            Formação executiva para aplicar Inteligência Artificial em marketing,
            vendas e operação com foco em lucro real e escala previsível.
          </p>

          <p className="old-price">De R$ 997</p>

          <p className="highlight-price">
            Hoje por apenas R$ 197
          </p>

          <p className="installments">
            ou 12x no cartão
          </p>

          <a
            href="https://pay.kiwify.com.br/dup2Pxz"
            className="btn-primary"
          >
            🔥 Garantir vaga por R$ 197
          </a>

          <p className="trust-line">
            ✔ Acesso vitalício <br />
            ✔ Atualizações incluídas <br />
            ✔ Garantia incondicional de 7 dias
          </p>

        </div>
      </section>


      {/* SEÇÃO AUTORIDADE */}
      <section className="authority">
        <div className="container">
          <h2>Centro Executivo de Formação</h2>

          <p>
            A Bubles AI é um centro de formação focado na aplicação estruturada
            de Inteligência Artificial em ambientes reais de negócio.
          </p>

          <p>
            Não se trata de teoria técnica.
            Trata-se de método, estrutura e implementação estratégica.
          </p>
        </div>
      </section>


      {/* BOTÃO FLUTUANTE MOBILE */}
      <div className="mobile-cta">
        <a href="https://pay.kiwify.com.br/dup2Pxz">
          🔥 Garantir vaga por R$ 197
        </a>
      </div>

    </main>
  );
}