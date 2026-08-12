import { browserApi, callApi } from "../shared/browser.js";
import { defaultProxyUrl, Modes } from "../shared/defaults.js";
import { normalizeProxyUrl } from "../shared/proxy-url.js";

const form = document.querySelector("#proxy-form");
const input = document.querySelector("#proxy-url");
const resetButton = document.querySelector("#reset-button");
const status = document.querySelector("#proxy-status");

const showStatus = (message, type = "") => {
  status.textContent = message;
  status.className = `status ${type}`.trim();
  input.setAttribute("aria-invalid", type === "error" ? "true" : "false");
};

const readState = async () => {
  const value = await callApi(browserApi?.storage?.local, "get", null);
  return {
    mode: value?.mode === Modes.proxy ? Modes.proxy : Modes.system,
    proxyUrl: value?.proxyUrl || defaultProxyUrl
  };
};

const load = async () => {
  const state = await readState();
  input.value = normalizeProxyUrl(state.proxyUrl);
};

const save = async value => {
  const proxyUrl = normalizeProxyUrl(value);
  await callApi(browserApi?.storage?.local, "set", {
    proxyUrl,
    updatedAt: Date.now()
  });

  const state = await readState();
  if (state.mode === Modes.proxy) {
    await callApi(browserApi?.runtime, "sendMessage", { type: "proxy-settings-updated" });
  }

  input.value = proxyUrl;
  showStatus("Saved", "success");
};

form.addEventListener("submit", event => {
  event.preventDefault();
  showStatus("");
  save(input.value).catch(error => showStatus(error.message, "error"));
});

resetButton.addEventListener("click", () => {
  input.value = defaultProxyUrl;
  save(defaultProxyUrl).catch(error => showStatus(error.message, "error"));
});

input.addEventListener("input", () => showStatus(""));

load().catch(error => showStatus(error.message, "error"));
