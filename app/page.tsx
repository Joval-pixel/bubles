export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>
            Aprenda a usar <span className="highlight">ChatGPT & IA</span> 
            <br /> para ganhar tempo e dinheiro
          </h1>

          <p className="subtitle">
            Curso prático para iniciantes e profissionais que querem usar
            Inteligência Artificial no dia a dia e nos negócios.
          </p>

          <a href="/curso" className="btn primary">
            Ver plano Premium
          </a>

          <a href="/curso" className="btn secondary">
            Ver detalhes
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>O que você vai aprender</h2>

          <ul>
            <li>✔ Como usar ChatGPT do zero</li>
            <li>✔ Criar prompts profissionais</li>
            <li>✔ Automatizar tarefas com IA</li>
            <li>✔ Aplicar IA para vendas</li>
            <li>✔ Estratégias para ganhar dinheiro com IA</li>
          </ul>
        </div>
      </section>

      <div className="footer">
        © 2026 Bubles IA — Todos os direitos reservados
      </div>
    </main>
  );
}
