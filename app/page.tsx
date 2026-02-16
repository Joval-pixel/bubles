import Link from "next/link";

export default function Curso() {
  return (
    <div>

      {/* HERO */}
      <section className="hero-curso">
        <div className="container center">

          <span className="badge">FORMAÇÃO EXECUTIVA EM IA</span>

          <h1>
            Transforme Inteligência Artificial em
            <span> vantagem competitiva real</span>
          </h1>

          <p className="subtitle">
            Método estruturado para aplicar IA em negócios, produtividade e
            geração de renda — mesmo começando do zero.
          </p>

          <Link
            href="https://pay.kiwify.com.br/dup2Pxz"
            className="btn-primary big"
          >
            Garantir minha vaga agora
          </Link>

          <p className="small">
            ✔ Acesso vitalício &nbsp; ✔ Atualizações incluídas &nbsp; ✔ Garantia 7 dias
          </p>

        </div>
      </section>


      {/* AUTORIDADE */}
      <section className="section-light">
        <div className="container center">
          <h2>A IA já está redefinindo o mercado</h2>
          <p>
            Empresas estão reduzindo custos e aumentando margens.
            Profissionais estão produzindo mais em menos tempo.
            Quem aprende agora constrói vantagem estrutural.
          </p>
        </div>
      </section>


      {/* O QUE VOCÊ VAI DOMINAR */}
      <section className="section">
        <div className="container">
          <h2 className="center">O que você vai dominar</h2>

          <div className="grid-3">
            <div className="box">Automação com IA</div>
            <div className="box">Prompt Engineering profissional</div>
            <div className="box">IA aplicada a marketing</div>
            <div className="box">IA aplicada a vendas</div>
            <div className="box">Criação de produtos digitais</div>
            <div className="box">Implementação prática imediata</div>
          </div>
        </div>
      </section>


      {/* ESTRUTURA DO CURSO */}
      <section className="section-light">
        <div className="container">
          <h2 className="center">Estrutura da Formação</h2>

          <div className="modules">
            <div className="module">Módulo 1 — Fundamentos da IA</div>
            <div className="module">Módulo 2 — Engenharia de Prompts</div>
            <div className="module">Módulo 3 — IA aplicada a negócios</div>
            <div className="module">Módulo 4 — Monetização com IA</div>
            <div className="module">Módulo 5 — Automação estratégica</div>
          </div>
        </div>
      </section>


      {/* PROVA SOCIAL */}
      <section className="section">
        <div className="container">
          <h2 className="center">O que estão dizendo</h2>

          <div className="grid-3">
            <div className="testimonial">
              <p>
                “Consegui estruturar minha oferta usando IA e organizar meu
                negócio de forma estratégica.”
              </p>
              <span>— Empreendedor Digital</span>
            </div>

            <div className="testimonial">
              <p>
                “Antes eu usava IA de forma aleatória. Agora tenho método.
                Minha produtividade mudou completamente.”
              </p>
              <span>— Profissional Autônomo</span>
            </div>

            <div className="testimonial">
              <p>
                “Não é teoria. É aplicação prática organizada.”
              </p>
              <span>— Aluno da Formação</span>
            </div>
          </div>
        </div>
      </section>


      {/* OFERTA */}
      <section className="cta-section">
        <div className="container center">

          <h2>Oferta especial de lançamento</h2>

          <p className="price-old">De R$ 997</p>
          <p className="price">Por apenas R$ 197</p>

          <Link
            href="https://pay.kiwify.com.br/dup2Pxz"
            className="btn-primary big"
          >
            Garantir minha vaga agora
          </Link>

          <p className="small">
            Garantia incondicional de 7 dias.
          </p>

        </div>
      </section>

    </div>
  );
}