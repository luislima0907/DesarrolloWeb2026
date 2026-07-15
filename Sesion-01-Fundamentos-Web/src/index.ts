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
  const u = new URL(url);
  return {
    protocol: u.protocol,
    host: u.host,
    pathname: u.pathname,
    search: u.search,
    query: Array.from(u.searchParams.entries()),
  };
}

// Dia 2
export function classifyStatus(code: number): StatusCategory {
  throw new Error("Pendiente de implementar");
}

// Dia 3
export function parseHeaders(text: string): Headers {
  throw new Error("Pendiente de implementar");
}

// Dia 3
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string,
): string {
  throw new Error("Pendiente de implementar");
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