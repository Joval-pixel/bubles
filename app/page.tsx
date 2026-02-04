export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <h1>
            Aprenda a usar <span>ChatGPT & Inteligência Artificial</span>
            <br />
            para ganhar tempo, produtividade e dinheiro ainda este mês
          </h1>

          <p className="subtitle">
            Curso prático e direto ao ponto para iniciantes, profissionais e
            empreendedores que querem usar IA no dia a dia, automatizar tarefas
            e criar novas oportunidades de renda — mesmo começando do zero.
          </p>

          <div className="buttons">
            <a
              href="https://wa.me/5517981813000?text=Olá! Quero aprender a usar ChatGPT e Inteligência Artificial para ganhar produtividade e dinheiro."
              target="_blank"
              rel="noopener noreferrer"
              className="btn primary"
            >
              Quero aprender agora
            </a>

            <a href="#conteudo" className="btn secondary">
              Ver o que vou aprender
            </a>
          </div>

          <p className="microcopy">
            ⚡ Acesso imediato • Linguagem simples • Suporte pelo WhatsApp
          </p>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="problem">
        <div className="container">
          <h2>Você sente que está ficando para trás com a Inteligência Artificial?</h2>

          <p>
            Todo mundo fala de ChatGPT, IA e automação… mas quase ninguém explica
            como usar isso na prática, de forma simples e lucrativa.
          </p>

          <ul>
            <li>❌ Perde tempo com tarefas repetitivas</li>
            <li>❌ Vê outras pessoas ganhando mais produtividade</li>
            <li>❌ Sente que a tecnologia avança rápido demais</li>
          </ul>

          <p className="highlight">
            👉 A boa notícia: você não precisa ser técnico para usar IA.
          </p>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="solution">
        <div className="container">
          <h2>O Bubles IA foi criado para pessoas comuns</h2>

          <p>
            O <strong>Bubles IA</strong> é um curso prático que ensina, passo a
            passo, como usar ChatGPT e Inteligência Artificial de forma simples,
            aplicada ao trabalho, negócios e dia a dia.
          </p>

          <p>
            Sem termos difíceis. <br />
            Sem enrolação. <br />
            Com exemplos reais.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section id="conteudo" className="content">
        <div className="container">
          <h2>O que você vai aprender na prática</h2>

          <ul>
            <li>✅ Usar ChatGPT do zero, mesmo sem experiência</li>
            <li>✅ Criar prompts prontos para trabalho, vendas e negócios</li>
            <li>✅ Automatizar tarefas e ganhar tempo todos os dias</li>
            <li>✅ Criar conteúdos, ideias e propostas com IA</li>
            <li>✅ Aplicar IA para aumentar produtividade e renda extra</li>
          </ul>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="audience">
        <div className="container">
          <h2>Esse curso é para você se:</h2>

          <ul>
            <li>✔ Quer aprender IA sem complicação</li>
            <li>✔ Quer ganhar tempo no trabalho</li>
            <li>✔ Quer usar tecnologia para ganhar mais dinheiro</li>
            <li>✔ É iniciante, profissional ou empreendedor</li>
            <li>✔ Quer algo prático, não teórico</li>
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="final-cta">
        <div className="container">
          <h2>Comece agora a usar IA a seu favor</h2>

          <p>
            Chega de apenas assistir outras pessoas evoluírem.
            Aprenda a usar ChatGPT e Inteligência Artificial de forma prática
            e aplicável a partir de hoje.
          </p>

          <a
            href="https://wa.me/5517981813000?text=Quero me inscrever no Bubles IA e começar agora."
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary large"
          >
            Quero aprender agora pelo WhatsApp
          </a>

          <p className="microcopy">
            🔒 Compra segura • Acesso imediato • Suporte direto
          </p>
        </div>
      </section>
    </main>
  );
}
