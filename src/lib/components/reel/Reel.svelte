<script lang="ts">
	// TODO: Debug video loop
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

	let current_video_index = $state(0);
	let is_large_screen = $state(false);
	let video_element: HTMLVideoElement | undefined = $state();
	let current_reel = $derived($reel_data[current_video_index]);

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
		{#key current_video_index}
			<video
				bind:this={video_element}
				src={current_reel?.video}
				poster={current_reel?.poster}
				controls={!is_large_screen}
				muted={is_large_screen}
				autoplay={is_large_screen}
				preload="auto"
				onended={handle_video_end}
			>
			</video>
		{/key}
	</div>
</section>

<style>
	#reel {
		aspect-ratio: 16 / 9;
		background-color: var(--color-white);
		border-radius: var(--radius);
		grid-area: reel;
		overflow: hidden;

		@media screen and (width >= 1920px) {
			aspect-ratio: unset;
		}
	}
</style>
