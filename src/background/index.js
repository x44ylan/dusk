import { browserApi } from "../shared/browser.js";
import { Modes } from "../shared/defaults.js";
import { applyProxyState } from "./proxy-service.js";
import { readState, setMode, writeState } from "./state-store.js";

const iconSizes = [16, 32, 48, 128];

const iconCache = new Map();

const iconColor = stateName => stateName === "on"
  ? "rgba(244, 247, 255, 1)"
  : "rgba(132, 140, 154, 0.58)";

const createIconImageData = (stateName, size) => {
  const scale = size / 64;
  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, size, size);
  context.strokeStyle = iconColor(stateName);
  context.lineWidth = Math.max(2.2, 7 * scale);
  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();
  context.moveTo(32 * scale, 6 * scale);
  context.lineTo(32 * scale, 30 * scale);
  context.stroke();

  context.beginPath();
  context.arc(32 * scale, 32 * scale, 23 * scale, 7 * Math.PI / 4, 13 * Math.PI / 4);
  context.stroke();

  return context.getImageData(0, 0, size, size);
};

const iconImageData = stateName => {
  if (!iconCache.has(stateName)) {
    iconCache.set(stateName, Object.fromEntries(
      iconSizes.map(size => [size, createIconImageData(stateName, size)])
    ));
  }

  return iconCache.get(stateName);
};

const syncActionUi = async state => {
  const action = browserApi?.action;

  if (!action) {
    return;
  }

  const enabled = state.mode === Modes.proxy;
  await Promise.all([
    action.setBadgeText?.({ text: "" }),
    action.setIcon?.({ imageData: iconImageData(enabled ? "on" : "off") }),
    action.setTitle?.({ title: enabled ? "Dusk: proxy on" : "Dusk: off" })
  ]);
};

const applyAndSync = async state => {
  await applyProxyState(state);
  await syncActionUi(state);
  return state;
};

const initialize = async () => {
  await applyAndSync(await writeState(await readState()));
};

const toggleProxy = async () => {
  const state = await readState();
  const nextMode = state.mode === Modes.proxy ? Modes.system : Modes.proxy;
  await applyAndSync(await setMode(nextMode));
};

initialize();

browserApi?.runtime?.onInstalled?.addListener(initialize);
browserApi?.runtime?.onStartup?.addListener(initialize);
browserApi?.action?.onClicked?.addListener(() => {
  toggleProxy().catch(console.error);
});
