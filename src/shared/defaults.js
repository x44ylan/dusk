export const Modes = Object.freeze({
  system: "system",
  proxy: "proxy"
});

export const fixedProxy = Object.freeze({
  scheme: "http",
  host: "127.0.0.1",
  port: 8080
});

export const fixedBypassList = Object.freeze([
  "localhost",
  "127.0.0.1",
  "<local>"
]);

export const createDefaultState = () => ({
  mode: Modes.system,
  updatedAt: 0
});
