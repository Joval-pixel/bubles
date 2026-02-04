export default function Home() {
  return (
    <>
      <main className="hero">
        <div className="container">
          <h1>
            Aprenda a usar <span>ChatGPT & Inteligência Artificial</span><br />
            para ganhar tempo, produtividade e dinheiro
          </h1>

          <p className="subtitle">
            Curso prático e direto ao ponto para iniciantes, profissionais e
            empreendedores que querem usar IA no dia a dia e nos negócios.
          </p>

          <div className="buttons">
            <a
              href="https://wa.me/5517981813000?text=Olá!%20Quero%20aprender%20a%20usar%20ChatGPT%20e%20IA%20para%20ganhar%20tempo%20e%20dinheiro."
              target="_blank"
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

      <section id="conteudo" className="content">
        <h2>O que você vai aprender</h2>

        <ul>
          <li>✅ Como usar o ChatGPT do zero</li>
          <li>✅ Criar prompts profissionais</li>
          <li>✅ Automatizar tarefas do dia a dia</li>
          <li>✅ Usar IA para vendas e negócios</li>
          <li>✅ Ganhar produtividade e dinheiro com IA</li>
        </ul>
      </section>

      {/* BOTÃO FLUTUANTE WHATSAPP */}
      <a
        href="https://wa.me/5517981813000?text=Olá!%20Quero%20mais%20informações%20sobre%20o%20curso%20de%20ChatGPT."
        target="_blank"
        className="whatsapp-float"
        aria-label="WhatsApp"
      >
        💬
      </a>
    </>
  );
}
