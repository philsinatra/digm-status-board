<script lang="ts">
	// import { innerWidth } from 'svelte/reactivity/window';
	import { writable, type Writable } from 'svelte/store';
	import type { Reel } from '$lib/types';
	import { init_event_source } from '$lib/scripts/eventSource';

	const { data_source = 'static/data/reels.json' } = $props();
	const reel_data: Writable<Reel[]> = writable([]);

	$effect(() => {
		return init_event_source({
			data_source,
			on_message: (data) => {
				return Array.isArray(data) ? data : [];
			},
			target_store: reel_data,
			log_prefix: 'reel',
			debug: true
		});
	});

	// const vimeo_id = '320965196';
	// const vimeo_src = `https://player.vimeo.com/video/${vimeo_id}?autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&background=1`;

	let current_video_index = $state(0);
	let current_reel = $derived($reel_data[current_video_index]);
	// let is_large_screen = $state(false);
	let video_element: HTMLVideoElement | undefined = $state();
	// let video_extension = $derived(is_large_screen ? 'webm' : 'mp4');

	// function check_screen_size() {
	// 	is_large_screen = (innerWidth.current ?? 0) >= 1920;
	// }

	// function handle_video_end() {
	// 	current_video_index = (current_video_index + 1) % $reel_data.length;
	//
	// 	if (is_large_screen && video_element) {
	// 		setTimeout(() => {
	// 			video_element?.play().catch(console.error);
	// 		}, 100);
	// 	}
	// }

	// function handle_video_error(error: Event) {
	// 	const target = event?.target as HTMLVideoElement;
	// 	console.error('Video error', target.error);
	//
	// 	const error_div = document.createElement('div');
	// 	error_div.style.cssText =
	// 		'position:fixed;top:0;background:red;color:white;padding:10px;z-index:9999';
	// 	error_div.textContent = `Error Code: ${target.error?.code}, Message: ${target.error?.message}`;
	// 	document.body.appendChild(error_div);
	// }

	// $effect(() => {
	// 	check_screen_size();
	//
	// 	const handle_resize = () => {
	// 		check_screen_size();
	// 	};
	//
	// 	window.addEventListener('resize', handle_resize);
	//
	// 	return () => {
	// 		window.removeEventListener('resize', handle_resize);
	// 	};
	// });

	function create_debug_display(message: string) {
		const debug_div = document.createElement('div');
		debug_div.style.cssText =
			'position:fixed;top:0;left:0;background:black;color:lime;padding:5px;z-index:9999;font-family:monospace;font-size:12px;max-width:100%;overflow-wrap:break-word;';
		debug_div.innerHTML = document.querySelector('.debug-info')?.innerHTML || '';
		debug_div.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
		debug_div.className = 'debug-info';

		// Remove old debug div
		document.querySelector('.debug-info')?.remove();
		document.body.appendChild(debug_div);
	}

	function log_video_state(video: HTMLVideoElement, context: string) {
		const info = {
			context,
			currentTime: video.currentTime,
			duration: video.duration,
			readyState: video.readyState, // 0-4 (HAVE_NOTHING to HAVE_ENOUGH_DATA)
			networkState: video.networkState, // 0-3 (NETWORK_EMPTY to NETWORK_NO_SOURCE)
			buffered:
				video.buffered.length > 0 ? `${video.buffered.start(0)}-${video.buffered.end(0)}` : 'none',
			played: video.played.length > 0 ? `${video.played.start(0)}-${video.played.end(0)}` : 'none',
			seekable:
				video.seekable.length > 0 ? `${video.seekable.start(0)}-${video.seekable.end(0)}` : 'none',
			videoWidth: video.videoWidth,
			videoHeight: video.videoHeight,
			paused: video.paused,
			ended: video.ended,
			muted: video.muted,
			volume: video.volume,
			playbackRate: video.playbackRate,
			src: video.src,
			currentSrc: video.currentSrc // This shows what the browser actually loaded
		};

		create_debug_display(`${context}: ${JSON.stringify(info, null, 1)}`);
		console.log(`Video ${context}:`, info);
	}

	function log_detailed_error(video: HTMLVideoElement) {
		const error = video.error;
		if (!error) return;

		// MediaError codes
		const error_codes: { [key: number]: string } = {
			1: 'MEDIA_ERR_ABORTED',
			2: 'MEDIA_ERR_NETWORK',
			3: 'MEDIA_ERR_DECODE',
			4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
		};

		const error_info = {
			code: error.code,
			codeName: error_codes[error.code] || 'UNKNOWN',
			message: error.message,
			// Browser/environment info
			userAgent: navigator.userAgent,
			cookieEnabled: navigator.cookieEnabled,
			onLine: navigator.onLine,
			// Network timing (if available)
			// connectionType: (navigator as any).connection?.effectiveType || 'unknown',
			// Video element state
			readyState: video.readyState,
			networkState: video.networkState,
			currentSrc: video.currentSrc,
			// Document state
			documentReadyState: document.readyState,
			pageVisibility: document.visibilityState
		};

		create_debug_display(`ERROR: ${JSON.stringify(error_info, null, 1)}`);
		console.error('Detailed video error:', error_info);
	}

	// Comprehensive event handlers
	function setup_video_debugging(video: HTMLVideoElement) {
		const events = [
			'loadstart',
			'durationchange',
			'loadedmetadata',
			'loadeddata',
			'progress',
			'canplay',
			'canplaythrough',
			'playing',
			'waiting',
			'seeking',
			'seeked',
			'ended',
			'error',
			'abort',
			'emptied',
			'stalled',
			'suspend',
			'play',
			'pause',
			'ratechange',
			'resize',
			'volumechange'
		];

		events.forEach((eventType) => {
			video.addEventListener(eventType, () => {
				if (eventType === 'error') {
					log_detailed_error(video);
				} else {
					log_video_state(video, `EVENT-${eventType}`);
				}
			});
		});

		// Initial state
		log_video_state(video, 'INITIAL');

		// Periodic state logging (helpful for BrightSign timing issues)
		const interval = setInterval(() => {
			if (video.parentNode) {
				log_video_state(video, 'PERIODIC');
			} else {
				clearInterval(interval);
			}
		}, 2000);
	}

	// Network connectivity test
	function test_network_access() {
		const test_url = `${current_reel?.video}.mp4`;

		fetch(test_url, { method: 'HEAD' })
			.then((response) => {
				create_debug_display(
					`FETCH TEST: Status ${response.status}, Headers: ${JSON.stringify([...response.headers])}`
				);
			})
			.catch((error) => {
				create_debug_display(`FETCH ERROR: ${error.message}`);
			});
	}

	// Browser capability detection
	function log_browser_capabilities() {
		const video = document.createElement('video');
		const capabilities = {
			canPlayMP4: video.canPlayType('video/mp4'),
			canPlayWebM: video.canPlayType('video/webm'),
			canPlayH264: video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
			canPlayVP8: video.canPlayType('video/webm; codecs="vp8"'),
			canPlayVP9: video.canPlayType('video/webm; codecs="vp9"'),
			supportsHLS: video.canPlayType('application/vnd.apple.mpegurl'),
			userAgent: navigator.userAgent,
			// platform: navigator.platform,
			language: navigator.language,
			windowSize: `${window.innerWidth}x${window.innerHeight}`,
			screenSize: `${screen.width}x${screen.height}`,
			devicePixelRatio: window.devicePixelRatio
		};

		create_debug_display(`CAPABILITIES: ${JSON.stringify(capabilities, null, 1)}`);
		console.log('Browser capabilities:', capabilities);
	}

	$effect(() => {
		log_browser_capabilities();
	});

	$effect(() => {
		test_network_access();
	});
</script>

<section id="reel">
	<div class="reel">
		<!-- {#if is_large_screen} -->
		<!-- 	<iframe -->
		<!-- 		allow="autoplay; fullscreen; picture-in-picture" -->
		<!-- 		allowfullscreen -->
		<!-- 		frameborder="0" -->
		<!-- 		height="100%" -->
		<!-- 		loading="lazy" -->
		<!-- 		src={vimeo_src} -->
		<!-- 		title="DIGM Status Board" -->
		<!-- 		width="100%" -->
		<!-- 	></iframe> -->
		<!-- {:else if current_reel} -->
		<!-- {#key current_video_index} -->
		<!-- 	<video -->
		<!-- 		autoplay={is_large_screen} -->
		<!-- 		bind:this={video_element} -->
		<!-- 		controls={!is_large_screen} -->
		<!-- 		muted={is_large_screen} -->
		<!-- 		onended={handle_video_end} -->
		<!-- 		poster={current_reel?.poster} -->
		<!-- 		preload="auto" -->
		<!-- 		src={`${current_reel?.video}.${video_extension}`} -->
		<!-- 	> -->
		<!-- 	</video> -->
		<!-- {/key} -->
		<!-- {/if} -->

		<video
			autoplay
			bind:this={video_element}
			muted
			controls
			loop
			src="https://digmcms.westphal.drexel.edu/dswmedia/status_board/2019-DIGM-StatusBoard.webm"
			use:setup_video_debugging
		></video>
	</div>
</section>

<style>
	#reel {
		aspect-ratio: 16 / 9;
		background-color: var(--color-white);
		border-radius: var(--radius);
		grid-area: reel;
		overflow: hidden;

		.reel {
			align-items: center;
			border-radius: var(--radius);
			display: flex;
			height: 100%;
			justify-content: center;
			overflow: hidden;
			width: 100%;

			video {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}
		}

		@media screen and (width >= 1920px) {
			aspect-ratio: unset;
		}
	}
</style>
