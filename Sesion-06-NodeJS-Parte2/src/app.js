/**
 * Procesador de logs y sistema de inventario — Tarea Sesión 6
 * Universidad Mariano Gálvez de Guatemala · Desarrollo Web
 *
 * Implementa las funciones marcadas con TODO para que los tests pasen.
 * No cambies los nombres exportados ni su firma.
 *
 * Temas de la sesión aplicados aquí:
 *   - ES Modules avanzado (named/default exports, re-exports)  → ./src/index.js
 *   - __dirname/__filename con import.meta.url                 → este archivo
 *   - Streams y pipelines (Transform para filtrar)             → filtrarLogs
 *   - Testing con node:test (unitario + integración)           → tests/
 *   - better-sqlite3 (CRUD, transacciones)                     → ./src/db.js
 */

import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable, Transform } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// __dirname y __filename reproducidos con import.meta.url (ES Modules)
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// =====================================================
// Utilidades (ya implementadas — no las modifiques)
// =====================================================

/**
 * Crea un id único.
 * @returns {string}
 */
export function generarId() {
    return `r-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

/**
 * Filtra las líneas de un archivo de log que contienen un texto y
 * escribe el resultado en otro archivo, usando Streams + pipeline.
 *
 * IMPORTANTE: usa `import { createReadStream, createWriteStream } from 'node:fs'`
 * y `pipeline` de 'node:stream/promises' (ya importados arriba).
 *
 * @param {string} origen  - Ruta del archivo de entrada.
 * @param {string} destino - Ruta del archivo de salida.
 * @param {string} texto   - Texto que deben contener las líneas.
 * @returns {Promise<number>} cantidad de líneas que coincidieron (0 si no hay).
 */
export async function filtrarLogs(origen, destino, texto) {
    let contador = 0;
    let resto = '';
    const filtro = new Transform({
        transform(chunk, encoding, callback) {
            const data = resto + chunk.toString();
            const lineas = data.split('\n');
            resto = lineas.pop();
            for (const linea of lineas) {
                if (linea.includes(texto)) {
                    contador++;
                    this.push(linea + '\n');
                }
            }
            callback();
        },
        flush(callback) {
            if (resto && resto.includes(texto)) {
                contador++;
                this.push(resto + '\n');
            }
            callback();
        }
    });
    await pipeline(createReadStream(origen), filtro, createWriteStream(destino));
    return contador;
}

/**
 * Lee un archivo de texto y devuelve las líneas como arreglo,
 * sin líneas vacías. NO uses readFile: debes usar un Readable + recolección
 * (puedes leer con `createReadStream` y acumular por chunks).
 *
 * @param {string} ruta
 * @returns {Promise<string[]>}
 */
export async function leerLineas(ruta) {
    return new Promise((resolve, reject) => {
        let datos = '';
        const stream = createReadStream(ruta, { encoding: 'utf-8' });
        stream.on('data', chunk => datos += chunk);
        stream.on('error', reject);
        stream.on('end', () => resolve(datos.split('\n').filter(l => l.length > 0)));
    });
}

/**
 * Devuelve una ruta absoluta a partir de una ruta relativa al proyecto.
 * Usa el __dirname que definimos arriba + join.
 *
 * @param {string} rutaRelativa
 * @returns {string}
 */
export function rutaAbsoluta(rutaRelativa) {
    return join(__dirname, rutaRelativa);
}

/**
 * Parsea el contenido de un archivo de configuración ".env" (simple).
 * Formato por línea: CLAVE=VALOR  (ignora líneas vacías y las que empiezan con #).
 * Devuelve un objeto con las claves en mayúsculas.
 *
 * @param {string} contenido
 * @returns {Record<string, string>}
 */
export function parsearEnv(contenido) {
    const resultado = {};
    const lineas = contenido.split('\n');
    for (const linea of lineas) {
        const l = linea.trim();
        if (!l || l.startsWith('#')) continue;
        const idx = l.indexOf('=');
        if (idx === -1) continue;
        const clave = l.slice(0, idx).trim();
        const valor = l.slice(idx + 1).trim();
        if (clave) resultado[clave] = valor;
    }
    return resultado;
}