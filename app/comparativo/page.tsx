export default function Comparativo() {
  return (
    <main>

      <section className="hero">
        <div className="container center">
          <h1>Escolha seu nível de acesso</h1>
          <p className="subtitle">
            Soluções estruturadas para diferentes níveis de profundidade.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">

          {/* PACK */}
          <div className="card-pricing">
            <h2>Pack Prompts IA</h2>
            <p className="small">Ideal para começar</p>

            <ul>
              <li>✔ Biblioteca de prompts prontos</li>
              <li>✔ Aplicação rápida</li>
              <li>✔ Acesso imediato</li>
              <li>✖ Método estruturado completo</li>
              <li>✖ Estratégia executiva</li>
            </ul>

            <p className="price">R$ 39</p>

            <a
              href="#"
              className="btn-outline"
            >
              Quero começar
            </a>
          </div>

          {/* PROGRAMA */}
          <div className="card-pricing highlight">
            <h2>Programa Executivo Bubles AI™</h2>
            <p className="small">Implementação estratégica completa</p>

            <ul>
              <li>✔ Método estruturado completo</li>
              <li>✔ Aplicação em marketing e vendas</li>
              <li>✔ Estruturação de processos</li>
              <li>✔ Automação prática</li>
              <li>✔ Atualizações incluídas</li>
            </ul>

            <p className="price">R$ 297</p>

            <a
              href="https://pay.kiwify.com.br/dup2Pxz"
              className="btn-primary"
            >
              Quero o Programa Executivo
            </a>
          </div>

        </div>
      </section>

    </main>
  );
}