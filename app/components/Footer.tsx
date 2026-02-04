export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          © {new Date().getFullYear()} Bubles IA — Educação em Inteligência Artificial
        </p>

        <small>
          Este site não é afiliado ao Google ou OpenAI.
        </small>
      </div>
    </footer>
  );
}
