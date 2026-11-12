<script lang="ts">
	import { connected, connection, editMode } from '$lib/Stores';
	import { onMount } from 'svelte';
	import Broken from '$lib/Main/Camera/Broken.svelte';

	let {
		sel,
		entity,
		size,
		stream_url,
		effective_stream_type = undefined,
		loaderVisible = $bindable(),
		responsive = undefined,
		muted = true
	}: {
		sel: any;
		entity: any;
		size?: string | undefined;
		stream_url?: string | undefined;
		effective_stream_type?: string | undefined;
		loaderVisible?: boolean | undefined;
		responsive?: boolean | undefined;
		muted?: boolean | undefined;
	} = $props();

	let img: HTMLImageElement;
	let broken = $state<boolean>();
	let date = $state<number>();
	let signedSnapshot = $state<{ cameraPath: string; url: string }>();

	let entity_picture = $derived(entity?.attributes?.entity_picture || '');
	// Only legacy MJPEG cameras use camera_proxy_stream. HLS and WebRTC
	// cameras have dedicated players; requesting their proxy stream in
	// parallel can fail and incorrectly replace the loading poster with the
	// broken-image warning.
	let proxy_stream = $derived(
		(!muted || sel?.stream) && !effective_stream_type && !stream_url && !$editMode
	);

	function handleError(error: boolean) {
		loaderVisible = false;
		broken = error;
	}

	const updateInterval = 30_000;

	// Sign each snapshot using the authenticated Home Assistant connection.
	// Keep camera-specific tokens out of recurring snapshot requests.
	let cameraPath = $derived.by(() => {
		if (proxy_stream) return undefined;
		return entity_picture.match(/^\/api\/camera_proxy\/camera\.[a-z0-9_]+(?=\?|$)/)?.[0];
	});

	let snapshotSize = $derived.by(() => {
		const query = new URLSearchParams(entity_picture.split('?')[1]);
		return ['width', 'height']
			.flatMap((key) => {
				const value = query.get(key);
				return value === null ? [] : [`${key}=${encodeURIComponent(value)}`];
			})
			.join('&');
	});

	$effect(() => {
		const conn = $connection;
		const path = cameraPath;
		if (!$connected || !conn || !path) return;

		const sizeQuery = snapshotSize;
		const pathToSign = date === undefined ? path : `${path}?date=${date}`;
		let active = true;

		void conn
			.sendMessagePromise<{ path: string }>({ type: 'auth/sign_path', path: pathToSign })
			.then(({ path: url }) => {
				if (active) {
					// Home Assistant excludes width and height from the signed query.
					signedSnapshot = { cameraPath: path, url: sizeQuery ? `${url}&${sizeQuery}` : url };
				}
			})
			.catch(() => {
				if (active) handleError(true);
			});

		return () => {
			active = false;
		};
	});

	let imageSrc = $derived(
		proxy_stream
			? entity_picture?.replace('/camera_proxy/', '/camera_proxy_stream/')
			: cameraPath
				? signedSnapshot?.cameraPath === cameraPath
					? signedSnapshot?.url
					: undefined
				: entity_picture
					? `${entity_picture}${date ? '&date=' + date : ''}`
					: undefined
	);

	onMount(() => {
		const interval = setInterval(() => {
			date = Date.now();
		}, updateInterval);

		return () => {
			clearInterval(interval);
			if (img) img.src = '';
		};
	});
</script>

<img
	src={imageSrc}
	bind:this={img}
	onerror={() => handleError(true)}
	onload={() => handleError(false)}
	style:display={broken ? 'none' : 'initial'}
	style:width={responsive ? '100%' : 'calc(14.5rem * 2 + 0.4rem)'}
	style:object-fit={size}
	draggable="false"
	style:position={loaderVisible && proxy_stream ? 'absolute' : 'relative'}
	alt=""
/>

{#if broken}
	<Broken />
{/if}

<style>
	img {
		width: 100%;
		height: 100%;
	}
</style>
