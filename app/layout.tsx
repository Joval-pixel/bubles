import "./globals.css";

export const metadata = {
  title: "Bubles AI",
  description: "Centro Executivo de Formação em IA aplicada",
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