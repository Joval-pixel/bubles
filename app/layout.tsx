import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bubles AI™",
  description: "Programa Executivo Bubles AI™",
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
          <div className="container nav">

            <div className="logo">Bubles AI™</div>

            <nav className="menu">
              <a href="#inicio">Início</a>
              <a href="#programa">Programa Executivo</a>
              <a href="#garantia">Garantia</a>
            </nav>

            <a
              href="https://pay.kiwify.com.br/3veb8Bd"
              target="_blank"
              rel="noopener noreferrer"
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
