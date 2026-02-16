import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Bubles IA | Formação em Inteligência Artificial Aplicada",
  description:
    "Formação prática em IA aplicada para negócios, produtividade e geração de renda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="header">
          <div className="container nav">
            <div className="logo">
              <Link href="/">Bubles IA</Link>
            </div>

            <nav className="menu">
              <Link href="/">Home</Link>
              <Link href="/curso">Formação</Link>
              <Link href="/pack">Biblioteca</Link>
              <Link href="/embaixadores">Embaixadores</Link>
            </nav>

            <div className="cta-header">
              <Link href="/curso" className="btn-primary">
                Quero Acesso
              </Link>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="footer">
          <div className="container footer-content">
            <div>
              <h4>Bubles IA</h4>
              <p>
                Formação executiva em Inteligência Artificial aplicada a
                negócios e produtividade.
              </p>
            </div>

            <div className="footer-links">
              <Link href="/curso">Formação</Link>
              <Link href="/pack">Biblioteca</Link>
              <Link href="/embaixadores">Embaixadores</Link>
            </div>
          </div>

          <div className="copyright">
            © {new Date().getFullYear()} Bubles IA — Todos os direitos reservados.
          </div>
        </footer>
      </body>
    </html>
  );
}