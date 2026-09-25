// Injected into the tab's ISOLATED world via chrome.scripting.executeScript.
// Must stay self-contained: no imports, no references to module scope.
// Renders a Dusk-styled rename dialog inside a closed shadow root.

export function duskShowRenameDialog(currentTitle) {
  const hostId = "dusk-rename-tab-host";
  const existing = document.getElementById(hostId);

  if (existing) {
    existing.remove();
  }

  const host = document.createElement("div");
  host.id = hostId;
  host.style.cssText = "all: initial; position: fixed; inset: 0; z-index: 2147483647;";

  const root = host.attachShadow({ mode: "closed" });

  root.innerHTML = `
    <style>
      :host { all: initial; }
      .backdrop {
        position: fixed; inset: 0;
        display: grid; place-items: center;
        background: rgba(10, 10, 12, 0.62);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .card {
        width: min(440px, calc(100vw - 48px));
        border: 3px solid #f4f4f5;
        background: #19191b;
        box-shadow: 9px 9px 0 #1e3a8a;
        padding: 22px;
        color: #f4f4f5;
      }
      label {
        display: block; margin: 0 0 9px;
        font-size: 13px; font-weight: 900; text-transform: uppercase;
      }
      input {
        width: 100%; border: 3px solid #f4f4f5; border-radius: 0;
        background: #27272a; padding: 13px 14px; color: #f4f4f5;
        font: 700 16px/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        outline: 0; box-sizing: border-box;
      }
      input:focus { box-shadow: 5px 5px 0 #2563eb; }
      input::placeholder { color: #8f8f96; font-weight: 500; }
      .actions { display: flex; gap: 12px; align-items: center; margin-top: 18px; }
      button {
        border: 3px solid #f4f4f5; border-radius: 0; padding: 10px 16px;
        color: #f4f4f5; font: inherit; font-size: 13px; font-weight: 900; cursor: pointer;
      }
      .save { background: #2563eb; color: #ffffff; }
      .cancel { background: #303034; }
      .reset {
        margin-left: auto; border: 0; background: transparent; padding: 0;
        color: #fca5a5; font-size: 12px; font-weight: 800; cursor: pointer; text-decoration: underline;
      }
    </style>
    <div class="backdrop">
      <div class="card">
        <label for="dusk-rename-input">Rename tab</label>
        <input id="dusk-rename-input" type="text" maxlength="300" spellcheck="false" />
        <div class="actions">
          <button class="save" type="button">Rename</button>
          <button class="cancel" type="button">Cancel</button>
          ${currentTitle ? '<button class="reset" type="button">Reset to page title</button>' : ""}
        </div>
      </div>
    </div>
  `;

  const input = root.querySelector("input");
  const saveButton = root.querySelector(".save");
  const cancelButton = root.querySelector(".cancel");
  const resetButton = root.querySelector(".reset");
  const backdrop = root.querySelector(".backdrop");

  if (currentTitle) {
    input.value = currentTitle;
  } else {
    input.placeholder = document.title || "Tab title";
  }

  const close = () => host.remove();

  const send = message => {
    try {
      chrome.runtime?.sendMessage?.(message, () => void chrome.runtime.lastError);
    } catch {
      // messaging unavailable; nothing else to do
    }
  };

  const save = () => {
    const value = input.value.trim();

    if (!value) {
      input.focus();
      return;
    }

    send({ type: "dusk:rename-tab", title: value });
    close();
  };

  saveButton.addEventListener("click", save);
  cancelButton.addEventListener("click", close);
  resetButton?.addEventListener("click", () => {
    send({ type: "dusk:rename-tab", title: null });
    close();
  });

  backdrop.addEventListener("mousedown", event => {
    if (event.target === event.currentTarget) {
      close();
    }
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });

  // The tab-strip menu takes focus; reclaim it whenever the window does.
  window.addEventListener("focus", () => input.focus({ preventScroll: true }), { once: true });

  document.documentElement.append(host);
  input.focus({ preventScroll: true });

  if (currentTitle) {
    input.select();
  }

  return { shown: true };
}
