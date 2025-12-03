<script lang="ts">
	import { browser } from '$app/environment'
	import QRCode from 'qrcode'
	import { get_date_and_day, truncate_string } from '$lib/scripts/utils'

	const initial_truncation_limit = 220
	let { post } = $props()
	let lede: string = $state('')
	let truncate_limit: number = $state(initial_truncation_limit)

	/**
	 * Extracts the first paragraph from a content string.
	 * @param {string} content_string The content string.
	 * @returns {string} The lede.
	 */
	function extract_lede(content_string: string): string {
		if (typeof window === 'undefined') return ''

		const parser = new DOMParser()
		const doc = parser.parseFromString(content_string, 'text/html')
		const lede = doc.querySelector('p')
		return lede?.textContent?.trim() ?? ''
	}

	$effect(() => {
		// Skip during SSR or if post is not yet loaded
		if (!browser || !post || post === undefined) return

		truncate_limit = initial_truncation_limit // Reset to default

		if (!post.event_end_date || !post.event_location) {
			truncate_limit = 470
		}
	})

	$effect(() => {
		if (browser) {
			lede = truncate_string(extract_lede(post.post_content), truncate_limit)
		}
	})

	let url = `https://digm.drexel.edu/${post.post_name}`
	let qr_svg: string | undefined = $state('')
	let error: string | undefined

	async function generate_qr_code(url: string) {
		try {
			qr_svg = await QRCode.toString(url, {
				type: 'svg',
				margin: 2,
				color: {
					dark: '#ffffff',
					light: '#9493000'
				}
			})
		} catch (err) {
			error = (err as Error).message
			console.error(error)
		}
	}

	$effect(() => {
		generate_qr_code(url)
	})
</script>

<div class="event {post.term_slug}">
	<figure><img src={post.teaser_image} alt={post.post_title} /></figure>
	<div class="event-content">
		<h2>{post.post_title}</h2>
		<div class="event-details">
			<p>{lede}</p>
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
		{#if qr_svg}
			<div class="qr-code">
				{@html qr_svg}
			</div>
		{/if}
	</div>
</div>

<style>
	.qr-code {
		--code-size: 80px;

		bottom: 12px;
		height: var(--code-size);
		position: absolute;
		right: 18px;
		width: var(--code-size);
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
			display: grid;
			grid-template-columns: auto 100px;
			padding: var(--space-medium);
			row-gap: var(--space-small);

			h2,
			p {
				margin: 0;
			}

			h2 {
				color: var(--color-white);
				font-size: calc(var(--font-size-medium) * 1.125);
				grid-column: 1 / -1;
				text-wrap: pretty;
			}

			p {
				color: var(--color-blue-100);
				font-size: max(1rem, 110%);
				line-height: var(--line-height);
			}

			ul {
				color: var(--color-blue-100);
				display: grid;
				font-weight: 500;
				list-style: none;
				margin: var(--space-small) 0 0;
				padding: 0;
				row-gap: calc(var(--space-small) / 2);

				li {
					padding: 0;
				}
			}
		}
	}
</style>
