import "./globals.css";

export const metadata = {
  title: "Bubles AI",
  description: "Programa Executivo Bubles AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <header>
          <div className="container nav">
            <div className="nav-left">Bubles AI™</div>

            <div className="nav-right">
              <a href="/">Início</a>
              <a href="#programa">Programa Executivo</a>
              <a href="#garantia">Garantia</a>
              <a
                href="https://pay.kiwify.com.br/dup2Pxz"
                className="btn-login"
              >
                Ingressar
              </a>
            </div>
          </div>
        </header>

        {children}

        <div className="floating-cta">
          <a href="https://pay.kiwify.com.br/dup2Pxz">
            🔥 Garantir vaga por R$ 197
          </a>
        </div>
      </body>
    </html>
  );
}