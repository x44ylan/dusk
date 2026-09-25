import { browserApi, callApi } from "../shared/browser.js";
import { forgetTab, readTitles, writeTitle } from "./titles.js";
import { duskApplyTitleOverride } from "./injected/title-override.js";
import { duskShowRenameDialog } from "./injected/rename-dialog.js";

const menuId = "dusk-rename-tab";

const menus = () => browserApi?.contextMenus;
const scripting = () => browserApi?.scripting;
const tabs = () => browserApi?.tabs;

export const createMenu = async () => {
  const api = menus();

  if (!api) {
    return;
  }

  await callApi(api, "removeAll");
  await callApi(api, "create", {
    id: menuId,
    title: "Rename tab\u2026",
    contexts: ["tab"]
  });
};

export const applyTabTitle = async (tabId, title) => {
  const api = scripting();

  if (!api) {
    return;
  }

  await callApi(api, "executeScript", {
    target: { tabId },
    world: "MAIN",
    func: duskApplyTitleOverride,
    args: [title ?? null]
  });
};

export const startRenameFlow = async tabId => {
  const tabsApi = tabs();
  const scriptingApi = scripting();

  if (!tabsApi || !scriptingApi) {
    return;
  }

  // Activate the tab and window so the dialog receives keyboard input.
  try {
    const tab = await callApi(tabsApi, "get", tabId);

    if (tab?.windowId != null) {
      await callApi(browserApi.windows, "update", tab.windowId, { focused: true }).catch(() => {});
    }
  } catch {
    // tab may be gone or not inspectable; the dialog step reports failures
  }

  try {
    await callApi(tabsApi, "update", tabId, { active: true });
  } catch {
    // non-fatal
  }

  let currentTitle = null;

  try {
    currentTitle = (await readTitles()).get(tabId) ?? null;
  } catch {
    // fall back to a blank rename
  }

  await callApi(scriptingApi, "executeScript", {
    target: { tabId },
    func: duskShowRenameDialog,
    args: [currentTitle]
  });
};

export const handleRenameMessage = async (message, sender) => {
  if (message?.type !== "dusk:rename-tab") {
    return;
  }

  const tabId = sender?.tab?.id;

  if (!Number.isInteger(tabId)) {
    return;
  }

  const titles = await writeTitle(tabId, message.title ?? null);
  await applyTabTitle(tabId, titles.get(tabId) ?? null);
};

export const handleTabUpdated = async (tabId, changeInfo) => {
  if (changeInfo?.status !== "loading" && changeInfo?.status !== "complete") {
    return;
  }

  const titles = await readTitles();
  const title = titles.get(tabId);

  if (!title) {
    return;
  }

  try {
    await applyTabTitle(tabId, title);
  } catch {
    // page not scriptable (chrome:// etc.); retried on the next event
  }
};

export const handleTabRemoved = tabId => forgetTab(tabId).catch(() => {});

export const handleTabReplaced = async (addedTabId, removedTabId) => {
  const titles = await readTitles();

  if (!titles.has(removedTabId)) {
    return;
  }

  await writeTitle(addedTabId, titles.get(removedTabId));
  await forgetTab(removedTabId);
};

export const initTabRename = () => {
  browserApi?.runtime?.onInstalled?.addListener(() => {
    createMenu().catch(console.error);
  });

  menus()?.onClicked?.addListener(info => {
    if (info.menuItemId === menuId && Number.isInteger(info.tabId)) {
      startRenameFlow(info.tabId).catch(console.error);
    }
  });

  browserApi?.runtime?.onMessage?.addListener((message, sender) => {
    handleRenameMessage(message, sender).catch(console.error);
  });

  tabs()?.onUpdated?.addListener((tabId, changeInfo) => {
    handleTabUpdated(tabId, changeInfo).catch(console.error);
  });

  tabs()?.onRemoved?.addListener(handleTabRemoved);
  tabs()?.onReplaced?.addListener((addedTabId, removedTabId) => {
    handleTabReplaced(addedTabId, removedTabId).catch(console.error);
  });
};
