<script lang="ts">
	import { fade } from 'svelte/transition'
	import type { Quote } from '$lib/types'
	import quote_data from '$lib/data/quotes.json'
	import { reel_status } from '$lib/stores/reel'

	const animation_duration = 500 // Duration of animation (matches --duration-long)
	const initial_delay = 180_000
	const visible_duration = 10_000

	let current_quote: Quote | null = $state(null)
	let show_component = $state(false) // Controls overall component visibility
	let show_quote = $state(false) // Controls inner quote visibility
	let animation_phase: 'entering' | 'visible' | 'exiting' | 'hidden' = $state('hidden')

	$effect(() => {
		reel_status.set(show_component ? 'hidden' : 'visible')
	})

	function get_random_quote(): Quote {
		const random_index = Math.floor(Math.random() * quote_data.length)
		return quote_data[random_index] ?? { quote: 'Default quote', author: 'Unknown' }
	}

	function start_quote_cycle() {
		current_quote = get_random_quote()

		animation_phase = 'entering'
		show_component = true

		setTimeout(() => {
			show_quote = true
			animation_phase = 'visible'
		}, 50)

		setTimeout(() => {
			animation_phase = 'exiting'
			show_quote = false

			setTimeout(() => {
				show_component = false
				animation_phase = 'hidden'

				setTimeout(() => {
					start_quote_cycle()
				}, initial_delay)
			}, animation_duration + 100)
		}, visible_duration)
	}

	$effect(() => {
		const timer = setTimeout(() => {
			start_quote_cycle()
		}, initial_delay)

		return () => clearTimeout(timer)
	})
</script>

{#if show_component && current_quote}
	<section
		id="quote"
		class="quote-section"
		class:entering={animation_phase === 'entering'}
		class:visible={animation_phase === 'visible'}
		class:exiting={animation_phase === 'exiting'}
	>
		<div class="quote-container">
			{#if show_quote}
				<blockquote transition:fade={{ duration: 300 }}>
					<p class="quote-text">{current_quote.quote}</p>
					<p class="quote-author">— {current_quote.author}</p>
				</blockquote>
			{/if}
		</div>
	</section>
{/if}

<style>
	.quote-section {
		background: linear-gradient(to bottom, var(--color-drexel-blue), var(--color-drexel-blue-dark));
		color: var(--color-white);
		display: grid;
		grid-area: quote;
		height: 100vh;
		left: 0;
		opacity: 0;
		position: fixed;
		top: 0;
		transform: translateY(100vh);
		transition:
			transform 500ms cubic-bezier(0.78, 0, 0.22, 1),
			opacity 500ms cubic-bezier(0.78, 0, 0.22, 1);
		width: 100vw;
		z-index: 9999;
	}

	.quote-section.entering {
		opacity: 1;
		transform: translateY(0);
	}

	.quote-section.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.quote-section.exiting {
		opacity: 0;
		transform: translateY(-100vh);
	}

	.quote-container {
		container-type: size;
		display: grid;
		height: 100%;
		padding: var(--space-large, 2rem);
		place-content: center;
		width: 100%;
	}

	blockquote {
		align-items: center;
		display: flex;
		flex-direction: column;
		font-size: clamp(1.5rem, 8vw, 4rem);
		font-weight: 700;
		gap: var(--space-medium, 1rem);
		justify-content: center;
		letter-spacing: var(--letter-spacing-loose, 0.02em);
		line-height: var(--line-height, 1.4);
		margin: 0;
		max-width: min(80vw, 50rem);
		padding: 0;
		text-align: center;
	}

	.quote-text {
		line-height: 1.3;
		margin: 0;
		text-wrap: balance;
		width: 100%;
	}

	.quote-author {
		font-size: 0.8em;
		font-weight: 400;
		line-height: 1.3;
		margin: 0;
		opacity: 0.9;
	}
</style>
