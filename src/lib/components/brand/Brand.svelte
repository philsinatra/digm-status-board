<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
</script>

<section id="brand">
	<div class="brand"></div>
	{#if (innerWidth.current ?? 0) >= 1920}
		<div class="message">
			<p>Download the<br />DIGM Status Web App</p>
			<svg><use href="#qr-status-board" /></svg>
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

				svg {
					color: var(--color-white);
					height: 84px;
					translate: 12px 2px;
					width: 84px;
				}
			}
		}
	}
</style>
