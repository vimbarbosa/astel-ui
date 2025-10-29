import LoginPage from "./pages/LoginPage";
import { Outlet } from "react-router-dom";

export default function App() {
  const isAuthenticated = localStorage.getItem("astelAuth") === "true";

  console.log("User authenticated:", isAuthenticated);
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  function handleLogout() {
    localStorage.removeItem("astelAuth");
    window.location.reload();
  }

  return (
    <div>
      <header className="app-header">
        <h1>📋 Sistema ASTEL</h1>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
