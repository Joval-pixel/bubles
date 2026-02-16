import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bubles AI™",
  description: "Centro executivo de formação em Inteligência Artificial aplicada.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <header className="navbar">
          <div className="container nav-container">
            <div className="logo">Bubles AI™</div>

            <nav className="nav-links">
              <a href="/">Início</a>
              <a href="/curso">Programa Executivo</a>
              <a
                href="https://pay.kiwify.com.br/dup2Pxz"
                className="btn-nav"
              >
                Ingressar
              </a>
            </nav>
          </div>
        </header>

        {children}

        <div className="mobile-cta">
          <a href="https://pay.kiwify.com.br/dup2Pxz">
            🔥 Garantir vaga por R$ 197
          </a>
        </div>
      </body>
    </html>
  );
}