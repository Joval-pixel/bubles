export default function Curso() {
  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <span style={{
            background: "#1da1f2",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "14px"
          }}>
            🔥 PLANO PREMIUM
          </span>

          <h1 style={{ marginTop: "20px" }}>
            Domine <span style={{ color: "#1da1f2" }}>ChatGPT & IA</span>
            <br />
            e transforme conhecimento em renda
          </h1>

          <p className="subtitle">
            Método prático para sair do zero e começar a usar Inteligência
            Artificial para ganhar produtividade e dinheiro.
          </p>

          <div>
            <a
              href="https://wa.me/5517981813000"
              target="_blank"
              className="btn primary"
            >
              🚀 Quero entrar agora
            </a>
          </div>

          <p style={{ marginTop: "10px", opacity: 0.7 }}>
            ⚠️ Vagas limitadas para suporte individual
          </p>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section>
        <div className="container">
          <h2>🚀 O que você vai aprender</h2>

          <ul>
            <li>✔ ChatGPT do básico ao avançado</li>
            <li>✔ Prompts profissionais para negócios</li>
            <li>✔ Automação de tarefas do dia a dia</li>
            <li>✔ Como usar IA para vendas e marketing</li>
            <li>✔ Estratégias reais para gerar renda</li>
          </ul>
        </div>
      </section>

      {/* PROVA / AUTORIDADE */}
      <section className="highlight">
        <div className="container">
          <h2>📈 Para quem é este curso?</h2>

          <ul>
            <li>✔ Empreendedores</li>
            <li>✔ Profissionais liberais</li>
            <li>✔ Quem quer renda extra</li>
            <li>✔ Quem quer sair na frente com IA</li>
          </ul>
        </div>
      </section>

      {/* BÔNUS */}
      <section>
        <div className="container">
          <h2>🎁 Bônus Exclusivos</h2>

          <ul>
            <li>🎯 Pack de prompts prontos</li>
            <li>📄 Modelos para aplicar em negócios</li>
            <li>📲 Suporte direto via WhatsApp</li>
            <li>♾ Atualizações futuras inclusas</li>
          </ul>
        </div>
      </section>

      {/* OFERTA */}
      <section className="pricing">
        <div className="container">
          <h2>💰 Investimento</h2>

          <p className="old-price">De R$ 497,00</p>

          <p className="new-price">R$ 197,00</p>

          <p className="installments">ou 12x de R$ 19,70</p>

          <a
            href="https://wa.me/5517981813000"
            target="_blank"
            className="btn primary"
          >
            🔒 Garantir minha vaga agora
          </a>

          <p className="guarantee">
            Garantia incondicional de 7 dias
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="container">
          <h2>❓ Perguntas Frequentes</h2>

          <h4>Preciso saber tecnologia?</h4>
          <p>Não. O curso é totalmente para iniciantes.</p>

          <h4>Quando recebo acesso?</h4>
          <p>Imediatamente após confirmação.</p>

          <h4>Tem suporte?</h4>
          <p>Sim, suporte direto no WhatsApp.</p>
        </div>
      </section>

      <footer>
        © 2026 Bubles IA — Todos os direitos reservados
      </footer>
    </main>
  );
}
