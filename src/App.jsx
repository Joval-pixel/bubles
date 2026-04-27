import { useState } from "react";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";

export default function App() {
  const [logged, setLogged] = useState(false);

  function handleLogin() {
    setLogged(true);
  }

  function handleLogout() {
    setLogged(false);
  }

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      {logged ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}
