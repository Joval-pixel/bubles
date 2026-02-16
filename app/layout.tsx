import "./globals.css";

export const metadata = {
  title: "Bubles AI",
  description: "Programa Executivo Bubles AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>

        {/* HEADER */}
        <header className="header">
          <div className="container header-inner">
            <div className="logo">Bubles AI™</div>

            <nav className="nav">
              <a href="/">Início</a>
              <a href="#como">Programa Executivo</a>
              <a href="#garantia">Garantia</a>
            </nav>

            <a href="#comprar" className="btn-header">
              Ingressar
            </a>
          </div>
        </header>

        {children}

      </body>
    </html>
  );
}