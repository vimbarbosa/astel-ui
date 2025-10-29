import { useState } from "react";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (user === "admin" && password === "Astel@123!") {
      localStorage.setItem("astelAuth", "true");
      window.location.reload();
    } else {
      setError("Usuário ou senha inválidos.");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🔐 Login - ASTEL</h2>
        <form onSubmit={handleLogin}>
          <label>Usuário</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Digite seu usuário"
          />

          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
