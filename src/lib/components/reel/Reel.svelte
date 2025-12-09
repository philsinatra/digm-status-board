<script lang="ts">
	import { reel_status } from '$lib/stores/reel'

	const video_poster = 'https://digmcms.westphal.drexel.edu/dswmedia/poster-black.webp'
	const video_url =
		'https://digmcms.westphal.drexel.edu/dswmedia/status_board/2019-DIGM-StatusBoard.mp4'

	let video_element: HTMLVideoElement | null = $state(null)
</script>

<section id="reel">
	<div class="reel">
		<video
			autoplay
			bind:this={video_element}
			controls
			class:reposition={$reel_status === 'hidden'}
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
		backface-visibility: hidden;
		background: var(--color-white);
		border-radius: var(--radius);
		grid-area: reel;
		overflow: hidden;
		position: relative;
		transform: translateZ(0);
	}

	.reel {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		position: relative;
		transform: translateZ(0);
		width: 100%;
	}

	video {
		height: 100%;
		object-fit: cover;
		position: relative;
		transform: translateZ(0);
		width: 100%;

		&.reposition {
			@media screen and (width >= 1920px) {
				height: 0;
			}
		}
	}

	@media (width >= 1920px) {
		#reel {
			aspect-ratio: unset;
		}
	}
</style>
