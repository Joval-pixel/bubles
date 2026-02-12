export default function CursoPage() {
  return (
    <main>

      {/* HERO EXECUTIVO */}
      <section className="hero-exec">
        <div className="container hero-text">
          <h1>
            Transforme <span>ChatGPT & IA</span><br />
            em uma máquina de gerar resultado
          </h1>
          <p>
            Formação estruturada para aplicar Inteligência Artificial no seu negócio,
            aumentar produtividade e gerar novas fontes de renda — mesmo começando do zero.
          </p>

          <a
            href="https://pay.kiwify.com.br/3veb8Bd"
            className="btn-primary"
          >
            Quero acesso imediato
          </a>

          <p style={{ marginTop: 15, fontSize: 14, opacity: 0.7 }}>
            ✓ Acesso vitalício • ✓ Atualizações incluídas • ✓ Garantia 7 dias
          </p>
        </div>
      </section>

      {/* MERCADO */}
      <section className="section">
        <div className="container">
          <h2>A IA já está redefinindo o mercado</h2>
          <p>
            Empresas estão reduzindo custos e aumentando lucro com automação.
            Profissionais estão produzindo mais em menos tempo.
            Quem aprende agora sai na frente.
          </p>
        </div>
      </section>

      {/* DOMÍNIO */}
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

      {/* ESTRUTURA */}
      <section className="section">
        <div className="container">
          <h2>Estrutura da Formação</h2>

          <div className="accordion">Módulo 1 — Fundamentos da IA aplicada</div>
          <div className="accordion">Módulo 2 — Engenharia de Prompt</div>
          <div className="accordion">Módulo 3 — Aplicações práticas em negócios</div>
          <div className="accordion">Módulo 4 — Marketing e vendas com IA</div>
          <div className="accordion">Módulo 5 — Automação e escala</div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="about">
        <div className="container">
          <h2>Sobre a Bubles IA</h2>
          <p>
            A Bubles IA é uma iniciativa educacional focada na aplicação prática
            da Inteligência Artificial em negócios, produtividade e geração de renda.
          </p>
          <p style={{ marginTop: 15 }}>
            Nosso objetivo é simplificar o uso de ferramentas como ChatGPT
            e torná-las acessíveis para profissionais e empreendedores.
          </p>
        </div>
      </section>

      {/* OFERTA */}
      <section className="offer-exec">
        <div className="container">
          <h2>Investimento na Formação</h2>

          <p className="price-old">De R$ 997</p>
          <div className="price-new">Por apenas R$ 197</div>

          <a
            href="https://pay.kiwify.com.br/3veb8Bd"
            className="btn-primary"
          >
            Garantir minha vaga agora
          </a>

          <p style={{ marginTop: 15, fontSize: 14, opacity: 0.7 }}>
            Garantia incondicional de 7 dias.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © 2026 Bubles IA — Todos os direitos reservados
      </footer>

    </main>
  );
}
