// HTTP Inspector CLI - Sesion 1

export interface UrlParts {
  protocol: string;
  host: string;
  pathname: string;
  search: string;
  query: Array<[string, string]>;
}

export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

export type Headers = Record<string, string>;

// Dia 1
export function parseUrl(url: string): UrlParts {
  const urlObj = new URL(url);
  return {
    protocol: urlObj.protocol,
    host: urlObj.host,
    pathname: urlObj.pathname,
    search: urlObj.search,
    query: Array.from(urlObj.searchParams.entries()),
  };
}

// Dia 2
export function classifyStatus(code: number): StatusCategory {
  if (code >= 100 && code <= 199) return "1xx Informativo";
  if (code >= 200 && code <= 299) return "2xx Éxito";
  if (code >= 300 && code <= 399) return "3xx Redirección";
  if (code >= 400 && code <= 499) return "4xx Error del cliente";
  if (code >= 500 && code <= 599) return "5xx Error del servidor";
  return "Desconocido";
}

// Dia 3
export function parseHeaders(text: string): Headers {
  const headers: Headers = {};
  for (const line of text.split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const name = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (name === "") continue;
    headers[name] = value;
  }
  return headers;
}

// Dia 3
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string,
): string {
  const parts = parseUrl(url);
  const category = classifyStatus(status);
  const headers = parseHeaders(headersText);

  const headerLines = Object.entries(headers)
    .map(([name, value]) => `  - ${name}: ${value}`)
    .join("\n");

  return [
    "Resumen de la peticion",
    `URL: ${url}`,
    `Host: ${parts.host}`,
    `Path: ${parts.pathname}`,
    `Status: ${status} (${category})`,
    "Headers:",
    headerLines || "  (ninguna)",
  ].join("\n");
}

if (require.main === module) {
  const [, , cmd, ...args] = process.argv;
  try {
    if (cmd === "parse-url" && args[0]) {
      const parts = parseUrl(args[0]);
      console.log(JSON.stringify(parts, null, 2));
    } else if (cmd === "status" && args[0]) {
      const cat = classifyStatus(Number(args[0]));
      console.log(cat);
    } else if (cmd === "headers" && args.length > 0) {
      const h = parseHeaders(args.join(" "));
      console.log(JSON.stringify(h, null, 2));
    } else if (cmd === "summary" && args.length >= 2) {
      const [url, status, ...rest] = args;
      console.log(summarizeRequest(url, Number(status), rest.join(" ")));
    } else {
      console.log("Uso:");
      console.log('  npm start parse-url "https://ejemplo.com/path?a=1"');
      console.log("  npm start status 404");
      console.log('  npm start headers "Content-Type: application/json"');
      console.log('  npm start summary "https://x.com" 200 "Content-Type: application/json"');
    }
  } catch (e) {
    console.error("Error:", (e as Error).message);
    process.exit(1);
  }
}