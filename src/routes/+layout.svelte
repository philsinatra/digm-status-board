<script lang="ts">
	import Spritesheet from '$lib/components/spritesheet/Spritesheet.svelte';
	import '$lib/styles/app.css';

	let { children } = $props();
</script>

<Spritesheet />
<div class="site-container">{@render children?.()}</div>

<style>
	.site-container {
		display: grid;
		gap: var(--space-medium);
		grid-template-areas:
			'brand brand'
			'weather weather'
			'schedule schedule'
			'countdown countdown'
			'quote quote'
			'reel reel'
			'events events'
			'alumni alumni'
			'faculty faculty'
			'resources resources'
			'footer footer';
		grid-template-columns: repeat(2, 1fr);
		margin: var(--space-medium);
		position: relative;

		@media screen and (width >= 540px) {
			grid-template-areas:
				'brand brand'
				'weather weather'
				'schedule schedule'
				'countdown quote'
				'reel reel'
				'events events'
				'alumni alumni'
				'faculty faculty'
				'resources resources'
				'footer footer';
		}

		@media screen and (width >= 768px) {
			gap: var(--space-medium);
			grid-auto-columns: 0;
			grid-template-areas:
				'brand brand brand brand weather weather weather weather'
				'schedule schedule schedule schedule schedule schedule schedule schedule'
				'reel reel reel reel reel countdown countdown countdown'
				'events events events events alumni alumni alumni alumni'
				'faculty faculty faculty faculty faculty faculty faculty faculty'
				'resources resources resources resources resources resources resources resources'
				'footer footer footer footer footer footer footer footer';
			grid-template-columns: repeat(8, 1fr);
		}

		@media screen and (width >= 1280px) {
			grid-template-areas:
				'brand brand brand brand brand brand weather weather weather weather weather weather'
				'schedule schedule schedule schedule schedule schedule schedule schedule schedule schedule schedule schedule'
				'reel reel reel reel reel reel reel reel  countdown countdown countdown countdown'
				'events events events events alumni alumni alumni alumni resources resources resources resources'
				'faculty faculty faculty faculty faculty faculty faculty faculty faculty faculty faculty faculty'
				'footer footer footer footer footer footer footer footer footer footer footer footer';
			grid-template-columns: repeat(12, 1fr);
		}

		@media screen and (width >= 1920px) {
			grid-auto-columns: 0;
			grid-template-areas:
				'brand brand brand brand brand faculty faculty faculty faculty countdown countdown countdown'
				'today today weather weather weather faculty faculty faculty faculty countdown countdown countdown'
				'reel reel reel reel reel faculty faculty faculty faculty events events events'
				'schedule schedule schedule schedule schedule schedule schedule schedule schedule events events events';
			grid-template-rows: 100px 100px 437px 368px;
			margin-inline: auto;
			max-height: 1080px;
			max-width: 1920px;
			overflow: hidden;
		}
	}
</style>
