import "./globals.css";
import Link from "next/link";

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
        <header className="navbar">
          <div className="nav-container">
            <div className="logo">Bubles AI™</div>

            <nav className="nav-links">
              <Link href="/">Início</Link>
              <Link href="/curso">Programa Executivo</Link>
              <a
                href="https://kiwify.app/E1GPb6s"
                target="_blank"
                className="btn-login"
              >
                Ingressar
              </a>
            </nav>
          </div>
        </header>

        {children}

        <a
          href="https://pay.kiwify.com.br/dup2Pxz"
          target="_blank"
          className="floating-cta"
        >
          🔥 Garantir vaga por R$ 197
        </a>
      </body>
    </html>
  );
}