# Progress

## Done
- Cloned dylan-liew/dusk.
- Added right-click "Rename tab…" context menu item (contextMenus, `contexts: ["tab"]`).
  - `src/rename/service.js` — menu creation, click flow, message handling, navigation re-apply, tab close/replace cleanup.
  - `src/rename/injected/rename-dialog.js` — isolated-world dialog (closed shadow root, Dusk styling), Enter/Esc/backdrop, Reset for renamed tabs.
  - `src/rename/injected/title-override.js` — MAIN-world `document.title` override; tracks natural title, swallows site rewrites while renamed, passthrough on reset.
  - `src/rename/titles.js` — tabId→title map in `storage.session` (per browser session, dies with tab).
- Manifest: +`contextMenus`, +`scripting`, `host_permissions: ["<all_urls>"]`, version 0.3.0.
- README: feature + permissions + E2E docs.

## Bug found by E2E
- Injected funcs initially lacked `export` → service.js failed to load and the
  whole background worker broke. Fixed; E2E would not have passed otherwise.

## Validation
- `e2e/rename-tab.test.mjs` (Playwright, chromium, unpacked extension load):
  8/8 steps pass — SW starts, menu registers clean, rename applies, MAIN-world
  override defeats title-rewriting pages, survives reload, storage.session
  mapping correct, reset restores page title, dialog prefill/reset UI verified.
- Screenshot artifact: dialog.png (prefilled input + Rename/Cancel/Reset).
- Not E2E-verifiable headlessly: the literal right-click on the tab strip
  (browser UI, no input automation); menu creation itself is exercised.

## Notes / caveats
- `<all_urls>` is required for post-navigation re-apply; could be softened with
  optional_host_permissions + a runtime permission prompt if install warnings matter.
- Sites that redefine `document.title` AFTER injection can still win (same
  limitation as Simple Tab Renamer).
- Changes left uncommitted (user hasn't asked for a commit/push).
