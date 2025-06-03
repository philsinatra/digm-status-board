<script lang="ts">
	import MarqueeItem from '$lib/components/marquee/MarqueeItem.svelte';
	import { shuffle_array } from '$lib/scripts/utils';

	const debug_mode = false;
	const scroll_pause = 30_000;

	let { gallery_data } = $props();
	let events_container: HTMLDivElement;
	let current_index = $state(0);
	let interval_id: NodeJS.Timeout;
	let shuffled_gallery_data = $state({
		...gallery_data,
		posts: gallery_data.posts ? shuffle_array(gallery_data.posts) : []
	});

	if (debug_mode) {
		$inspect(gallery_data);
	}

	$effect(() => {
		if (!gallery_data?.posts?.length) return;

		// Log initial positions and offsetParent for debugging
		if (debug_mode) {
			if (events_container) {
				Array.from(events_container.children).forEach((child, idx) => {
					const el = child as HTMLElement;
					const computed_style = getComputedStyle(el);
					const offset_parent = el.offsetParent?.tagName || 'None';
					console.log(
						`Event ${idx}: offsetLeft=${el.offsetLeft}, width=${computed_style.width}, marginLeft=${computed_style.marginLeft}, marginRight=${computed_style.marginRight}, offsetParent=${offset_parent}`
					);
				});
				// Log container's position
				const container_rectangle = events_container.getBoundingClientRect();
				console.log(
					`.events container: left=${container_rectangle.left}, width=${container_rectangle.width}, scrollLeft=${events_container.scrollLeft}`
				);
			}
		}

		interval_id = setInterval(() => {
			scroll_to_next_event();
		}, scroll_pause);

		return () => {
			clearInterval(interval_id);
		};
	});

	$effect(() => {
		// Update shuffled_gallery_data only if gallery_data changes
		shuffled_gallery_data = {
			...gallery_data,
			posts: gallery_data.posts ? [...gallery_data.posts].sort(() => 0.5 - Math.random()) : []
		};
		if (debug_mode) {
			$inspect('Original posts:', gallery_data.posts);
			$inspect('Shuffled posts:', shuffled_gallery_data.posts);
		}
	});

	/**
	 * Scroll to the next event in the marquee.
	 * @return {void}
	 */
	function scroll_to_next_event() {
		if (!gallery_data?.posts?.length || !events_container) return;

		current_index = current_index >= gallery_data.posts.length - 1 ? 0 : current_index + 1;
		const event_element = events_container.children[current_index] as HTMLElement;
		if (!event_element) {
			console.error(`No element found at index: ${current_index}`);
			return;
		}

		// Use index-based scroll position instead of offsetLeft
		const scroll_position = current_index * 468;

		if (debug_mode) {
			const computed_style = getComputedStyle(event_element);
			console.log(
				`Scrolling to index: ${current_index}, scrollPosition: ${scroll_position}, offsetLeft: ${event_element.offsetLeft}, width: ${computed_style.width}, container scrollLeft: ${events_container.scrollLeft}`
			);
		}

		events_container.scrollTo({ left: scroll_position, behavior: 'smooth' });

		if (debug_mode) {
			// Verify scroll position after a delay
			setTimeout(() => {
				console.log(`After scroll, scrollLeft: ${events_container.scrollLeft}`);
			}, 500);
		}
	}
</script>

<section id="events">
	<div aria-label="Event carousel" class="events" bind:this={events_container} role="region">
		{#if shuffled_gallery_data?.posts?.length}
			{#each shuffled_gallery_data.posts as post}
				<MarqueeItem {post} />
			{/each}
		{/if}
	</div>
</section>

<style>
	#events {
		background: linear-gradient(
			to bottom right,
			var(--color-drexel-blue) 50%,
			var(--color-drexel-blue-dark)
		);
		border-radius: var(--radius);
		color: var(--color-white);
		grid-area: marquee;
		max-width: none;
		min-height: 100px;
		overflow: hidden;
		width: 100%;
	}

	.events {
		display: flex;
		flex-flow: row nowrap;
		gap: 0;
		height: 100%;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		width: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}
</style>
