// Injected into the page's MAIN world via chrome.scripting.executeScript.
// Must stay self-contained: no imports, no references to module scope.

export function duskApplyTitleOverride(title) {
  const marker = "__duskTitleOverride";
  const protoDesc = Object.getOwnPropertyDescriptor(Document.prototype, "title");

  if (!protoDesc) {
    return { ok: false };
  }

  let state = window[marker];

  if (!state) {
    state = {
      custom: null,
      natural: protoDesc.get.call(document),
      getter: null,
      setter: null
    };
    window[marker] = state;
  }

  // Reinstall the property if the page replaced it after us.
  const current = Object.getOwnPropertyDescriptor(document, "title");

  if (!current || current.get !== state.getter) {
    state.getter = () => state.custom ?? state.natural;
    state.setter = value => {
      state.natural = String(value ?? "");

      if (state.custom != null) {
        return;
      }

      protoDesc.set.call(document, state.natural);
    };

    Object.defineProperty(document, "title", {
      configurable: true,
      enumerable: true,
      get: state.getter,
      set: state.setter
    });
  }

  if (title == null || title === "") {
    state.custom = null;
    protoDesc.set.call(document, state.natural);
  } else {
    state.custom = String(title);
    protoDesc.set.call(document, state.custom);
  }

  return { ok: true, title: document.title };
}
