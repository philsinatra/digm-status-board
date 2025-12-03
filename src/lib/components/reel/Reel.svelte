<script lang="ts">
	const video_poster = 'https://digmcms.westphal.drexel.edu/dswmedia/poster-black.webp'
	const video_url =
		'https://digmcms.westphal.drexel.edu/dswmedia/status_board/2019-DIGM-StatusBoard.mp4'

	let video_element: HTMLVideoElement | null = $state(null)
</script>

<section id="reel">
	<div class="reel">
		<video
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
		border-radius: var(--radius);
		grid-area: reel;
		overflow: hidden;
		position: relative;
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
