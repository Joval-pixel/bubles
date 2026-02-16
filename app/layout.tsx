import './globals.css'

export const metadata = {
  title: 'Bubles AI',
  description: 'Centro Executivo de Formação em IA Aplicada',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>
        <header className="header">
          <div className="container nav">
            <div className="logo">Bubles AI</div>
            <nav>
              <a href="/">Home</a>
              <a href="/curso">Programa Executivo</a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="footer">
          <div className="container">
            © 2026 Bubles AI — Centro Executivo de Formação
          </div>
        </footer>
      </body>
    </html>
  )
}