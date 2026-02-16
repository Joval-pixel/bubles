import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bubles AI™",
  description: "Programa Executivo Bubles AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="header">
          <div className="container header-inner">
            <div className="logo">Bubles AI™</div>

            <nav className="nav">
              <a href="#">Início</a>
              <a href="#">Programa Executivo</a>
              <a href="#">Garantia</a>
            </nav>

            <a href="#comprar" className="btn-header">
              Ingressar
            </a>
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}