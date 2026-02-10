export default function ClubPage() {
  return (
    <main className="club">

      <section className="club-hero">
        <h1>Bubles IA Club</h1>
        <p>
          Evolua com Inteligência Artificial todos os meses.
          Aplicação prática, estratégica e atualizada.
        </p>
      </section>

      <section className="club-benefits">
        <h2>O que você recebe como membro:</h2>

        <ul>
          <li>✔ Biblioteca crescente de prompts estratégicos</li>
          <li>✔ Aula prática nova todo mês</li>
          <li>✔ Templates prontos para aplicar</li>
          <li>✔ Atualizações sobre ferramentas de IA</li>
          <li>✔ Comunidade exclusiva de membros</li>
        </ul>
      </section>

      <section className="club-price">
        <h2>Acesso completo por apenas</h2>
        <p className="club-value">R$49 / mês</p>

        <a
          href="LINK_ASSINATURA_KIWIFY"
          className="btn-club"
        >
          Quero entrar para o Club agora
        </a>

        <p className="club-note">
          Cancelamento simples a qualquer momento.
        </p>
      </section>

    </main>
  );
}
