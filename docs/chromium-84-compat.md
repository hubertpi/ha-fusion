# Chromium 84 compatibility build

This branch experiments with supporting **Amazon Fire OS 7 / Android 9** tablets running
the Amazon WebView based on **Chromium 84** (for example, Fire HD 10 model KFMAWI).
The unmodified Vite 8 build targets newer browsers.

## Changes

- Set `build.target` to `chrome84` for bundled JavaScript syntax.
- Set `build.cssTarget` to `chrome84` for bundled CSS compatibility.

These settings do **not** guarantee compatibility: Web APIs, library runtime
requirements, and CSS features that cannot be transformed might still require
specific patches. Vite's build target does not automatically supply polyfills.
Test the output on the affected tablet before treating this as a fix.

## Testing

1. Run `pnpm install --frozen-lockfile && pnpm build`.
2. Run Fusion from the compatibility build on a separate port, reusing a copy
   of your dashboard data, leaving the production installation untouched.
3. Open that test URL on the Fire tablet with WebView 84 and confirm the UI
   renders, views switch, and entities update.
4. If the screen stays blank, inspect JavaScript console output with remote
   WebView debugging and patch the specific runtime incompatibility.

There is currently **no separate Home Assistant add-on repository** for this
source fork. The upstream add-on repository pulls upstream release source; this
branch will not automatically replace an installed Home Assistant add-on.
