<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
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

	const vimeo_id = '320965196';
	const vimeo_src = `https://player.vimeo.com/video/${vimeo_id}?autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&background=1`;

	let current_video_index = $state(0);
	let current_reel = $derived($reel_data[current_video_index]);
	let is_large_screen = $state(false);
	let video_element: HTMLVideoElement | undefined = $state();
	let video_extension = $derived(is_large_screen ? 'webm' : 'mp4');

	function check_screen_size() {
		is_large_screen = (innerWidth.current ?? 0) >= 1920;
	}

	function handle_video_end() {
		current_video_index = (current_video_index + 1) % $reel_data.length;

		if (is_large_screen && video_element) {
			setTimeout(() => {
				video_element?.play().catch(console.error);
			}, 100);
		}
	}

	$effect(() => {
		check_screen_size();

		const handle_resize = () => {
			check_screen_size();
		};

		window.addEventListener('resize', handle_resize);

		return () => {
			window.removeEventListener('resize', handle_resize);
		};
	});
</script>

<section id="reel">
	<div class="reel">
		{#if is_large_screen}
			<iframe
				allow="autoplay; fullscreen; picture-in-picture"
				allowfullscreen
				frameborder="0"
				height="100%"
				loading="lazy"
				src={vimeo_src}
				title="DIGM Status Board"
				width="100%"
			></iframe>
		{:else if current_reel}
			{#key current_video_index}
				<video
					autoplay={is_large_screen}
					bind:this={video_element}
					controls={!is_large_screen}
					muted={is_large_screen}
					onended={handle_video_end}
					poster={current_reel?.poster}
					preload="auto"
					src={`${current_reel?.video}.${video_extension}`}
				>
				</video>
			{/key}
		{/if}
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
