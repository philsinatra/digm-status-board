<!-- eslint-disable -->
<!-- @ts-nocheck -->
<!-- svelte-ignore a11y_media_has_caption -->
<script lang="ts">
	const video_poster = 'https://digmcms.westphal.drexel.edu/dswmedia/poster-black.webp'

	let video_element: HTMLVideoElement | null = $state(null)
	/* eslint-disable */
	let video_player: any = null
	let is_brightsign = $state(false)

	const brightsign_video_url =
		'https://digmcms.westphal.drexel.edu/dswmedia/status_board/sb-001.mp4'
	const fallback_video_url =
		'https://digmcms.westphal.drexel.edu/dswmedia/status_board/2019-DIGM-StatusBoard.mp4'

	$effect(() => {
		const win = window as any
		if (typeof win.VideoPlayer !== 'undefined' || win.brightsign) {
			is_brightsign = true
		}
	})

	function setup_brightsign_video() {
		if (!is_brightsign || video_player || !video_element) return

		const rect = video_element.getBoundingClientRect()

		const BS = window as any
		const rectangle = new BS.Rectangle(
			Math.round(rect.left),
			Math.round(rect.top),
			Math.round(rect.width),
			Math.round(rect.height)
		)

		video_player = new BS.VideoPlayer()
		video_player.SetRectangle(rectangle)
		video_player.SetLoopMode(true)
		video_player.SetVolume(100)

		video_player.PlayFile(brightsign_video_url)
	}

	$effect(() => {
		if (is_brightsign && video_element) {
			setTimeout(setup_brightsign_video, 200)
		}

		return () => {
			if (video_player?.Stop) video_player.Stop()
		}
	})
</script>

<section id="reel">
	<div class="reel">
		{#if is_brightsign}
			<video
				bind:this={video_element}
				autoplay
				loop
				muted
				playsinline
				poster={video_poster}
				preload="none"
				src={brightsign_video_url}
				style="opacity:0;pointer-events:none;position:absolute;"
			></video>
		{:else}
			<video
				bind:this={video_element}
				controls
				loop
				muted
				poster={video_poster}
				preload="auto"
				src={fallback_video_url}
			></video>
		{/if}
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
