import { useState, useEffect } from "react";
import { usePolizas, TRANSMISIONES, TIPOS_COMBUSTIBLE } from "../context/PolizasContext";

const CAMPO_LABELS = {
  id_poliza: "ID Póliza",
  vigencia: "Vigencia (meses)",
  matricula: "Matrícula",
  edad_coche: "Edad del coche (años)",
  edad_tomador: "Edad del tomador",
  cilindrada: "Cilindrada (cc)",
  cilindros: "Nº Cilindros",
  transmision: "Transmisión",
  comb_electrico: "Tipo de vehículo",
  peso: "Peso (kg)",
  siniestro: "Siniestro",
};

const CAMPO_PLACEHOLDERS = {
  id_poliza: "IDxxxxx (p.ej. ID00001)",
  vigencia: "1 - 21",
  matricula: "4 dígitos + 3 letras (p.ej. 1234BCD)",
  edad_coche: "0 - 10",
  edad_tomador: "18 - 90",
  cilindrada: "En cc (p.ej. 1200)",
  cilindros: "1 - 20",
  peso: "En kg (p.ej. 1250)",
};

function CampoError({ mensaje }) {
  if (!mensaje) return null;
  return <span className="campo-error">{mensaje}</span>;
}

export default function PolizaForm({ inicial = null, onExito, onCancelar }) {
  const { crearPoliza, actualizarPoliza, validarPoliza } = usePolizas();
  const esEdicion = !!inicial;

  const estadoVacio = {
    id_poliza: "",
    vigencia: "",
    matricula: "",
    edad_coche: "",
    edad_tomador: "",
    cilindrada: "",
    cilindros: "",
    transmision: "",
    comb_electrico: "",
    peso: "",
    siniestro: "",
  };

  const [form, setForm] = useState(inicial || estadoVacio);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    if (inicial) setForm(inicial);
  }, [inicial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al modificarlo
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensajeExito("");
    setMensajeError("");

    const nuevosErrores = validarPoliza(form, esEdicion);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        ...form,
        vigencia: parseInt(form.vigencia),
        edad_coche: parseInt(form.edad_coche),
        edad_tomador: parseInt(form.edad_tomador),
        cilindrada: parseInt(form.cilindrada),
        cilindros: parseInt(form.cilindros),
        peso: parseInt(form.peso),
        siniestro: parseInt(form.siniestro),
      };

      if (esEdicion) {
        await actualizarPoliza(payload);
        setMensajeExito("Póliza actualizada correctamente");
      } else {
        await crearPoliza(payload);
        setMensajeExito("Póliza creada correctamente");
        setForm(estadoVacio);
      }
      if (onExito) onExito();
    } catch (err) {
      setMensajeError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="poliza-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        {/* ID Póliza */}
        {!esEdicion && (
          <div className="form-campo">
            <label htmlFor="id_poliza">{CAMPO_LABELS.id_poliza}</label>
            <input
              id="id_poliza"
              name="id_poliza"
              type="text"
              value={form.id_poliza}
              onChange={handleChange}
              placeholder={CAMPO_PLACEHOLDERS.id_poliza}
              maxLength={7}
              className={errores.id_poliza ? "input-error" : ""}
            />
            <CampoError mensaje={errores.id_poliza} />
          </div>
        )}

        {/* Matrícula */}
        {!esEdicion && (
          <div className="form-campo">
            <label htmlFor="matricula">{CAMPO_LABELS.matricula}</label>
            <input
              id="matricula"
              name="matricula"
              type="text"
              value={form.matricula}
              onChange={handleChange}
              placeholder={CAMPO_PLACEHOLDERS.matricula}
              maxLength={7}
              className={errores.matricula ? "input-error" : ""}
            />
            <CampoError mensaje={errores.matricula} />
          </div>
        )}

        {/* Si es edición, mostrar ID y matrícula como campos de solo lectura */}
        {esEdicion && (
          <>
            <div className="form-campo">
              <label>{CAMPO_LABELS.id_poliza}</label>
              <input
                type="text"
                value={form.id_poliza}
                disabled
                className="input-disabled"
                title="El ID de póliza no puede modificarse"
              />
            </div>
            <div className="form-campo">
              <label>{CAMPO_LABELS.matricula}</label>
              <input
                type="text"
                value={form.matricula}
                disabled
                className="input-disabled"
                title="La matrícula no puede modificarse"
              />
            </div>
          </>
        )}

        {/* Vigencia */}
        <div className="form-campo">
          <label htmlFor="vigencia">{CAMPO_LABELS.vigencia}</label>
          <input
            id="vigencia"
            name="vigencia"
            type="number"
            value={form.vigencia}
            onChange={handleChange}
            placeholder={CAMPO_PLACEHOLDERS.vigencia}
            min={1}
            max={21}
            className={errores.vigencia ? "input-error" : ""}
          />
          <CampoError mensaje={errores.vigencia} />
        </div>

        {/* Edad del coche */}
        <div className="form-campo">
          <label htmlFor="edad_coche">{CAMPO_LABELS.edad_coche}</label>
          <input
            id="edad_coche"
            name="edad_coche"
            type="number"
            value={form.edad_coche}
            onChange={handleChange}
            placeholder={CAMPO_PLACEHOLDERS.edad_coche}
            min={0}
            max={10}
            className={errores.edad_coche ? "input-error" : ""}
          />
          <CampoError mensaje={errores.edad_coche} />
        </div>

        {/* Edad del tomador */}
        <div className="form-campo">
          <label htmlFor="edad_tomador">{CAMPO_LABELS.edad_tomador}</label>
          <input
            id="edad_tomador"
            name="edad_tomador"
            type="number"
            value={form.edad_tomador}
            onChange={handleChange}
            placeholder={CAMPO_PLACEHOLDERS.edad_tomador}
            min={18}
            max={90}
            className={errores.edad_tomador ? "input-error" : ""}
          />
          <CampoError mensaje={errores.edad_tomador} />
        </div>

        {/* Cilindrada */}
        <div className="form-campo">
          <label htmlFor="cilindrada">{CAMPO_LABELS.cilindrada}</label>
          <input
            id="cilindrada"
            name="cilindrada"
            type="number"
            value={form.cilindrada}
            onChange={handleChange}
            placeholder={CAMPO_PLACEHOLDERS.cilindrada}
            min={1}
            className={errores.cilindrada ? "input-error" : ""}
          />
          <CampoError mensaje={errores.cilindrada} />
        </div>

        {/* Cilindros */}
        <div className="form-campo">
          <label htmlFor="cilindros">{CAMPO_LABELS.cilindros}</label>
          <input
            id="cilindros"
            name="cilindros"
            type="number"
            value={form.cilindros}
            onChange={handleChange}
            placeholder={CAMPO_PLACEHOLDERS.cilindros}
            min={1}
            max={20}
            className={errores.cilindros ? "input-error" : ""}
          />
          <CampoError mensaje={errores.cilindros} />
        </div>

        {/* Transmisión */}
        <div className="form-campo">
          <label htmlFor="transmision">{CAMPO_LABELS.transmision}</label>
          <select
            id="transmision"
            name="transmision"
            value={form.transmision}
            onChange={handleChange}
            className={errores.transmision ? "input-error" : ""}
          >
            <option value="">-- Seleccionar --</option>
            {TRANSMISIONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <CampoError mensaje={errores.transmision} />
        </div>

        {/* Combustible / Eléctrico */}
        <div className="form-campo">
          <label htmlFor="comb_electrico">{CAMPO_LABELS.comb_electrico}</label>
          <select
            id="comb_electrico"
            name="comb_electrico"
            value={form.comb_electrico}
            onChange={handleChange}
            className={errores.comb_electrico ? "input-error" : ""}
          >
            <option value="">-- Seleccionar --</option>
            {TIPOS_COMBUSTIBLE.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <CampoError mensaje={errores.comb_electrico} />
        </div>

        {/* Peso */}
        <div className="form-campo">
          <label htmlFor="peso">{CAMPO_LABELS.peso}</label>
          <input
            id="peso"
            name="peso"
            type="number"
            value={form.peso}
            onChange={handleChange}
            placeholder={CAMPO_PLACEHOLDERS.peso}
            min={1}
            className={errores.peso ? "input-error" : ""}
          />
          <CampoError mensaje={errores.peso} />
        </div>

        {/* Siniestro */}
        <div className="form-campo">
          <label htmlFor="siniestro">{CAMPO_LABELS.siniestro}</label>
          <select
            id="siniestro"
            name="siniestro"
            value={form.siniestro}
            onChange={handleChange}
            className={errores.siniestro ? "input-error" : ""}
          >
            <option value="">-- Seleccionar --</option>
            <option value="0">No</option>
            <option value="1">Sí</option>
          </select>
          <CampoError mensaje={errores.siniestro} />
        </div>
      </div>

      {mensajeExito && <div className="alerta alerta-exito">{mensajeExito}</div>}
      {mensajeError && <div className="alerta alerta-error">{mensajeError}</div>}

      <div className="form-acciones">
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Guardando..." : esEdicion ? "Actualizar póliza" : "Crear póliza"}
        </button>
        {onCancelar && (
          <button type="button" className="btn btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
