import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bubles AI™ | Programa Executivo",
  description:
    "Formação executiva para aplicar Inteligência Artificial em marketing, vendas e operação com foco em lucro e escala.",
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
            <nav>
              <a href="/">Início</a>
              <a href="/curso">Programa Executivo</a>
            </nav>
            <a
              href="https://pay.kiwify.com.br/dup2Pxz"
              className="btn-nav"
            >
              Ingressar
            </a>
          </div>
        </header>

        {children}

        <footer className="footer">
          <div className="container">
            © {new Date().getFullYear()} Bubles AI™ — Centro Executivo de Formação
          </div>
        </footer>
      </body>
    </html>
  );
}