import { createContext, useContext, useState, useCallback } from "react";

// ─── Expresiones regulares de validación (requisito: almacenadas en Context) ──
const REGEX_ID_POLIZA = /^ID\d{5}$/;
const REGEX_MATRICULA = /^\d{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/;

// ─── Letras válidas para matrícula española ────────────────────────────────────
export const LETRAS_MATRICULA = "BCDFGHJKLMNPRSTVWXYZ";

// ─── Valores permitidos ────────────────────────────────────────────────────────
export const TRANSMISIONES = ["Manual", "Automática"];
export const TIPOS_COMBUSTIBLE = ["Combustión", "Eléctrico"];

const API_BASE = "http://localhost:3001";

// ─── Contexto ─────────────────────────────────────────────────────────────────
const PolizasContext = createContext(null);

export function PolizasProvider({ children }) {
  const [polizas, setPolizas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Carga inicial de pólizas ───────────────────────────────────────────────
  const cargarPolizas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/polizas`);
      if (!res.ok) throw new Error("Error al cargar las pólizas");
      const data = await res.json();
      setPolizas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Obtener póliza por ID ──────────────────────────────────────────────────
  const obtenerPoliza = useCallback(async (id) => {
    const res = await fetch(`${API_BASE}/polizas/${id}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Póliza no encontrada");
    }
    return await res.json();
  }, []);

  // ─── Alta de póliza ─────────────────────────────────────────────────────────
  const crearPoliza = useCallback(async (poliza) => {
    const res = await fetch(`${API_BASE}/polizas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(poliza),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al crear la póliza");
    }
    const nueva = await res.json();
    setPolizas((prev) => [...prev, nueva]);
    return nueva;
  }, []);

  // ─── Actualización de póliza ────────────────────────────────────────────────
  const actualizarPoliza = useCallback(async (poliza) => {
    const res = await fetch(`${API_BASE}/polizas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(poliza),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al actualizar la póliza");
    }
    const actualizada = await res.json();
    setPolizas((prev) =>
      prev.map((p) => (p.id_poliza === actualizada.id_poliza ? actualizada : p))
    );
    return actualizada;
  }, []);

  // ─── Eliminación de póliza ──────────────────────────────────────────────────
  const eliminarPoliza = useCallback(async (id) => {
    const res = await fetch(`${API_BASE}/polizas/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al eliminar la póliza");
    }
    setPolizas((prev) => prev.filter((p) => p.id_poliza !== id));
  }, []);

  // ─── Estadísticas ───────────────────────────────────────────────────────────
  const obtenerEstadisticas = useCallback(async (filtros) => {
    const params = new URLSearchParams(filtros).toString();
    const res = await fetch(`${API_BASE}/estadisticas?${params}`);
    if (!res.ok) throw new Error("Error al obtener estadísticas");
    return await res.json();
  }, []);

  // ─── Validaciones (expresiones regulares en Context) ────────────────────────
  const validarPoliza = useCallback((datos, esEdicion = false) => {
    const errores = {};

    if (!esEdicion) {
      if (!datos.id_poliza) {
        errores.id_poliza = "El identificador es obligatorio";
      } else if (!REGEX_ID_POLIZA.test(datos.id_poliza)) {
        errores.id_poliza = "Formato inválido. Debe ser IDXXXXX (ID seguido de 5 dígitos)";
      }
    }

    if (!datos.matricula && !esEdicion) {
      errores.matricula = "La matrícula es obligatoria";
    } else if (!esEdicion && !REGEX_MATRICULA.test(datos.matricula)) {
      errores.matricula =
        "Formato inválido. Debe ser 4 números + 3 letras válidas (B,C,D,F,G,H,J,K,L,M,N,P,R,S,T,V,W,X,Y,Z)";
    }

    const vigencia = parseInt(datos.vigencia);
    if (datos.vigencia === "" || datos.vigencia === undefined || datos.vigencia === null) {
      errores.vigencia = "La vigencia es obligatoria";
    } else if (isNaN(vigencia) || vigencia < 1 || vigencia > 21) {
      errores.vigencia = "La vigencia debe estar entre 1 y 21 meses";
    }

    const edadCoche = parseInt(datos.edad_coche);
    if (datos.edad_coche === "" || datos.edad_coche === undefined || datos.edad_coche === null) {
      errores.edad_coche = "La edad del coche es obligatoria";
    } else if (isNaN(edadCoche) || edadCoche < 0 || edadCoche > 10) {
      errores.edad_coche = "La edad del coche debe estar entre 0 y 10 años";
    }

    const edadTomador = parseInt(datos.edad_tomador);
    if (datos.edad_tomador === "" || datos.edad_tomador === undefined || datos.edad_tomador === null) {
      errores.edad_tomador = "La edad del tomador es obligatoria";
    } else if (isNaN(edadTomador) || edadTomador < 18 || edadTomador > 90) {
      errores.edad_tomador = "El tomador debe ser mayor de 18 años y menor de 90";
    }

    if (!datos.cilindrada && datos.cilindrada !== 0) {
      errores.cilindrada = "La cilindrada es obligatoria";
    } else if (parseInt(datos.cilindrada) <= 0) {
      errores.cilindrada = "La cilindrada debe ser un valor positivo";
    }

    if (!datos.cilindros && datos.cilindros !== 0) {
      errores.cilindros = "El número de cilindros es obligatorio";
    } else if (parseInt(datos.cilindros) <= 0 || parseInt(datos.cilindros) > 20) {
      errores.cilindros = "El número de cilindros debe estar entre 1 y 20";
    }

    if (!datos.transmision) {
      errores.transmision = "La transmisión es obligatoria";
    } else if (!TRANSMISIONES.includes(datos.transmision)) {
      errores.transmision = "Valor de transmisión no válido";
    }

    if (!datos.comb_electrico) {
      errores.comb_electrico = "El tipo de combustible es obligatorio";
    } else if (!TIPOS_COMBUSTIBLE.includes(datos.comb_electrico)) {
      errores.comb_electrico = "Valor de combustible no válido";
    }

    if (!datos.peso && datos.peso !== 0) {
      errores.peso = "El peso es obligatorio";
    } else if (parseInt(datos.peso) <= 0) {
      errores.peso = "El peso debe ser un valor positivo";
    }

    if (datos.siniestro === "" || datos.siniestro === undefined || datos.siniestro === null) {
      errores.siniestro = "El campo siniestro es obligatorio";
    } else if (![0, 1, "0", "1"].includes(datos.siniestro)) {
      errores.siniestro = "El siniestro debe ser Sí o No";
    }

    return errores;
  }, []);

  return (
    <PolizasContext.Provider
      value={{
        polizas,
        loading,
        error,
        // Regex exportadas desde contexto (requisito)
        regexIdPoliza: REGEX_ID_POLIZA,
        regexMatricula: REGEX_MATRICULA,
        // Operaciones
        cargarPolizas,
        obtenerPoliza,
        crearPoliza,
        actualizarPoliza,
        eliminarPoliza,
        obtenerEstadisticas,
        validarPoliza,
      }}
    >
      {children}
    </PolizasContext.Provider>
  );
}

export function usePolizas() {
  const ctx = useContext(PolizasContext);
  if (!ctx) throw new Error("usePolizas debe usarse dentro de PolizasProvider");
  return ctx;
}
