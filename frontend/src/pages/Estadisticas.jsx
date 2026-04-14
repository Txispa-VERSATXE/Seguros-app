import { useState, useEffect } from "react";
import { usePolizas } from "../context/PolizasContext";

const FILTROS_INICIALES = {
  transmision: "Todos",
  comb_electrico: "Todos",
  siniestro: "Todos",
};

function TarjetaStat({ label, valor, subtitulo, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-valor">{valor}</div>
      <div className="stat-label">{label}</div>
      {subtitulo && <div className="stat-subtitulo">{subtitulo}</div>}
    </div>
  );
}

function BarraPorcentaje({ pct, color, label }) {
  return (
    <div className="barra-container">
      <div className="barra-label">{label}</div>
      <div className="barra-track">
        <div
          className={`barra-fill barra-${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="barra-pct">{pct}%</div>
    </div>
  );
}

export default function Estadisticas() {
  const { obtenerEstadisticas } = usePolizas();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function cargarStats(filtrosActuales) {
    setCargando(true);
    setError("");
    try {
      const resultado = await obtenerEstadisticas(filtrosActuales);
      setStats(resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarStats(filtros);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiltro(e) {
    const { name, value } = e.target;
    const nuevosFiltros = { ...filtros, [name]: value };
    setFiltros(nuevosFiltros);
    cargarStats(nuevosFiltros);
  }

  function resetFiltros() {
    setFiltros(FILTROS_INICIALES);
    cargarStats(FILTROS_INICIALES);
  }

  return (
    <div className="estadisticas-page">
      <div className="page-header">
        <h2>Estadísticas de pólizas</h2>
        <p className="page-desc">
          Analiza las pólizas aplicando filtros. Los cálculos se realizan en el servidor.
        </p>
      </div>

      {/* Panel de filtros */}
      <div className="filtros-panel">
        <h3 className="filtros-titulo">Filtros</h3>
        <div className="filtros-grid">
          <div className="filtro-campo">
            <label htmlFor="f-transmision">Transmisión</label>
            <select id="f-transmision" name="transmision" value={filtros.transmision} onChange={handleFiltro}>
              <option value="Todos">Todas</option>
              <option value="Manual">Manual</option>
              <option value="Automática">Automática</option>
            </select>
          </div>

          <div className="filtro-campo">
            <label htmlFor="f-combustible">Tipo de vehículo</label>
            <select id="f-combustible" name="comb_electrico" value={filtros.comb_electrico} onChange={handleFiltro}>
              <option value="Todos">Todos</option>
              <option value="Combustión">Combustión</option>
              <option value="Eléctrico">Eléctrico</option>
            </select>
          </div>

          <div className="filtro-campo">
            <label htmlFor="f-siniestro">Siniestro</label>
            <select id="f-siniestro" name="siniestro" value={filtros.siniestro} onChange={handleFiltro}>
              <option value="Todos">Todos</option>
              <option value="0">Sin siniestro</option>
              <option value="1">Con siniestro</option>
            </select>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={resetFiltros}>
          Restablecer filtros
        </button>
      </div>

      {/* Resultados */}
      {error && <div className="alerta alerta-error">{error}</div>}

      {cargando && <div className="estado-carga">Calculando estadísticas...</div>}

      {!cargando && stats && (
        <>
          {stats.total === 0 ? (
            <div className="estadisticas-vacio">
              No hay pólizas que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <>
              {/* Tarjetas de resumen */}
              <div className="stats-grid">
                <TarjetaStat
                  label="Total pólizas"
                  valor={stats.total}
                  color="azul"
                />
                <TarjetaStat
                  label="Con siniestro"
                  valor={stats.conSiniestro}
                  subtitulo={`${stats.pctConSiniestro}% del total`}
                  color="rojo"
                />
                <TarjetaStat
                  label="Sin siniestro"
                  valor={stats.sinSiniestro}
                  subtitulo={`${stats.pctSinSiniestro}% del total`}
                  color="verde"
                />
                <TarjetaStat
                  label="Media edad coche"
                  valor={`${stats.mediaEdadCoche} años`}
                  color="naranja"
                />
                <TarjetaStat
                  label="Media edad tomador"
                  valor={`${stats.mediaEdadTomador} años`}
                  color="morado"
                />
              </div>

              {/* Gráfico de barras de siniestros */}
              <div className="barras-panel">
                <h3>Distribución de siniestros</h3>
                <BarraPorcentaje
                  pct={stats.pctConSiniestro}
                  color="rojo"
                  label="Con siniestro"
                />
                <BarraPorcentaje
                  pct={stats.pctSinSiniestro}
                  color="verde"
                  label="Sin siniestro"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
