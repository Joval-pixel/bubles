export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>
          Aprenda a usar <span>ChatGPT & IA</span> para ganhar tempo e dinheiro
        </h1>

        <p>
          Curso prático para iniciantes e profissionais que querem usar
          Inteligência Artificial no dia a dia e nos negócios.
        </p>

        <div className="actions">
          <a
            href="https://wa.me/55SEUNUMEROAQUI"
            className="btn primary"
            target="_blank"
          >
            Quero aprender agora
          </a>

          <a href="#conteudo" className="btn secondary">
            Ver conteúdo
          </a>
        </div>
      </section>

      <section id="conteudo" className="features">
        <h2>O que você vai aprender</h2>

        <ul>
          <li>✔️ Como usar o ChatGPT do zero</li>
          <li>✔️ Criar textos, anúncios e posts com IA</li>
          <li>✔️ Usar IA para trabalho e negócios</li>
          <li>✔️ Automatizar tarefas e ganhar produtividade</li>
        </ul>
      </section>
    </main>
  )
}
