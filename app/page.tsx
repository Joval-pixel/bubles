export default function Curso() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>
            Programa Executivo <br />
            <span>Bubles AI™</span>
          </h1>

          <p>
            Método estruturado para implementar Inteligência Artificial em
            marketing, vendas e operação com foco em lucro e escala.
          </p>

          <div className="price-hero">
            <div className="old-price">De R$ 997</div>
            <div className="current-price">Investimento único: R$ 197</div>
            <div className="installments">ou 12x no cartão</div>
          </div>

          <a
            href="https://pay.kiwify.com.br/dup2Pxz"
            className="btn-main"
          >
            Garantir minha vaga
          </a>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>Resultados Reais</h2>
          <p style={{ marginBottom: "40px" }}>
            ⭐ Avaliação média 4.9/5 — +300 profissionais impactados
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px"
          }}>

            <div style={cardStyle}>
              <p>
                “Consegui automatizar meu atendimento e aumentar minhas vendas
                em menos de 30 dias.”
              </p>
              <strong>— Empresário Digital</strong>
            </div>

            <div style={cardStyle}>
              <p>
                “O método é direto ao ponto. Nada de enrolação técnica.
                Aplicação prática mesmo.”
              </p>
              <strong>— Consultor de Marketing</strong>
            </div>

            <div style={cardStyle}>
              <p>
                “Eu não sabia usar IA. Hoje uso todos os dias no meu negócio.”
              </p>
              <strong>— Empreendedor</strong>
            </div>

          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Sobre o Programa</h2>
          <p>
            A Bubles AI™ é um centro executivo de formação focado na aplicação
            estruturada de Inteligência Artificial em ambientes reais de
            negócio.
          </p>
          <p>
            Não se trata de teoria técnica. Trata-se de método, estrutura e
            implementação estratégica.
          </p>
        </div>
      </section>
    </>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.05)",
  padding: "25px",
  borderRadius: "12px",
  backdropFilter: "blur(6px)",
};