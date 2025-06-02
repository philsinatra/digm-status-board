<script lang="ts">
	import { browser } from '$app/environment';
	import { get_date_and_day, truncate_string } from '$lib/scripts/utils';

	let { event } = $props();
	let lede: string = $state('');
	let truncate_limit: number = 370;

	function extract_lede(content_string: string): string {
		if (typeof window === 'undefined') return '';

		const parser = new DOMParser();
		const doc = parser.parseFromString(content_string, 'text/html');
		const lede = doc.querySelector('p');
		return lede?.textContent?.trim() ?? '';
	}

	$effect(() => {
		if (!event.event_end_date || !event.event_location) {
			truncate_limit = 470;
		}
	});

	$effect(() => {
		if (browser) {
			lede = truncate_string(extract_lede(event.post_content), truncate_limit);
		}
	});
</script>

<div class="event">
	<figure><img src={event.teaser_image} alt={event.post_title} /></figure>
	<div class="event-content">
		<div class="event-meta">
			<h2>{event.post_title}</h2>
			<p>{@html lede}</p>
		</div>
		<ul>
			<li>
				{get_date_and_day(new Date(event.event_start_date))}
				{event.event_end_date ? ` - ${get_date_and_day(new Date(event.event_end_date))}` : ''}
			</li>
			{#if event.event_location}
				<li>{event.event_location}</li>
			{/if}
			{#if event.event_host}
				<li>Hosted by: {event.event_host}</li>
			{/if}
		</ul>
	</div>
</div>

<style>
	.event {
		display: flex;
		flex: 0 0 auto;
		flex-direction: column;
		height: 100%;
		min-width: 468px;
		scroll-snap-align: start;
		width: 100%;

		figure {
			margin: 0;
		}

		.event-content {
			display: flex;
			flex-direction: column;
			height: 100%;
			justify-content: space-between;
			padding: var(--space-medium);

			.event-meta {
				display: flex;
				flex-direction: column;
				flex-grow: 1;
				row-gap: var(--space-small);

				h2,
				p {
					margin: 0;
				}

				p {
					color: var(--color-neutral-200);
					line-height: var(--line-height);
				}
			}

			ul {
				color: var(--color-white);
				display: grid;
				font-weight: 500;
				list-style: none;
				margin: 0;
				padding: 0;
				row-gap: calc(var(--space-small) / 2);

				li {
					padding: 0;
				}
			}
		}
	}
</style>
