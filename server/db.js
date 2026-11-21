'use strict';
// Esquema IDEA §6 + repositorio mínimo. better-sqlite3 es síncrono: transacciones simples, sin pool.
const Database = require('better-sqlite3');

const REQUISITOS_DEFAULT = [
  { tipo: 'carta_compromiso', nombre: 'Carta compromiso firmada', obligatorio: 1 },
  { tipo: 'fotografias', nombre: 'Fotografías del espacio', obligatorio: 1 },
  { tipo: 'logotipos', nombre: 'Logotipos del municipio', obligatorio: 1 },
  { tipo: 'persona_enlace', nombre: 'Persona enlace (nombre, cargo, teléfono)', obligatorio: 1 },
];

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS municipios (
  id INTEGER PRIMARY KEY, nombre TEXT NOT NULL UNIQUE, contacto_email TEXT
);
CREATE TABLE IF NOT EXISTS jornadas (
  id INTEGER PRIMARY KEY, municipio_id INTEGER NOT NULL REFERENCES municipios(id),
  sede TEXT NOT NULL, fecha TEXT NOT NULL, servicios TEXT NOT NULL DEFAULT '[]',
  responsables TEXT NOT NULL DEFAULT '[]', estado TEXT NOT NULL DEFAULT 'en_preparacion',
  creada_en TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS documentos (
  id INTEGER PRIMARY KEY, jornada_id INTEGER NOT NULL REFERENCES jornadas(id),
  tipo TEXT NOT NULL, nombre TEXT NOT NULL, obligatorio INTEGER NOT NULL DEFAULT 1,
  estado TEXT NOT NULL DEFAULT 'pendiente', comentario TEXT, fecha_limite TEXT,
  actualizado_en TEXT NOT NULL, UNIQUE (jornada_id, tipo)
);
CREATE TABLE IF NOT EXISTS versiones (
  id INTEGER PRIMARY KEY, documento_id INTEGER NOT NULL REFERENCES documentos(id),
  n INTEGER NOT NULL, archivo_ruta TEXT NOT NULL, archivo_nombre TEXT, archivo_sha256 TEXT NOT NULL,
  subido_por TEXT NOT NULL, creado_en TEXT NOT NULL, UNIQUE (documento_id, n)
);
CREATE TABLE IF NOT EXISTS cartas (
  id INTEGER PRIMARY KEY, jornada_id INTEGER NOT NULL REFERENCES jornadas(id),
  campos_json TEXT NOT NULL, clausulas_hash TEXT NOT NULL, generada_en TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY, jornada_id INTEGER REFERENCES jornadas(id),
  actor TEXT NOT NULL, accion TEXT NOT NULL, detalle TEXT, creado_en TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS requisitos (
  id INTEGER PRIMARY KEY, tipo TEXT NOT NULL UNIQUE, nombre TEXT NOT NULL,
  obligatorio INTEGER NOT NULL DEFAULT 1, activo INTEGER NOT NULL DEFAULT 1
);
`;

function createDb(dbPath = ':memory:') {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(ESQUEMA);
  const ins = db.prepare('INSERT OR IGNORE INTO requisitos (tipo, nombre, obligatorio) VALUES (?, ?, ?)');
  for (const r of REQUISITOS_DEFAULT) ins.run(r.tipo, r.nombre, r.obligatorio);
  return db;
}

function parseJornada(row) {
  if (!row) return null;
  return { ...row, servicios: JSON.parse(row.servicios), responsables: JSON.parse(row.responsables) };
}

function repo(db) {
  const q = {
    municipioPorNombre: db.prepare('SELECT * FROM municipios WHERE nombre = ?'),
    municipio: db.prepare('SELECT * FROM municipios WHERE id = ?'),
    insMunicipio: db.prepare('INSERT INTO municipios (nombre, contacto_email) VALUES (?, ?)'),
    insJornada: db.prepare(`INSERT INTO jornadas (municipio_id, sede, fecha, servicios, responsables, creada_en)
      VALUES (?, ?, ?, ?, ?, ?)`),
    jornada: db.prepare('SELECT * FROM jornadas WHERE id = ?'),
    jornadas: db.prepare('SELECT * FROM jornadas ORDER BY fecha, id'),
    insDocumento: db.prepare(`INSERT INTO documentos (jornada_id, tipo, nombre, obligatorio, fecha_limite, actualizado_en)
      VALUES (?, ?, ?, ?, ?, ?)`),
    documento: db.prepare('SELECT * FROM documentos WHERE id = ?'),
    documentosDe: db.prepare('SELECT * FROM documentos WHERE jornada_id = ? ORDER BY id'),
    versionesDe: db.prepare(`SELECT id, documento_id, n, archivo_nombre, archivo_sha256, subido_por, creado_en
      FROM versiones WHERE documento_id = ? ORDER BY n`),
    version: db.prepare('SELECT * FROM versiones WHERE documento_id = ? AND n = ?'),
    maxN: db.prepare('SELECT COALESCE(MAX(n), 0) AS n FROM versiones WHERE documento_id = ?'),
    insVersion: db.prepare(`INSERT INTO versiones (documento_id, n, archivo_ruta, archivo_nombre, archivo_sha256, subido_por, creado_en)
      VALUES (?, ?, ?, ?, ?, ?, ?)`),
    setEstado: db.prepare('UPDATE documentos SET estado = ?, comentario = ?, actualizado_en = ? WHERE id = ?'),
    requisitos: db.prepare('SELECT * FROM requisitos WHERE activo = 1 ORDER BY id'),
    insAuditoria: db.prepare('INSERT INTO auditoria (jornada_id, actor, accion, detalle, creado_en) VALUES (?, ?, ?, ?, ?)'),
    auditoriaDe: db.prepare('SELECT * FROM auditoria WHERE jornada_id = ? ORDER BY id'),
  };

  function auditar(jornadaId, actor, accion, detalle, ts) {
    q.insAuditoria.run(jornadaId, actor, accion, detalle ? JSON.stringify(detalle) : null, ts);
  }

  function documentoCompleto(doc) {
    return doc && { ...doc, obligatorio: !!doc.obligatorio, versiones: q.versionesDe.all(doc.id) };
  }

  return {
    q,
    auditar,
    requisitos: () => q.requisitos.all(),
    crearJornada: db.transaction((datos, ts) => {
      let municipio;
      if (datos.municipio_id) {
        municipio = q.municipio.get(datos.municipio_id);
        if (!municipio) throw Object.assign(new Error('municipio_id no existe'), { status: 400 });
      } else {
        municipio = q.municipioPorNombre.get(datos.municipio.nombre);
        if (!municipio) {
          const id = q.insMunicipio.run(datos.municipio.nombre, datos.municipio.contacto_email || null).lastInsertRowid;
          municipio = q.municipio.get(id);
        }
      }
      const jid = q.insJornada.run(municipio.id, datos.sede, datos.fecha,
        JSON.stringify(datos.servicios || []), JSON.stringify(datos.responsables || []), ts).lastInsertRowid;
      for (const r of datos.requisitos) q.insDocumento.run(jid, r.tipo, r.nombre, r.obligatorio ? 1 : 0, r.fecha_limite || null, ts);
      auditar(jid, datos.actor, 'jornada_creada', { requisitos: datos.requisitos.map((r) => r.tipo) }, ts);
      return Number(jid);
    }),
    jornada(id) {
      const j = parseJornada(q.jornada.get(id));
      if (!j) return null;
      j.municipio = q.municipio.get(j.municipio_id);
      j.documentos = q.documentosDe.all(id).map(documentoCompleto);
      return j;
    },
    jornadaIds: () => q.jornadas.all().map((r) => r.id),
    documento: (id) => documentoCompleto(q.documento.get(id)),
    version: (docId, n) => q.version.get(docId, n),
    auditoria: (jid) => q.auditoriaDe.all(jid),
    agregarVersion: db.transaction((docId, archivo, actor, ts) => {
      const doc = q.documento.get(docId);
      const n = q.maxN.get(docId).n + 1;
      q.insVersion.run(docId, n, archivo.ruta, archivo.nombre, archivo.sha256, actor, ts);
      q.setEstado.run('recibido', doc.comentario, ts, docId);
      auditar(doc.jornada_id, actor, 'version_subida', { documento_id: docId, tipo: doc.tipo, n, sha256: archivo.sha256 }, ts);
      return n;
    }),
    revisar: db.transaction((docId, estado, motivo, actor, ts) => {
      const doc = q.documento.get(docId);
      q.setEstado.run(estado, estado === 'observado' ? motivo : null, ts, docId);
      auditar(doc.jornada_id, actor, `documento_${estado}`, { documento_id: docId, tipo: doc.tipo, motivo: motivo || null }, ts);
    }),
  };
}

module.exports = { createDb, repo, REQUISITOS_DEFAULT };
