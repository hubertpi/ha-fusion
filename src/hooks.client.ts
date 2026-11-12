// Svelte uses replaceAll when creating DOM fragments during hydration.
// Load it before SvelteKit starts the application on Chromium 84.
import 'core-js/actual/string/replace-all';

// Fusion uses these for modal focus and dashboard drag-and-copy.
import 'core-js/actual/array/at';
import 'core-js/actual/structured-clone';
