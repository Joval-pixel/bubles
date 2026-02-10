export default function Home() {
  return (
    <main className="home">

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <h1>
            Transforme <span>ChatGPT & IA</span><br />
            em uma máquina de gerar dinheiro
          </h1>

          <p>
            Método estruturado para aplicar Inteligência Artificial
            no seu negócio ou renda extra — mesmo começando do zero.
          </p>

          <a
            href="/curso"
            className="btn-primary"
          >
            Quero acesso imediato
          </a>

          <div className="badges">
            ✔ Acesso vitalício  
            ✔ Atualizações incluídas  
            ✔ Garantia 7 dias
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="section-dark">
        <div className="container">
          <h2>A IA já está redefinindo o mercado</h2>
          <p>
            Empresas estão reduzindo custos e aumentando lucro.
            Profissionais estão produzindo mais em menos tempo.
            Quem aprende agora sai na frente.
          </p>
        </div>
      </section>

      {/* O QUE VOCÊ DOMINA */}
      <section className="section">
        <div className="container">
          <h2>O que você vai dominar</h2>

          <div className="grid">
            <div className="card">Criar prompts estratégicos</div>
            <div className="card">Automatizar tarefas repetitivas</div>
            <div className="card">Aplicar IA em marketing e vendas</div>
            <div className="card">Criar produtos digitais com IA</div>
            <div className="card">Aumentar produtividade e margem</div>
            <div className="card">Implementação prática imediata</div>
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section className="offer">
        <div className="container">
          <h2>Oferta especial por tempo limitado</h2>

          <p className="price-old">De R$ 997</p>
          <p className="price-new">Por apenas R$ 197</p>

          <a
            href="LINK_CHECKOUT_KIWIFY"
            className="btn-primary large"
          >
            Garantir minha vaga agora
          </a>

          <p className="guarantee">
            Garantia incondicional de 7 dias.
          </p>
        </div>
      </section>

    </main>
  );
}
