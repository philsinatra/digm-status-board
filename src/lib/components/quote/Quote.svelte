<script lang="ts">
	import { fade } from 'svelte/transition';
	import { writable, type Writable } from 'svelte/store';
	import type { Quote } from '$lib/types';

	const { data_source = 'static/data/quotes.json' } = $props();
	const quote_data: Writable<Quote[]> = writable([]);

	$effect(() => {
		const source = new EventSource(
			`/api/data-stream?data_source=${encodeURIComponent(data_source)}`
		);

		source.onopen = () => {
			console.log('EventSource connection opened for quotes');
		};

		source.onmessage = (event) => {
			console.log('Received SSE message:', event.data);
			try {
				const new_data = JSON.parse(event.data);
				quote_data.set(new_data);
			} catch (error) {
				console.error('Error parsing SSE data:', error);
			}
		};

		source.onerror = (error) => {
			console.error('SSE EventSource error {quotes}:', error);
			source.close();
		};

		return () => {
			source.close();
		};
	});

	let active_quote_key = $state(Math.floor(Math.random() * $quote_data.length));

	function get_random_quote() {
		const random_index = Math.floor(Math.random() * $quote_data.length);
		active_quote_key = random_index;
	}

	$effect(() => {
		const interval = setInterval(get_random_quote, 60_000);
		return () => clearInterval(interval);
	});
</script>

<section id="quote">
	<div class="quote">
		{#if $quote_data[active_quote_key]}
			{#key active_quote_key}
				<blockquote transition:fade={{ duration: 500 }}>
					<p>{$quote_data[active_quote_key]?.quote ?? ''}</p>
					<p>— {$quote_data[active_quote_key]?.author ?? ''}</p>
				</blockquote>
			{/key}
		{/if}
	</div>
</section>

<style>
	#quote {
		background: linear-gradient(to bottom, var(--color-drexel-blue), var(--color-drexel-blue-dark));
		border-radius: var(--radius);
		color: var(--color-white);
		grid-area: quote;
		min-height: 300px;
		position: relative;

		.quote {
			container-type: size;
			display: grid;
			height: 100%;
			place-items: center;
			position: relative;

			blockquote {
				align-items: center;
				display: flex;
				flex-direction: column;
				font-size: clamp(var(--font-size-small), 7cqw, var(--font-size-x-large));
				font-weight: 600;
				inset: 0;
				justify-content: center;
				letter-spacing: var(--letter-spacing);
				line-height: var(--line-height);
				margin: 0;
				padding: 8cqw;
				position: absolute;
				row-gap: var(--space-medium);

				p {
					height: auto;
					margin: 0;
					text-wrap: pretty;
					width: 100%;

					&:last-of-type {
						text-align: right;
					}
				}
			}
		}

		@media screen and (width >= 768px) {
			display: none;
			position: absolute;
		}
	}
</style>
