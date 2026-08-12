import { browserApi, callApi } from "../shared/browser.js";
import { fixedBypassList, Modes } from "../shared/defaults.js";
import { parseProxyUrl } from "../shared/proxy-url.js";

const proxySettings = () => browserApi?.proxy?.settings;

export const createSystemConfig = () => ({
  value: {
    mode: "system"
  },
  scope: "regular"
});

export const createProxyConfig = proxyUrl => ({
  value: {
    mode: "fixed_servers",
    rules: {
      singleProxy: parseProxyUrl(proxyUrl),
      bypassList: [...fixedBypassList]
    }
  },
  scope: "regular"
});

export const createProxyConfigForState = state => (
  state.mode === Modes.proxy ? createProxyConfig(state.proxyUrl) : createSystemConfig()
);

export const applyProxyState = async state => {
  if (!proxySettings()) {
    return { skipped: true };
  }

  const config = createProxyConfigForState(state);
  await callApi(proxySettings(), "set", config);
  return { skipped: false, config };
};
