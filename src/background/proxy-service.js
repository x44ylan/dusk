import { browserApi, callApi } from "../shared/browser.js";
import { fixedBypassList, fixedProxy, Modes } from "../shared/defaults.js";

const proxySettings = () => browserApi?.proxy?.settings;

export const createSystemConfig = () => ({
  value: {
    mode: "system"
  },
  scope: "regular"
});

export const createProxyConfig = () => ({
  value: {
    mode: "fixed_servers",
    rules: {
      singleProxy: fixedProxy,
      bypassList: [...fixedBypassList]
    }
  },
  scope: "regular"
});

export const createProxyConfigForState = state => (
  state.mode === Modes.proxy ? createProxyConfig() : createSystemConfig()
);

export const applyProxyState = async state => {
  if (!proxySettings()) {
    return { skipped: true };
  }

  const config = createProxyConfigForState(state);
  await callApi(proxySettings(), "set", config);
  return { skipped: false, config };
};
