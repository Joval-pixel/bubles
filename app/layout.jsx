import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: "PredictX — Palpites e Estatísticas de Futebol",
  description: "Previsões: 1X2, Mais/Menos 2.5, Ambos Marcam e placares corretos"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <header className="border-b border-black/10 dark:border-white/10 sticky top-0 z-40 bg-white/70 dark:bg-bgDark/70 backdrop-blur">
          <div className="container-max flex items-center justify-between h-16">
            <a href="/" className="font-bold text-lg">PredictX</a>
            <nav className="flex items-center gap-3 text-sm">
              <a className="badge" href="/">Hoje</a>
              <a className="badge" href="/leagues">Ligas</a>
              <a className="badge" href="https://bubles.com.br" target="_blank" rel="noreferrer">Bubles</a>
              <script dangerouslySetInnerHTML={{__html: `(() => {try {const t = localStorage.getItem('theme'); const useDark = t ? t==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.classList.toggle('dark', useDark);} catch(_) {}})();`}} />
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="container-max py-6">{children}</main>
        <footer className="container-max py-10 text-xs text-neutral-600 dark:text-white/60">
          <p>© {new Date().getFullYear()} PredictX — Demonstração educativa. Não é casa de apostas.</p>
        </footer>
      </body>
    </html>
  );
}
