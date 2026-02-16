export default function Home() {
  return (
    <main>

      {/* HERO */}
      <section>
        <div className="container" style={{ textAlign: "center" }}>
          
          <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "10px" }}>
            Programa Executivo
          </h1>

          <h2 style={{
            fontSize: "38px",
            fontWeight: 800,
            background: "linear-gradient(90deg, #18c8ff, #1df2a0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "25px"
          }}>
            Bubles AI™
          </h2>

          <p style={{
            fontSize: "18px",
            maxWidth: "700px",
            margin: "0 auto 30px auto",
            lineHeight: 1.6,
            opacity: 0.9
          }}>
            Método estruturado para implementar Inteligência Artificial
            em marketing, vendas e operação com foco em lucro e escala.
          </p>

          <p style={{
            textDecoration: "line-through",
            opacity: 0.6,
            marginBottom: "10px"
          }}>
            De R$ 997
          </p>

          <p style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "10px"
          }}>
            Investimento único: R$ 197
          </p>

          <p style={{ marginBottom: "35px", opacity: 0.8 }}>
            ou 12x no cartão
          </p>

          <a href="#comprar" className="btn-primary">
            🔥 Garantir minha vaga
          </a>

        </div>
      </section>


      {/* COMO FUNCIONA */}
      <section id="como">
        <div className="container">
          <h2 style={{ fontSize: "34px", fontWeight: 800, marginBottom: "20px" }}>
            Como funciona o programa
          </h2>

          <p style={{ fontSize: "18px", lineHeight: 1.7, maxWidth: "700px" }}>
            Formação dividida em módulos estratégicos com aplicação prática.
            Você aprende, estrutura e implementa imediatamente no seu negócio.
          </p>
        </div>
      </section>


      {/* O QUE VOCÊ APRENDE */}
      <section id="conteudo">
        <div className="container">
          <h2 style={{ fontSize: "34px", fontWeight: 800, marginBottom: "20px" }}>
            O que você vai dominar
          </h2>

          <ul style={{
            fontSize: "18px",
            lineHeight: 2,
            listStyle: "none",
            paddingLeft: 0
          }}>
            <li>✔ Estrutura estratégica com IA</li>
            <li>✔ Automação de marketing</li>
            <li>✔ Processos e escala</li>
            <li>✔ Aplicação prática real</li>
          </ul>
        </div>
      </section>


      {/* GARANTIA */}
      <section id="garantia">
        <div className="container">
          <h2 style={{ fontSize: "34px", fontWeight: 800, marginBottom: "20px" }}>
            Garantia incondicional
          </h2>

          <p style={{ fontSize: "18px", lineHeight: 1.7, maxWidth: "700px" }}>
            Você tem 7 dias de garantia total. Se não fizer sentido para você,
            devolvemos 100% do investimento.
          </p>
        </div>
      </section>


      {/* ÂNCORA COMPRA */}
      <section id="comprar">
        <div className="container" style={{ textAlign: "center" }}>
          <a href="#" className="btn-primary">
            🔥 Garantir vaga por R$ 197
          </a>
        </div>
      </section>


      {/* BOTÃO FLUTUANTE FIXO */}
      <div className="floating-cta">
        <a href="#comprar">
          🔥 Garantir vaga por R$ 197
        </a>
      </div>

    </main>
  );
}