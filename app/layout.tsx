import "./globals.css";

export const metadata = {
  title: "Bubles IA | ChatGPT e Inteligência Artificial",
  description:
    "Aprenda a usar ChatGPT e Inteligência Artificial para ganhar tempo, produtividade e dinheiro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
