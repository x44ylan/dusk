# Dusk

A tiny Chrome/Edge MV3 extension

## Load In Chrome Or Edge

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click Load unpacked.
4. Select this `dusk` folder.

## Behavior

- Click the extension icon to toggle the configured proxy on or off.
- Right-click the extension icon and choose **Options** to change the proxy URL.
- Right-click a tab and choose **Rename tab…** to give that tab a custom title. The rename sticks when the site rewrites its own title and survives navigation within the tab. It lasts for the browser session and dies with the tab. `Enter` saves, `Esc` cancels, and the dialog offers a reset back to the page title for renamed tabs.
- Dim power icon means off; bright power icon means traffic is routed through the configured proxy.
- No popup is shown.

## Permissions

- `proxy`, `storage`: the original proxy toggle.
- `contextMenus`, `scripting`: inject the rename dialog and title override.
- `<all_urls>`: lets Dusk re-apply a tab's custom title after that tab navigates. If you'd rather not grant it, the rename dialog still works for the current page, but renames won't persist across navigation.
