<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
</script>

<section id="brand">
	<div class="brand">
		<svg><use href="#brand" /></svg>
	</div>
	{#if (innerWidth.current ?? 0) >= 1920}
		<div class="message">
			<p>console.log('Hello, DIGM!');</p>
		</div>
	{/if}
</section>

<style>
	#brand {
		background-color: var(--color-drexel-blue);
		border-radius: var(--radius);
		color: var(--color-drexel-gold);
		display: grid;
		grid-area: brand;
		height: clamp(80px, 8vw, 100px);
		overflow: hidden;
		place-items: center;
		position: relative;

		.brand {
			height: min(60cqh, 80px);
			width: auto;

			svg {
				height: 100%;
				max-width: 250px;
				position: relative;
				width: auto;
				z-index: 30;
			}
		}

		@media screen and (width >= 768px) {
			align-content: stretch;
			height: 100%;
		}

		@media screen and (width >= 1100px) {
			padding-inline: var(--space-medium);
			width: 100%;

			.brand {
				justify-self: start;
			}
		}

		@media screen and (width >= 1920px) {
			grid-template-columns: 300px auto;
			place-items: center start;

			.message {
				font-family: var(--font-family-mono);
				position: relative;
				text-align: right;
				width: 100%;
				z-index: 30;
			}
		}
	}
</style>
