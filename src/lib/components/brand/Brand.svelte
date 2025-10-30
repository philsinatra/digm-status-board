<script lang="ts">
	import QRCode from 'qrcode';
	import { innerWidth } from 'svelte/reactivity/window';
	import '$lib/components/brand/brand.css';

	const url = 'https://digmstatus.westphal.drexel.edu/';
	let qr_svg: string | undefined = $state('');
	let error: string | undefined;

	async function generate_qr_code(url: string) {
		try {
			qr_svg = await QRCode.toString(url, {
				type: 'svg',
				margin: 2,
				color: {
					dark: '#ffffff',
					light: '#9493000'
				}
			});
		} catch (err) {
			error = (err as Error).message;
			console.error(error);
		}
	}

	$effect(() => {
		generate_qr_code(url);
	});
</script>

<section id="brand">
	<div class="brand"></div>
	{#if (innerWidth.current ?? 0) >= 1920}
		<div class="message">
			<p>Download the<br />DIGM Status Web App</p>
			{@html qr_svg}
		</div>
	{/if}
</section>

<style>
	#brand {
		background: linear-gradient(to right, var(--color-drexel-blue), var(--color-drexel-blue-dark));
		border-radius: var(--radius);
		color: var(--color-drexel-gold);
		display: grid;
		grid-area: brand;
		overflow: hidden;
		padding: var(--space-medium);
		place-items: center;
		position: relative;

		.brand {
			background-color: var(--color-drexel-gold);
			color: var(--color-drexel-gold);
			height: min(60cqh, 80px);
			mask-image: url('/images/brand.svg');
			mask-position: center;
			mask-repeat: no-repeat;
			mask-size: contain;
			width: 100%;
		}

		@media screen and (width >= 768px) {
			align-content: stretch;
			height: 100%;
		}

		@media screen and (width >= 1280px) {
			padding-inline: var(--space-medium);
			width: 100%;

			.brand {
				justify-self: start;
			}
		}

		@media screen and (width >= 1920px) {
			column-gap: var(--space-medium);
			grid-template-columns: repeat(2, 1fr);
			padding-block: 0;
			place-items: center start;

			.brand {
				max-height: 100px;
				padding: 0;
			}

			.message {
				align-items: center;
				color: var(--color-white);
				display: flex;
				justify-content: flex-end;
				max-height: 64px;
				position: relative;
				row-gap: var(--space-medium);
				text-align: right;
				width: 100%;
				z-index: 30;

				p {
					font-size: var(--font-size-x-small);
					font-weight: 500;
					justify-self: flex-end;
					line-height: var(--line-height);
					margin: 0;
					text-align: center;
				}
			}
		}
	}
</style>
