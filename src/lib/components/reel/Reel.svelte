<script lang="ts">
	const video_poster = 'https://digmcms.westphal.drexel.edu/dswmedia/poster-black.webp';

	let animation_frame: number;
	let canvas_element: HTMLCanvasElement | undefined = $state();
	let video_element: HTMLVideoElement | undefined = $state();
	// let is_brightsign = /BrightSign/i.test(navigator.userAgent);
	let is_brightsign = true;
	let is_ready = $state(false);
	let video_src = $derived(
		is_brightsign
			? 'https://digmcms.westphal.drexel.edu/dswmedia/status_board/sb-001.mp4'
			: 'https://digmcms.westphal.drexel.edu/dswmedia/status_board/2019-DIGM-StatusBoard.mp4'
	);

	function setup_canvas_video() {
		const canvas = canvas_element;
		const video = video_element;

		if (!canvas || !video) return;

		const ctx = canvas.getContext('2d');

		if (!ctx) return;

		function draw_frame() {
			if (video && video.readyState >= 2) {
				if (canvas) {
					if (canvas.width === 0 || canvas.height === 0) {
						const rect = canvas.getBoundingClientRect();
						canvas.width = rect.width;
						canvas.height = rect.height;
					}

					ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
				}
			}

			animation_frame = requestAnimationFrame(draw_frame);
		}

		video.addEventListener('loadedmetadata', () => {
			// console.log('Video metadata loaded', {
			// 	videoWidth: video.videoWidth,
			// 	videoHeight: video.videoHeight,
			// 	readyState: video.readyState
			// });

			const rect = canvas.getBoundingClientRect();

			canvas.width = rect.width || video.videoWidth;
			canvas.height = rect.height || video.videoHeight;

			draw_frame();
		});

		if (video.readyState >= 2) {
			// console.log('Video already loaded, starting draw');

			const rect = canvas.getBoundingClientRect();

			canvas.width = rect.width;
			canvas.height = rect.height;

			draw_frame();
		}

		if (is_brightsign) {
			video
				.play()
				.then(() => {
					console.log('Video started playing');
				})
				.catch((error) => {
					console.error('Video play failed:', error);
				});
		}
	}

	$effect(() => {
		if (is_brightsign) {
			if (canvas_element && video_element && !is_ready) {
				console.log('Elements ready, setting up canvas video');

				is_ready = true;

				setTimeout(() => {
					setup_canvas_video();
				}, 100);
			}
		}

		return () => {
			if (animation_frame) {
				cancelAnimationFrame(animation_frame);
			}
		};
	});
</script>

<section id="reel">
	<div class="reel">
		{#if is_brightsign}
			<video
				autoplay
				bind:this={video_element}
				loop
				muted
				playsinline
				poster={video_poster}
				preload="auto"
				src={video_src}
				style="display: none"
			>
				<track kind="captions" src="" srclang="en" label="No captions available" />
			</video>
			<canvas bind:this={canvas_element}></canvas>
		{:else}
			<video
				bind:this={video_element}
				controls
				loop
				muted
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
		}

		canvas {
			display: block;
			height: 100%;
			object-fit: cover;
			width: 100%;
		}

		@media screen and (width >= 1920px) {
			aspect-ratio: unset;
		}
	}
</style>
