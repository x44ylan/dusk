# Dusk

A tiny Chrome/Edge MV3 extension

## Load In Chrome Or Edge

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click Load unpacked.
4. Select this `dusk` folder.

## Behavior

- Click the extension icon to toggle the configured proxy on or off.
- Right-click the extension icon and choose **Options** to set the proxy URL.
- Right-click a tab and choose **Rename tab…** to give it a custom title.
- Renames survive navigation and sites rewriting their own title.
- Renames last for the browser session and die with the tab.
- `Enter` saves, `Esc` cancels, and renamed tabs can reset to the page title.
- A dim power icon means off; a bright one routes traffic through the proxy.
- No popup is ever shown; every action lives in the icon or tab menu.

## Permissions

- `proxy`, `storage`: the original proxy toggle.
- `contextMenus`, `scripting`: inject the rename dialog and title override.
- `<all_urls>`: lets Dusk re-apply a tab's custom title after that tab navigates. If you'd rather not grant it, the rename dialog still works for the current page, but renames won't persist across navigation.
