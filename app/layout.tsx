import "./globals.css";

export const metadata = {
  title: "Bubles IA",
  description: "Curso de ChatGPT e Inteligência Artificial para ganhar produtividade e dinheiro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
