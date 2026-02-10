export default function UpsellPage() {
  return (
    <main className="upsell">

      <section className="upsell-hero">
        <h1>⚠️ Espere! Sua compra ainda não está completa…</h1>
        <p>
          Você garantiu o Pack de Prompts. Excelente decisão.
          Mas existe um passo essencial que separa quem apenas testa IA
          de quem realmente gera dinheiro com ela.
        </p>
      </section>

      <section className="upsell-problema">
        <h2>Prompts são ferramentas. Método é o que gera resultado.</h2>
        <p>
          A maioria das pessoas compra prompts, usa alguns dias e para.
          Porque não tem estrutura, estratégia e aplicação prática.
        </p>
        <p>
          O Curso Bubles IA Premium é o sistema completo para aplicar IA
          em negócios, vendas e produtividade.
        </p>
      </section>

      <section className="upsell-beneficios">
        <h2>O que você desbloqueia agora:</h2>
        <ul>
          <li>✔ Método estruturado do zero ao avançado</li>
          <li>✔ Aplicação prática em vendas e marketing</li>
          <li>✔ Como transformar IA em renda</li>
          <li>✔ Estratégias reais de automação</li>
          <li>✔ Atualizações futuras incluídas</li>
        </ul>
      </section>

      <section className="upsell-oferta">
        <h2>🔥 Oferta exclusiva somente agora</h2>
        <p className="old-price">De R$197</p>
        <p className="new-price">Por apenas R$147</p>
        <p className="warning">
          Esse valor especial aparece apenas nesta página.
        </p>

        <a
          href="LINK_DO_CHECKOUT_PREMIUM"
          className="btn-aceitar"
        >
          SIM! Quero o método completo com desconto
        </a>

        <br />

        <a href="/" className="btn-recusar">
          Não, quero continuar só com o Pack
        </a>
      </section>

    </main>
  );
}
