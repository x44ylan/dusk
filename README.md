# Dusk

A tiny Chrome/Edge MV3 extension for toggling the Burp proxy.

## Load In Chrome Or Edge

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click Load unpacked.
4. Select this `dusk` folder.

## Behavior

- Click the extension icon to toggle the configured proxy on or off.
- Right-click the extension icon and choose **Options** to set the proxy URL.
- A dim power icon means off; a bright one routes traffic through the proxy.

## Permissions

- `proxy` applies the configured proxy or switches Chrome back to its system settings.
- `storage` saves the proxy URL and toggle state.
