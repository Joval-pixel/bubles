import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <header className="header">
          <div className="container nav">
            <div className="logo">Bubles AI™</div>

            <nav className="menu">
              <Link href="/">Início</Link>
              <Link href="/curso">Programa Executivo</Link>
              <a
                href="https://pay.kiwify.com.br/dup2Pxz"
                className="btn-header"
              >
                Ingressar
              </a>
            </nav>
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