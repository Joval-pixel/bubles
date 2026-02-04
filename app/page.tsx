export default function Home() {
  return (
    <>
      <main className="hero">
        <div className="container">
          <h1>
            Aprenda a usar <span>ChatGPT & Inteligência Artificial</span>
            <br />
            para ganhar tempo, produtividade e dinheiro
          </h1>

          <p className="subtitle">
            Curso prático para iniciantes, profissionais e empreendedores que
            querem usar IA no dia a dia, automatizar tarefas e criar novas
            oportunidades de renda — mesmo começando do zero.
          </p>

          <div className="buttons">
            <a
              href="/curso"
              className="btn primary"
            >
              Quero aprender agora
            </a>

            <a href="#conteudo" className="btn secondary">
              Ver o que vou aprender
            </a>
          </div>
        </div>
      </main>

      <section id="conteudo" className="section container">
        <h2>O que você vai aprender</h2>

        <ul className="list">
          <li>✅ Usar ChatGPT do zero</li>
          <li>✅ Prompts prontos para trabalho e negócios</li>
          <li>✅ Automatizar tarefas repetitivas</li>
          <li>✅ Criar conteúdos e ideias com IA</li>
          <li>✅ Usar IA para ganhar tempo e dinheiro</li>
        </ul>
      </section>

      <section className="cta">
        <h2>Comece hoje a usar IA a seu favor</h2>
        <p>
          Enquanto muitos ainda estão confusos com a Inteligência Artificial,
          você pode sair na frente e usar isso de forma prática no seu dia a dia.
        </p>

        <a
          href="/curso"
          className="btn primary"
        >
          Quero aprender agora
        </a>
      </section>

      <a
        href="https://wa.me/5517981813000?text=Olá! Quero aprender ChatGPT e IA e gostaria de mais informações."
        target="_blank"
        className="whatsapp-float"
      >
        💬
      </a>
    </>
  );
}
