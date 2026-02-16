import "./globals.css"

export const metadata = {
  title: "Bubles IA",
  description: "Plataforma estratégica de aplicação de Inteligência Artificial"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>

        {/* NAVBAR */}
        <header className="navbar">
          <div className="nav-container">

            <div className="logo">
              Bubles IA
            </div>

            <nav className="nav-links">
              <a href="/">Home</a>
              <a href="/sistema">Sistema</a>
              <a href="/premium">Premium</a>
              <a href="/comparativo">Comparativo</a>
            </nav>

            <a
              href="https://kiwify.app/E1GPb6s"
              className="btn-nav"
            >
              Assinar Premium
            </a>

          </div>
        </header>

        {children}

      </body>
    </html>
  )
}