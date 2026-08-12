import { defaultProxyUrl } from "./defaults.js";

const supportedSchemes = new Set(["http", "https", "socks4", "socks5"]);
const defaultPorts = Object.freeze({
  http: 80,
  https: 443,
  socks4: 1080,
  socks5: 1080
});

export const parseProxyUrl = value => {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid URL, such as http://127.0.0.1:8080.");
  }

  const scheme = url.protocol.replace(":", "");

  if (!supportedSchemes.has(scheme)) {
    throw new Error("Use an http, https, socks4, or socks5 proxy URL.");
  }

  const hasPath = url.pathname !== "" && url.pathname !== "/";

  if (!url.hostname || url.username || url.password || hasPath || url.search || url.hash) {
    throw new Error("Enter only the proxy address and port; paths and credentials are not supported.");
  }

  const port = url.port ? Number(url.port) : defaultPorts[scheme];

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("The proxy port must be between 1 and 65535.");
  }

  const host = url.hostname.startsWith("[") && url.hostname.endsWith("]")
    ? url.hostname.slice(1, -1)
    : url.hostname;

  return { scheme, host, port };
};

export const normalizeProxyUrl = value => {
  const proxy = parseProxyUrl(value || defaultProxyUrl);
  const host = proxy.host.includes(":") ? `[${proxy.host}]` : proxy.host;
  return `${proxy.scheme}://${host}:${proxy.port}`;
};

export const normalizeProxyUrlOrDefault = value => {
  try {
    return normalizeProxyUrl(value);
  } catch {
    return defaultProxyUrl;
  }
};
