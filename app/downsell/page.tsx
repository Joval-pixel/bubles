export default function DownsellPage() {
  return (
    <main className="downsell">

      <section>
        <h1>Espere… Última oportunidade</h1>

        <p>
          Talvez o valor completo não seja ideal agora.
          Mas não faz sentido você sair sem aprender o método.
        </p>

        <h2>Versão Essencial do Curso</h2>

        <ul>
          <li>✔ Fundamentos do ChatGPT</li>
          <li>✔ Aplicação prática em negócios</li>
          <li>✔ Estratégia de renda com IA</li>
          <li>✔ Acesso imediato</li>
        </ul>

        <p className="price-old">De R$147</p>
        <p className="price-new">Hoje por R$97</p>

        <a
          href="LINK_CHECKOUT_DOWNSELL"
          className="btn-downsell"
        >
          Quero a versão essencial com desconto
        </a>

        <br />

        <a href="/" className="btn-no">
          Não, obrigado
        </a>
      </section>

    </main>
  );
}
