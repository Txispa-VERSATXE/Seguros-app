import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { PolizasProvider } from "./context/PolizasContext";
import GestionPolizas from "./pages/GestionPolizas";
import Estadisticas from "./pages/Estadisticas";
import "./App.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-nombre">SeguroAuto</span>
        <span className="brand-sub">Gestión de pólizas</span>
      </div>
      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? "nav-link-activo" : ""}`}
        >
          Pólizas
        </NavLink>
        <NavLink
          to="/estadisticas"
          className={({ isActive }) => `nav-link ${isActive ? "nav-link-activo" : ""}`}
        >
          Estadísticas
        </NavLink>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <PolizasProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<GestionPolizas />} />
              <Route path="/estadisticas" element={<Estadisticas />} />
            </Routes>
          </main>
          <footer className="app-footer">
            CIFP Avilés · Diseño Web en Entorno Cliente · 2º DAW
          </footer>
        </div>
      </BrowserRouter>
    </PolizasProvider>
  );
}
