#!/usr/bin/with-contenv bashio

export HASS_PORT="$(bashio::core.port)"
export EXPOSED_PORT="$(bashio::addon.port '8099/tcp')"

echo "Starting Fusion Chromium 84"
exec node server.js
