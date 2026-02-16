import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Bubles AI",
  description: "Centro Executivo de Aplicação Estratégica em Inteligência Artificial",
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
          <div className="container nav">

            <div className="logo">
              <Link href="/">Bubles AI</Link>
            </div>

            <nav className="menu">
              <Link href="/">Início</Link>
              <Link href="/curso">Programa Executivo</Link>
            </nav>

            <div className="cta-header">
              <Link href="/curso" className="btn-header">
                Ingressar
              </Link>
            </div>

          </div>
        </header>

        {children}

      </body>
    </html>
  );
}