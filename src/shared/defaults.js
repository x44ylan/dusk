export const Modes = Object.freeze({
  system: "system",
  proxy: "proxy"
});

export const defaultProxyUrl = "http://127.0.0.1:8080";

export const fixedBypassList = Object.freeze([
  "localhost",
  "127.0.0.1",
  "<local>"
]);

export const createDefaultState = () => ({
  mode: Modes.system,
  proxyUrl: defaultProxyUrl,
  updatedAt: 0
});
