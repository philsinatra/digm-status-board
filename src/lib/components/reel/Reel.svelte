<script lang="ts">
	import { reel_status } from '$lib/stores/reel'

	const video_poster = 'https://digmcms.westphal.drexel.edu/dswmedia/poster-black.webp'
	const video_url =
		'https://digmcms.westphal.drexel.edu/dswmedia/status_board/2019-DIGM-StatusBoard.mp4'

	let video_element: HTMLVideoElement | null = $state(null)

	$inspect($reel_status)
</script>

<section class:reposition={$reel_status === 'hidden'} id="reel">
	<div class="reel">
		<video
			autoplay
			bind:this={video_element}
			controls
			loop
			muted
			poster={video_poster}
			preload="auto"
			src={video_url}
		></video>
	</div>
</section>

<style>
	#reel {
		aspect-ratio: 16/9;
		background: var(--color-white);
		border: 2px solid var(--color-red-700);
		border-radius: var(--radius);
		grid-area: reel;
		overflow: hidden;
		position: relative;

		&.reposition {
			@media screen and (width >= 1920px) {
				left: -100vw;
				position: fixed;
				top: -100vh;
			}
		}
	}

	.reel {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		width: 100%;
	}

	video {
		height: 100%;
		object-fit: cover;
		width: 100%;
	}

	@media (width >= 1920px) {
		#reel {
			aspect-ratio: unset;
		}
	}
</style>
