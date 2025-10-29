import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import FinancialListPage from "./components/FinancialListPage";
import { CreateOrEditUserPage } from "./components/CreateOrEditUserPage";
import { UsersPage } from "./components/UsersPage";
import "./index.css";

// Ícones
import { Home, Users, DollarSign, PlusCircle, LogOut } from "lucide-react";

// 🧩 Tela de login simples (somente frontend)
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (user === "admin" && password === "Astel@123!") {
      localStorage.setItem("astelAuth", "true");
      onLogin();
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
            placeholder="Digite o usuário"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="Digite a senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}

// 🔒 Componente protegido
function ProtectedApp() {
  function handleLogout() {
    localStorage.removeItem("astelAuth");
    window.location.reload();
  }

  return (
    <BrowserRouter>
      <header className="navbar">
        <div className="container">
          <div className="brand">
            <Home size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
            ASTEL - Gestão
          </div>

          <nav className="nav-links">
            <NavLink to="/" end>
              <Users size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Dados Cadastrais
            </NavLink>

            <NavLink to="/financeiro">
              <DollarSign size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Dados Financeiros
            </NavLink>

            <NavLink to="/novo">
              <PlusCircle size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Novo Cadastro
            </NavLink>

            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: "6px" }} />
              Sair
            </button>
          </nav>
        </div>
      </header>

      <div className="page-container">
        <Routes>
          <Route path="/" element={<UsersPage />} />
          <Route path="/financeiro" element={<FinancialListPage />} />
          <Route path="/novo" element={<CreateOrEditUserPage />} />
          <Route path="*" element={<h2>Página não encontrada 😢</h2>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// 🚀 Raiz com controle de login
function Root() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("astelAuth") === "true"
  );

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <ProtectedApp />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
