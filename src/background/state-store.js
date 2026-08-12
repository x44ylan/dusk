import { browserApi, callApi } from "../shared/browser.js";
import { createDefaultState, Modes } from "../shared/defaults.js";
import { normalizeProxyUrlOrDefault } from "../shared/proxy-url.js";

const storage = () => browserApi?.storage?.local;

export const normalizeState = value => ({
  mode: value?.mode === Modes.proxy ? Modes.proxy : Modes.system,
  proxyUrl: normalizeProxyUrlOrDefault(value?.proxyUrl),
  updatedAt: Number.isFinite(value?.updatedAt) ? value.updatedAt : 0
});

export const readState = async () => {
  if (!storage()) {
    return createDefaultState();
  }

  const value = await callApi(storage(), "get", null);
  return normalizeState(value);
};

export const writeState = async patch => {
  const next = normalizeState({
    ...await readState(),
    ...patch,
    updatedAt: Date.now()
  });

  if (storage()) {
    await callApi(storage(), "set", next);
  }

  return next;
};

export const setMode = mode => writeState({
  mode: mode === Modes.proxy ? Modes.proxy : Modes.system
});
