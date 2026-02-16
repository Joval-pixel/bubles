import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Bubles AI",
  description:
    "Centro Executivo de Aplicação Estratégica em Inteligência Artificial",
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
              <Link href="/metodo">Método</Link>
              <Link href="/curso">Programa Executivo</Link>
              <Link href="/comparativo">Comparativo</Link>
              <Link href="/sobre">Sobre</Link>
            </nav>

            <div className="cta-header">
              <Link href="/curso" className="btn-header">
                Ingressar
              </Link>
            </div>

          </div>
        </header>

        {/* CONTEÚDO */}
        <main>{children}</main>

        {/* FOOTER */}
        <footer className="footer">
          <div className="container footer-grid">

            <div>
              <h4>Bubles AI</h4>
              <p>
                Centro Executivo de Aplicação Estratégica
                em Inteligência Artificial.
              </p>
            </div>

            <div>
              <h4>Institucional</h4>
              <ul>
                <li><Link href="/sobre">Sobre</Link></li>
                <li><Link href="/metodo">Método</Link></li>
              </ul>
            </div>

            <div>
              <h4>Programas</h4>
              <ul>
                <li><Link href="/curso">Programa Executivo</Link></li>
                <li><Link href="/comparativo">Comparativo</Link></li>
              </ul>
            </div>

            <div>
              <h4>Contato</h4>
              <ul>
                <li>Email: contato@bubles.com.br</li>
                <li>Brasil</li>
              </ul>
            </div>

          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} Bubles AI. Todos os direitos reservados.
          </div>
        </footer>

      </body>
    </html>
  );
}