import { useState, useEffect } from "react";
import { usePolizas } from "../context/PolizasContext";
import TablaPolizas from "../components/TablaPolizas";
import PolizaForm from "../components/PolizaForm";

export default function GestionPolizas() {
  const { cargarPolizas } = usePolizas();
  const [vista, setVista] = useState("tabla"); // "tabla" | "crear" | "editar"
  const [polizaEditar, setPolizaEditar] = useState(null);

  useEffect(() => {
    cargarPolizas();
  }, [cargarPolizas]);

  function handleEditar(poliza) {
    setPolizaEditar(poliza);
    setVista("editar");
  }

  function handleExitoFormulario() {
    setVista("tabla");
    setPolizaEditar(null);
  }

  function handleCancelar() {
    setVista("tabla");
    setPolizaEditar(null);
  }

  return (
    <div className="gestion-page">
      <div className="page-header">
        <h2>Gestión de pólizas</h2>
        <div className="tabs">
          <button
            className={`tab ${vista === "tabla" ? "tab-activo" : ""}`}
            onClick={() => { setVista("tabla"); setPolizaEditar(null); }}
          >
            Consultar todas
          </button>
          <button
            className={`tab ${vista === "crear" ? "tab-activo" : ""}`}
            onClick={() => { setVista("crear"); setPolizaEditar(null); }}
          >
            Nueva poliza
          </button>
          {vista === "editar" && polizaEditar && (
            <button className="tab tab-activo">
              Editando {polizaEditar.id_poliza}
            </button>
          )}
        </div>
      </div>

      {vista === "tabla" && (
        <TablaPolizas onEditar={handleEditar} />
      )}

      {vista === "crear" && (
        <div className="form-wrapper">
          <h3>Alta de nueva póliza</h3>
          <PolizaForm
            onExito={handleExitoFormulario}
            onCancelar={handleCancelar}
          />
        </div>
      )}

      {vista === "editar" && polizaEditar && (
        <div className="form-wrapper">
          <h3>Editar póliza <span className="id-highlight">{polizaEditar.id_poliza}</span></h3>
          <p className="form-nota">Los campos ID póliza y matrícula no pueden modificarse.</p>
          <PolizaForm
            inicial={polizaEditar}
            onExito={handleExitoFormulario}
            onCancelar={handleCancelar}
          />
        </div>
      )}
    </div>
  );
}
