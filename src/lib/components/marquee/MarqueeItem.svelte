<script lang="ts">
	import { browser } from '$app/environment';
	import { get_date_and_day, truncate_string } from '$lib/scripts/utils';

	const initial_truncation_limit = 290;
	let { post } = $props();
	let lede: string = $state('');
	let truncate_limit: number = $state(initial_truncation_limit);

	/**
	 * Extracts the first paragraph from a content string.
	 * @param {string} content_string The content string.
	 * @returns {string} The lede.
	 */
	function extract_lede(content_string: string): string {
		if (typeof window === 'undefined') return '';

		const parser = new DOMParser();
		const doc = parser.parseFromString(content_string, 'text/html');
		const lede = doc.querySelector('p');
		return lede?.textContent?.trim() ?? '';
	}

	/**
	 * Extracts the type of post from its slug.
	 * Sets a specific priority for QR codes.
	 * @param {string} slug The post slug.
	 * @returns {string} The type of post.
	 */
	function parse_slug(slug: string): string {
		const classes = slug.split(',');
		if (classes.includes('events')) return 'events';
		if (classes.includes('alumni')) return 'alumni';
		if (classes.includes('news')) return 'news';
		if (classes.includes('awards')) return 'awards';
		return '';
	}

	$effect(() => {
		// Skip during SSR or if post is not yet loaded
		if (!browser || !post || post === undefined) return;

		truncate_limit = initial_truncation_limit; // Reset to default

		if (!post.event_end_date || !post.event_location) {
			truncate_limit = 470;
		}
	});

	$effect(() => {
		if (browser) {
			lede = truncate_string(extract_lede(post.post_content), truncate_limit);
		}
	});
</script>

<div class="event {post.term_slug}">
	<figure><img src={post.teaser_image} alt={post.post_title} /></figure>
	<div class="event-content">
		<div class="event-meta">
			<h2>{post.post_title}</h2>
			<p>{lede}</p>
		</div>
		{#if post.event_start_date}
			<ul>
				<li>
					{get_date_and_day(new Date(post.event_start_date))}
					{post.event_end_date ? ` - ${get_date_and_day(new Date(post.event_end_date))}` : ''}
				</li>
				{#if post.event_location}
					<li>{post.event_location}</li>
				{/if}
				{#if post.event_host}
					<li>Hosted by: {post.event_host}</li>
				{/if}
			</ul>
		{/if}
	</div>
	<div class="qr-code">
		<svg><use href="#qr-{parse_slug(post.term_slug)}" /></svg>
	</div>
</div>

<style>
	.qr-code {
		--code-position: 0;
		--code-size: 80px;

		bottom: var(--code-position);
		height: var(--code-size);
		position: absolute;
		right: var(--code-position);
		width: var(--code-size);

		svg {
			height: var(--code-size);
			width: var(--code-size);
		}
	}

	.event {
		display: flex;
		flex: 0 0 468px;
		flex-direction: column;
		height: 100%;
		margin: 0;
		overflow-y: hidden;
		position: relative;
		scroll-snap-align: start;

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

				h2 {
					font-size: var(--font-size-large);
					text-wrap: pretty;
				}

				p {
					color: var(--color-neutral-200);
					font-size: max(1rem, 110%);
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
