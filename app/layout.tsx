import "./globals.css";

export const metadata = {
  title: "Bubles AI™",
  description: "Centro Executivo de Formação em Inteligência Artificial aplicada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <header className="header">
          <div className="container header-inner">
            <div className="logo">Bubles AI™</div>

            <nav className="nav">
              <a href="/">Início</a>
              <a href="/curso">Programa Executivo</a>
            </nav>

            <a
              href="https://pay.kiwify.com.br/dup2Pxz"
              className="btn-header"
            >
              Ingressar
            </a>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}