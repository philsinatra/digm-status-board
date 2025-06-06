<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import type { Quote } from '$lib/types';
	import { init_event_source } from '$lib/scripts/eventSource';

	const { data_source = 'static/data/quotes.json' } = $props();
	const quote_data: Writable<Quote[]> = writable([]);
	const animation_duration = 500; // Duration of animation (matches --duration-long CSS variable)
	const initial_delay = 180_000; // 3 minutes between quote cycles
	const visible_duration = 10_000; // How long the quote is visible

	let current_quote: Quote | null = $state(null);
	let is_animating_in = $state(false);
	let is_animating_out = $state(false);
	let is_visible = $state(false);

	$effect(() => {
		return init_event_source({
			data_source,
			on_message: (data) => {
				return Array.isArray(data) ? data : [];
			},
			target_store: quote_data,
			log_prefix: 'quotes',
			debug: true
		});
	});

	function get_random_quote(): Quote {
		const random_index = Math.floor(Math.random() * $quote_data.length);
		return $quote_data[random_index] ?? { quote: '', author: '' };
	}

	function animate_quote_cycle() {
		// Step 1: Wait for initial delay before starting
		setTimeout(() => {
			// Step 2: Update the quote while off-screen and animate in
			current_quote = get_random_quote();
			is_animating_in = true;
			is_visible = true;

			// Step 3: Wait for animation in to complete + visible duration
			// animation_duration for the animation to complete + visible_duration for display time
			setTimeout(() => {
				// Step 4: Animate out
				is_animating_out = true;
				is_animating_in = false;

				// Step 5: Wait for animation out to complete, then reset states
				setTimeout(() => {
					is_visible = false;
					is_animating_out = false;

					// Step 6: Start the cycle again
					animate_quote_cycle();
				}, animation_duration + 100); // Add a small buffer to ensure animation completes
			}, visible_duration + animation_duration);
		}, initial_delay);
	}

	$effect(() => {
		animate_quote_cycle();
		return () => {};
	});
</script>

<section class:animating-in={is_animating_in} class:animating-out={is_animating_out} id="quote">
	<div class="quote">
		{#if is_visible && current_quote}
			<blockquote class="text-animate" transition:fade={{ duration: 500 }}>
				<p>{current_quote.quote ?? ''}</p>
				<p>— {current_quote.author ?? ''}</p>
			</blockquote>
		{/if}
	</div>
</section>

<style>
	@keyframes animating-in {
		from {
			bottom: -100dvh;
			opacity: 0;
		}

		to {
			bottom: 0;
			opacity: 1;
		}
	}

	@keyframes animating-out {
		from {
			bottom: 0;
			opacity: 1;
		}

		to {
			bottom: 100dvh;
			opacity: 0;
		}
	}

	@keyframes text-fade-slide {
		from {
			opacity: 0;
			transform: translateY(5px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	#quote {
		background: linear-gradient(to bottom, var(--color-drexel-blue), var(--color-drexel-blue-dark));
		bottom: -100dvh;
		color: var(--color-white);
		display: grid;
		grid-area: quote;
		height: 100%;
		left: 0;
		opacity: 0;
		position: absolute;
		width: 100%;
		z-index: 9999;

		.quote {
			container-type: size;
			display: grid;
			height: 100%;
			place-content: center;
			position: relative;
			width: 100%;

			blockquote {
				align-items: center;
				display: flex;
				flex-direction: column;
				font-size: clamp(var(--font-size-large), 14cqw, var(--font-size-xx-large));
				font-weight: 700;
				justify-content: center;
				letter-spacing: var(--letter-spacing-loose);
				line-height: var(--line-height);
				margin: 0;
				max-width: 50cqw;
				padding: 0;
				row-gap: var(--space-medium);

				p {
					margin: 0;
					text-wrap: balance;
					width: 100%;

					&:last-of-type {
						text-align: right;
					}
				}
			}
		}
	}

	.animating-in {
		animation: animating-in var(--duration-long) cubic-bezier(0.78, 0, 0.22, 1) forwards;
	}

	.animating-out {
		animation: animating-out var(--duration-long) cubic-bezier(0.78, 0, 0.22, 1) forwards;
	}

	.text-animate {
		animation: text-fade-slide 300ms ease-out forwards;
		animation-delay: calc(var(--duration-long) + 0ms);
		opacity: 0;
	}
</style>
