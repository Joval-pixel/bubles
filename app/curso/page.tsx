import Link from "next/link";

export default function Curso() {
  return (
    <div>
      {/* HERO */}
      <section className="hero-curso">
        <div className="container center">
          <span className="badge">FORMAÇÃO EXECUTIVA</span>

          <h1>
            Transforme ChatGPT & IA em uma
            <span> máquina estratégica de gerar dinheiro</span>
          </h1>

          <p className="subtitle">
            Método estruturado para aplicar Inteligência Artificial em negócios,
            produtividade e geração de renda — mesmo começando do zero.
          </p>

          <Link href="https://pay.kiwify.com.br/dup2Pxz" className="btn-primary big">
            Garantir minha vaga agora
          </Link>

          <p className="small">
            ✔ Acesso vitalício ✔ Atualizações incluídas ✔ Garantia 7 dias
          </p>
        </div>
      </section>

      {/* AUTORIDADE */}
      <section className="section-light">
        <div className="container center">
          <h2>A IA já está redefinindo o mercado</h2>
          <p>
            Empresas estão reduzindo custos. Profissionais estão produzindo 3x mais.
            Quem aprende agora constrói vantagem competitiva real.
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
            <div className="box">IA aplicada a vendas</div>
            <div className="box">Criação de produtos digitais</div>
            <div className="box">Escala de produtividade</div>
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

      {/* OFERTA */}
      <section className="cta-section">
        <div className="container center">
          <h2>Oferta especial por tempo limitado</h2>

          <p className="price-old">De R$ 997</p>
          <p className="price">Por apenas R$ 197</p>

          <Link href="https://pay.kiwify.com.br/dup2Pxz" className="btn-primary big">
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