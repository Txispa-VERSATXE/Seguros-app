import { useState } from "react";
import { usePolizas } from "../context/PolizasContext";

export default function TablaPolizas({ onEditar }) {
  const { polizas, loading, error, eliminarPoliza } = usePolizas();
  const [eliminando, setEliminando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [idEliminarManual, setIdEliminarManual] = useState("");

  async function handleEliminar(id) {
    if (!window.confirm(`¿Seguro que deseas eliminar la póliza ${id}?`)) return;
    setEliminando(id);
    setMensajeError("");

    try {
      await eliminarPoliza(id);
    } catch (err) {
      setMensajeError(err.message);
    } finally {
      setEliminando(null);
    }
  }

  async function handleEliminarManual(e) {
    e.preventDefault();
    if (!idEliminarManual.trim()) return;
    await handleEliminar(idEliminarManual.trim());
    setIdEliminarManual("");
  }

  const polizasFiltradas = polizas.filter((p) => {
    const termino = busqueda.toLowerCase();
    return (
      p.id_poliza.toLowerCase().includes(termino) ||
      p.matricula.toLowerCase().includes(termino) ||
      p.transmision.toLowerCase().includes(termino) ||
      p.comb_electrico.toLowerCase().includes(termino)
    );
  });

  if (loading) return <div className="estado-carga">Cargando pólizas...</div>;
  if (error) return <div className="alerta alerta-error">{error}</div>;

  return (
    <div className="tabla-container">
      <div className="tabla-controles">

        {/* BUSCADOR */}
        <div className="busqueda-wrapper">
          <input
            type="text"
            placeholder="Buscar por ID, matrícula, transmisión..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
          {busqueda && (
            <button className="btn-limpiar" onClick={() => setBusqueda("")}>
              ✕
            </button>
          )}
        </div>

        {/* FORM ELIMINAR POR ID */}
        <div className="form-eliminar">
          <form className="form-eliminar-id" onSubmit={handleEliminarManual}>
            <label htmlFor="idEliminar">Eliminar póliza por ID:</label>

            <div className="form-eliminar-fila">
              <input
                id="idEliminar"
                type="text"
                placeholder="ID00001"
                value={idEliminarManual}
                onChange={(e) => setIdEliminarManual(e.target.value)}
                className="input-id-eliminar"
                maxLength={7}
              />

              <button
                type="submit"
                className="btn-eliminar-form"
                disabled={!idEliminarManual}
              >
                Eliminar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ERROR */}
      {mensajeError && (
        <div className="alerta alerta-error">{mensajeError}</div>
      )}

      {/* INFO */}
      <div className="tabla-info">
        Mostrando <strong>{polizasFiltradas.length}</strong> de{" "}
        <strong>{polizas.length}</strong> pólizas
      </div>

      {/* TABLA */}
      <div className="tabla-scroll">
        <table className="tabla-polizas">
          <thead>
            <tr>
              <th>ID Póliza</th>
              <th>Matrícula</th>
              <th>Vigencia</th>
              <th>Edad Coche</th>
              <th>Edad Tomador</th>
              <th>Cilindrada</th>
              <th>Cilindros</th>
              <th>Transmisión</th>
              <th>Combustible</th>
              <th>Peso (kg)</th>
              <th>Siniestro</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {polizasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={12} className="tabla-vacia">
                  {busqueda
                    ? "No se encontraron resultados"
                    : "No hay pólizas registradas"}
                </td>
              </tr>
            ) : (
              polizasFiltradas.map((p) => (
                <tr
                  key={p.id_poliza}
                  className={eliminando === p.id_poliza ? "fila-eliminando" : ""}
                >
                  <td className="celda-id">{p.id_poliza}</td>
                  <td className="celda-matricula">{p.matricula}</td>
                  <td>{p.vigencia} m</td>
                  <td>{p.edad_coche} a</td>
                  <td>{p.edad_tomador} a</td>
                  <td>{p.cilindrada} cc</td>
                  <td>{p.cilindros}</td>

                  <td>
                    <span
                      className={`badge badge-${
                        p.transmision === "Automática" ? "auto" : "manual"
                      }`}
                    >
                      {p.transmision}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge badge-${
                        p.comb_electrico === "Eléctrico"
                          ? "electrico"
                          : "combustion"
                      }`}
                    >
                      {p.comb_electrico}
                    </span>
                  </td>

                  <td>{p.peso}</td>

                  <td>
                    <span
                      className={`badge badge-siniestro-${p.siniestro}`}
                    >
                      {p.siniestro === 1 ? "Sí" : "No"}
                    </span>
                  </td>

                  <td className="celda-acciones">
                    <button
                      className="btn-accion btn-editar"
                      onClick={() => onEditar(p)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-accion btn-eliminar"
                      onClick={() => handleEliminar(p.id_poliza)}
                      disabled={eliminando === p.id_poliza}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
