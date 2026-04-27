import { useState } from "react";

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  async function login() {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user, pass })
    });

    if (res.ok) {
      onLogin();
    } else {
      alert("Login errado");
    }
  }

  return (
    <div style={{ color: "#fff", padding: 50 }}>
      <h2>Login</h2>
      <input placeholder="user" onChange={e => setUser(e.target.value)} />
      <br />
      <input placeholder="pass" type="password" onChange={e => setPass(e.target.value)} />
      <br />
      <button onClick={login}>Entrar</button>
    </div>
  );
}
