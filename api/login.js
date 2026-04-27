export default function handler(req, res) {
  const { user, pass } = req.body;

  if (user === "admin" && pass === "123") {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: "Login inválido" });
}
