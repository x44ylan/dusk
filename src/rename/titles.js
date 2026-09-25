import { browserApi, callApi } from "../shared/browser.js";

const session = () => browserApi?.storage?.session;
const storageKey = "duskRenamedTabs";

// storage.session keeps renames for the current browser session only;
// titles are keyed by tab id, so they die with the tab.
const normalize = value => new Map(Object.entries(
  value && typeof value === "object" ? value : {}
).map(([tabId, title]) => [
  Number(tabId),
  typeof title === "string" && title.trim() ? title.trim() : null
]).filter(([tabId, title]) => Number.isInteger(tabId) && tabId >= 0 && title));

export const readTitles = async () => {
  const store = session();

  if (!store) {
    return new Map();
  }

  const value = await callApi(store, "get", storageKey);
  return normalize(value?.[storageKey]);
};

export const writeTitle = async (tabId, title) => {
  const titles = await readTitles();

  if (title == null || !String(title).trim()) {
    titles.delete(tabId);
  } else {
    titles.set(tabId, String(title).trim());
  }

  const store = session();

  if (store) {
    await callApi(store, "set", { [storageKey]: Object.fromEntries(titles) });
  }

  return titles;
};

export const forgetTab = tabId => writeTitle(tabId, null);
