<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window'

	const video_poster = 'https://digmcms.westphal.drexel.edu/dswmedia/poster-black.webp'
	const video_src =
		'https://digmcms.westphal.drexel.edu/dswmedia/status_board/2019-DIGM-StatusBoard.mp4'
	const vimeo_id = '320965196'
	const vimeo_src = `https://player.vimeo.com/video/${vimeo_id}?autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&background=1`

	let is_large_screen = $state(false)
	let video_element: HTMLVideoElement | undefined = $state()

	function check_screen_size() {
		is_large_screen = (innerWidth.current ?? 0) >= 1920
	}

	$effect(() => {
		check_screen_size()

		const handle_resize = () => {
			check_screen_size()
		}

		window.addEventListener('resize', handle_resize)

		return () => {
			window.removeEventListener('resize', handle_resize)
		}
	})
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
		{:else}
			<video
				bind:this={video_element}
				controls
				poster={video_poster}
				preload="auto"
				src={video_src}
			>
				<track kind="captions" src="" srclang="en" label="No captions available" />
			</video>
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
