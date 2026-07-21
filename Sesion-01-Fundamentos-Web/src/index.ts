// HTTP Inspector CLI - Sesion 1

/** Partes resultantes de analizar una URL. */
export interface UrlParts {
  protocol: string; // ej. "https:"
  host: string; // ej. "api.ejemplo.com"
  pathname: string; // ej. "/users"
  search: string; // ej. "?id=1"
  query: Array<[string, string]>; // pares clave/valor de la query
}

/** Categoria de un codigo de estado HTTP. */
export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

/** Mapa de cabeceras HTTP. */
export type Headers = Record<string, string>;

// Dia 1
/**
 * Analiza una URL y devuelve sus partes principales.
 * @param url - URL completa a analizar.
 * @returns Protocolo, host, path, query string y query params.
 * @throws Si la URL no es valida.
 */
export function parseUrl(url: string): UrlParts {
  const urlObj = new URL(url); // crea el objeto URL nativo, lanza error si es invalida
  return {
    protocol: urlObj.protocol, // protocolo con ":" al final
    host: urlObj.host, // host, incluye puerto si tiene
    pathname: urlObj.pathname, // ruta despues del host
    search: urlObj.search, // query string con "?" incluido
    query: Array.from(urlObj.searchParams.entries()), // convierte los params a array de pares
  };
}

// Dia 2
/**
 * Clasifica un codigo de estado HTTP en su categoria.
 * @param code - Codigo de estado HTTP.
 * @returns Categoria correspondiente al codigo.
 */
export function classifyStatus(code: number): StatusCategory {
  if (code >= 100 && code <= 199) return "1xx Informativo"; // rango informativo
  if (code >= 200 && code <= 299) return "2xx Éxito"; // rango exito
  if (code >= 300 && code <= 399) return "3xx Redirección"; // rango redireccion
  if (code >= 400 && code <= 499) return "4xx Error del cliente"; // rango error cliente
  if (code >= 500 && code <= 599) return "5xx Error del servidor"; // rango error servidor
  return "Desconocido"; // fuera de los rangos validos
}

// Dia 3
/**
 * Parsea texto con lineas "Nombre: valor" a un objeto de cabeceras.
 * @param text - Texto con una cabecera por linea.
 * @returns Objeto con las cabeceras validas encontradas.
 */
export function parseHeaders(text: string): Headers {
  const headers: Headers = {}; // objeto donde se acumulan las cabeceras
  for (const line of text.split("\n")) {
    // recorre cada linea del texto
    const index = line.indexOf(":"); // busca el primer ":"
    if (index === -1) continue; // sin ":" la linea no es valida, se ignora
    const name = line.slice(0, index).trim(); // nombre antes del ":", sin espacios
    const value = line.slice(index + 1).trim(); // valor despues del ":", sin espacios
    if (name === "") continue; // nombre vacio tampoco es valido
    headers[name] = value; // guarda la cabecera
  }
  return headers;
}

// Dia 3
/**
 * Genera un resumen legible de una peticion HTTP.
 * @param url - URL de la peticion.
 * @param status - Codigo de estado HTTP.
 * @param headersText - Texto con las cabeceras.
 * @returns Resumen en texto plano.
 */
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string,
): string {
  const parts = parseUrl(url); // reusa parseUrl para obtener host y path
  const category = classifyStatus(status); // reusa classifyStatus para la categoria
  const headers = parseHeaders(headersText); // reusa parseHeaders para las cabeceras

  const headerLines = Object.entries(headers) // convierte el objeto en pares [nombre, valor]
    .map(([name, value]) => `  - ${name}: ${value}`) // arma una linea por cabecera
    .join("\n"); // une todas las lineas con salto de linea

  return [
    "Resumen de la peticion", // titulo del resumen
    `URL: ${url}`, // muestra la URL original
    `Host: ${parts.host}`, // muestra el host extraido
    `Path: ${parts.pathname}`, // muestra el path extraido
    `Status: ${status} (${category})`, // muestra codigo y categoria
    "Headers:", // encabezado de la seccion de cabeceras
    headerLines || "  (ninguna)", // lista de cabeceras o mensaje si no hay
  ].join("\n"); // une todas las lineas del resumen
}

if (require.main === module) {
  // solo corre si el archivo se ejecuta directamente, no al importarlo
  const [, , cmd, ...args] = process.argv; // toma el comando y los argumentos de la terminal
  try {
    if (cmd === "parse-url" && args[0]) {
      // comando: parse-url
      const parts = parseUrl(args[0]);
      console.log(JSON.stringify(parts, null, 2)); // imprime el resultado formateado
    } else if (cmd === "status" && args[0]) {
      // comando: status
      const cat = classifyStatus(Number(args[0]));
      console.log(cat);
    } else if (cmd === "headers" && args.length > 0) {
      // comando: headers
      const h = parseHeaders(args.join(" "));
      console.log(JSON.stringify(h, null, 2));
    } else if (cmd === "summary" && args.length >= 2) {
      // comando: summary
      const [url, status, ...rest] = args;
      console.log(summarizeRequest(url, Number(status), rest.join(" ")));
    } else {
      // sin comando valido, muestra ayuda de uso
      console.log("Uso:");
      console.log('  npm start parse-url "https://ejemplo.com/path?a=1"');
      console.log("  npm start status 404");
      console.log('  npm start headers "Content-Type: application/json"');
      console.log('  npm start summary "https://x.com" 200 "Content-Type: application/json"');
    }
  } catch (e) {
    console.error("Error:", (e as Error).message); // captura errores como URL invalida
    process.exit(1); // sale con codigo de error
  }
}