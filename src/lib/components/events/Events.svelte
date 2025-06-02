<script lang="ts">
	import Event from '$lib/components/events/Event.svelte';

	let { event_data } = $props();
	let events_container: HTMLDivElement;
	let current_index = $state(0);
	let interval_id: NodeJS.Timeout;

	const scroll_pause = 30_000;

	$effect(() => {
		if (!event_data?.posts?.length) return;

		interval_id = setInterval(() => {
			scroll_to_next_event();
		}, scroll_pause);

		return () => {
			clearInterval(interval_id);
		};
	});

	function scroll_to_next_event() {
		if (!event_data?.posts?.length || !events_container) return;

		current_index = current_index >= event_data.posts.length - 1 ? 0 : current_index + 1;
		const event_element = events_container.children[current_index] as HTMLElement;
		if (!event_element) return;

		const scroll_position = current_index === 0 ? 0 : event_element.offsetLeft;
		events_container.scrollTo({ left: scroll_position, behavior: 'smooth' });
	}
</script>

<section id="events">
	<div aria-label="Event carousel" class="events" bind:this={events_container} role="region">
		{#if event_data?.posts?.length}
			{#each event_data.posts as event}
				{#if event.event_start_date}
					<Event {event} />
				{/if}
			{/each}
		{/if}
	</div>
</section>

<style>
	#events {
		background-color: var(--color-drexel-blue);
		border-radius: var(--radius);
		color: var(--color-white);
		grid-area: events;
		min-height: 100px;
		overflow: hidden;
	}

	.events {
		display: flex;
		flex-flow: row nowrap;
		height: 100%;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
	}
</style>
