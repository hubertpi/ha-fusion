# Fusion on Chromium 84

The compatibility branch targets the Amazon WebView on the Fire HD 10 (KFMAWI).
Vite targets Chrome 84 for JavaScript and CSS. Svelte's DOM renderer also needs
`String.replaceAll` during startup, so Fusion loads that polyfill before mounting.
The client hook also covers `Array.at` for modal focus and `structuredClone` for
copying dashboard items.

The production Node 22 build rendered the requested view on desktop Chromium 84
and 104 over plain HTTP. In both browsers a switch call reached a Home Assistant
mock, the returned state appeared in Fusion, and the camera proxy loaded an
image using the token supplied by the mock. Live Home Assistant and the Amazon
WebView still need verification.

## Build and install the test add-on

On the Debian Docker host, check the current Fusion containers and port mappings:

```bash
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | awk 'NR == 1 || /ha_fusion/'
```

To verify the image builds on that host before registering the repository:

```bash
git clone --depth 1 --branch compat/chromium-84 https://github.com/hubertpi/ha-fusion.git fusion-chromium84
docker build -t fusion-chromium84:local-test fusion-chromium84/addon/chromium84
```

After the build succeeds, add the following repository in the Home Assistant
add-on store and install **Fusion Chromium 84**. Supervisor builds its own
image from the same Dockerfile and pinned Fusion commit.

```text
https://github.com/hubertpi/ha-fusion#compat/chromium-84
```

In the test add-on's Network settings, map its `8099/tcp` port to **5052** after
confirming that host port is free. Start the test add-on and use the container
listing above to identify both the running source and the
`ha_fusion_chromium84` test container. Copy the dashboard to the test add-on
before opening it on the tablet:

```bash
source_container='REPLACE_WITH_RUNNING_FUSION_CONTAINER'
test_container='REPLACE_WITH_CHROMIUM84_CONTAINER'
(
  set -eu
  [[ "$test_container" == *_ha_fusion_chromium84 && "$source_container" != "$test_container" ]]
  dashboard_copy="$(mktemp)"
  trap 'rm -f "$dashboard_copy"' EXIT
  docker cp "$source_container:/data/dashboard.yaml" "$dashboard_copy"
  test -s "$dashboard_copy"
  docker cp "$dashboard_copy" "$test_container:/data/dashboard.yaml"
)
```

The copy replaces the test dashboard. If you have already edited it, save a
copy first. Sign in to Home Assistant from the test port. If sign-in returns
to the default view, open the requested URL again:

```text
http://192.168.1.12:5052/?view=family%20room
```

Open that URL on the affected tablet first. Check that the view loads, a safe
control responds, entity states update, and camera images and streams work.
Watch the Home Assistant log for fresh authentication warnings during the test.
Keep the original Fully Kiosk start URL available so you can restore it after
the test. Then verify the test URL on the tablet with WebView 104.

## Update the test build

Commit and verify the Fusion changes, then update `FUSION_REVISION` in the
add-on Dockerfile to the tested commit and bump the add-on version in
`addon/chromium84/config.yaml`. Reload the add-on store to pick up the update.
This add-on builds directly from Hubert's fork through Supervisor.
