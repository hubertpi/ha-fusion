import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Fire OS 7 / Android 9 tablets can be locked to Amazon WebView Chromium 84.
		// Avoid Vite 8's default Chrome 111 output so those tablets can load Fusion.
		// This lowers syntax/CSS output; browser API polyfills may still be needed.
		target: 'chrome84',
		cssTarget: 'chrome84',
		// increase chunk size because of maplibre-gl
		chunkSizeWarningLimit: 1000
	},
	optimizeDeps: {
		include: [
			// include all because of dynamic imports, prevents: ✨ optimized dependencies changed. reloading
			'@event-calendar/core',
			'@jaames/iro',
			'd3-array',
			'd3-scale',
			'd3-shape',
			'dotenv',
			'express',
			'hls.js',
			'home-assistant-js-websocket',
			'http-proxy-middleware',
			'js-yaml',
			'konva',
			'maplibre-gl',
			'marked',
			'svelte-confetti',
			'sortablejs',
			'svelte-modals',
			'weekstart',
			// dev deps
			'@iconify/svelte',
			'konva/lib/Shape'
		],
		exclude: [
			// legacy Svelte 4 library; prebundling compiles it in runes mode
			// (dynamicCompileOptions in svelte.config.js is ignored there) and fails
			'svelte-tiny-virtual-list',
			// exclude codemirror to avoid state duplication
			// pnpm ls -P | grep codemirror | awk '{print "\047" $1 "\047,"}'
			'@codemirror/autocomplete',
			'@codemirror/commands',
			'@codemirror/language',
			'@codemirror/legacy-modes',
			'@codemirror/lint',
			'@codemirror/state',
			'@codemirror/theme-one-dark',
			'@codemirror/view',
			'codemirror'
		]
	},
	server: {
		// required for webrtc
		host: true,
		// development proxy endpoints
		proxy: {
			'/local/': {
				target: process.env.HASS_URL,
				changeOrigin: true
			},
			'/api/': {
				target: process.env.HASS_URL,
				changeOrigin: true
			}
		}
	}
});
