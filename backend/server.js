const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, "seguros.json");

app.use(cors());
app.use(express.json());

// ─── Utilidades ───────────────────────────────────────────────────────────────

function leerPolizas() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function escribirPolizas(polizas) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(polizas, null, 2), "utf-8");
}

// ─── GET /polizas ─ Listado completo ──────────────────────────────────────────
app.get("/polizas", (req, res) => {
  try {
    const polizas = leerPolizas();
    res.json(polizas);
  } catch (err) {
    res.status(500).json({ error: "Error al leer los datos" });
  }
});

// ─── GET /polizas/:id_poliza ─ Detalle de una póliza ─────────────────────────
app.get("/polizas/:id_poliza", (req, res) => {
  try {
    const polizas = leerPolizas();
    const poliza = polizas.find((p) => p.id_poliza === req.params.id_poliza);
    if (!poliza) {
      return res.status(404).json({ error: "Póliza no encontrada" });
    }
    res.json(poliza);
  } catch (err) {
    res.status(500).json({ error: "Error al leer los datos" });
  }
});

// ─── POST /polizas ─ Alta de nueva póliza ─────────────────────────────────────
app.post("/polizas", (req, res) => {
  try {
    const polizas = leerPolizas();
    const nueva = req.body;

    // Verificar que el id_poliza no existe ya
    if (polizas.some((p) => p.id_poliza === nueva.id_poliza)) {
      return res.status(409).json({ error: "Ya existe una póliza con ese identificador" });
    }

    // Verificar que la matrícula no existe ya
    if (polizas.some((p) => p.matricula === nueva.matricula)) {
      return res.status(409).json({ error: "Ya existe una póliza con esa matrícula" });
    }

    // Asegurar tipos numéricos
    nueva.vigencia = parseInt(nueva.vigencia);
    nueva.edad_coche = parseInt(nueva.edad_coche);
    nueva.edad_tomador = parseInt(nueva.edad_tomador);
    nueva.cilindrada = parseInt(nueva.cilindrada);
    nueva.cilindros = parseInt(nueva.cilindros);
    nueva.peso = parseInt(nueva.peso);
    nueva.siniestro = parseInt(nueva.siniestro);

    polizas.push(nueva);
    escribirPolizas(polizas);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: "Error al guardar los datos" });
  }
});

// ─── PUT /polizas ─ Actualización de póliza ───────────────────────────────────
app.put("/polizas", (req, res) => {
  try {
    const polizas = leerPolizas();
    const actualizada = req.body;
    const index = polizas.findIndex((p) => p.id_poliza === actualizada.id_poliza);

    if (index === -1) {
      return res.status(404).json({ error: "Póliza no encontrada" });
    }

    // Preservar id_poliza y matricula originales (no modificables)
    actualizada.id_poliza = polizas[index].id_poliza;
    actualizada.matricula = polizas[index].matricula;

    // Asegurar tipos numéricos
    actualizada.vigencia = parseInt(actualizada.vigencia);
    actualizada.edad_coche = parseInt(actualizada.edad_coche);
    actualizada.edad_tomador = parseInt(actualizada.edad_tomador);
    actualizada.cilindrada = parseInt(actualizada.cilindrada);
    actualizada.cilindros = parseInt(actualizada.cilindros);
    actualizada.peso = parseInt(actualizada.peso);
    actualizada.siniestro = parseInt(actualizada.siniestro);

    polizas[index] = actualizada;
    escribirPolizas(polizas);
    res.json(actualizada);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar los datos" });
  }
});

// ─── DELETE /polizas/:id_poliza ─ Eliminación de póliza ──────────────────────
app.delete("/polizas/:id_poliza", (req, res) => {
  try {
    const polizas = leerPolizas();
    const index = polizas.findIndex((p) => p.id_poliza === req.params.id_poliza);

    if (index === -1) {
      return res.status(404).json({ error: "Póliza no encontrada" });
    }

    const eliminada = polizas.splice(index, 1)[0];
    escribirPolizas(polizas);
    res.json({ mensaje: "Póliza eliminada correctamente", poliza: eliminada });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la póliza" });
  }
});

// ─── GET /estadisticas ─ Estadísticas con filtros ─────────────────────────────
app.get("/estadisticas", (req, res) => {
  try {
    const { transmision, comb_electrico, siniestro } = req.query;
    let polizas = leerPolizas();

    // Aplicar filtros si se proporcionan
    if (transmision && transmision !== "Todos") {
      polizas = polizas.filter((p) => p.transmision === transmision);
    }
    if (comb_electrico && comb_electrico !== "Todos") {
      polizas = polizas.filter((p) => p.comb_electrico === comb_electrico);
    }
    if (siniestro !== undefined && siniestro !== "Todos") {
      polizas = polizas.filter((p) => p.siniestro === parseInt(siniestro));
    }

    const total = polizas.length;

    if (total === 0) {
      return res.json({
        total: 0,
        conSiniestro: 0,
        sinSiniestro: 0,
        pctConSiniestro: 0,
        pctSinSiniestro: 0,
        mediaEdadCoche: 0,
        mediaEdadTomador: 0,
      });
    }

    const conSiniestro = polizas.filter((p) => p.siniestro === 1).length;
    const sinSiniestro = total - conSiniestro;
    const pctConSiniestro = ((conSiniestro / total) * 100).toFixed(2);
    const pctSinSiniestro = ((sinSiniestro / total) * 100).toFixed(2);
    const mediaEdadCoche = (
      polizas.reduce((acc, p) => acc + p.edad_coche, 0) / total
    ).toFixed(2);
    const mediaEdadTomador = (
      polizas.reduce((acc, p) => acc + p.edad_tomador, 0) / total
    ).toFixed(2);

    res.json({
      total,
      conSiniestro,
      sinSiniestro,
      pctConSiniestro: parseFloat(pctConSiniestro),
      pctSinSiniestro: parseFloat(pctSinSiniestro),
      mediaEdadCoche: parseFloat(mediaEdadCoche),
      mediaEdadTomador: parseFloat(mediaEdadTomador),
    });
  } catch (err) {
    res.status(500).json({ error: "Error al calcular estadísticas" });
  }
});

// ─── Arranque del servidor ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
