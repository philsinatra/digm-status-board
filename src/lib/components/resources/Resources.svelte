<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import { writable, type Writable } from 'svelte/store';
	import type { ResourceLink } from '$lib/types';
	import Details from '$lib/components/details/Details.svelte';
	import { init_event_source } from '$lib/scripts/eventSource';
	import { slugify } from '$lib/scripts/utils';

	const { data_source = 'static/data/resources.json' } = $props();
	const resource_data: Writable<ResourceLink[]> = writable([]);
	const categories: { name: 'resources' | 'clubs'; label: string }[] = [
		{ name: 'resources', label: 'Form more DIGM resources, check out the links below:' },
		{ name: 'clubs', label: 'Student Clubs' }
	];

	$effect(() => {
		return init_event_source({
			data_source,
			on_message: (data) => {
				return Array.isArray(data) ? data : [];
			},
			target_store: resource_data,
			log_prefix: 'resources',
			debug: true
		});
	});

	const grouped_items = $derived({
		resources: $resource_data.filter((item) => item.category === 'resources'),
		clubs: $resource_data.filter((item) => item.category === 'clubs')
	});
</script>

{#snippet resources_list()}
	<div class="resource-lists">
		{#each categories as { name, label } (`resource-group-${name}`)}
			{#if grouped_items[name].length > 0}
				<h3>{label}</h3>
				<ul>
					{#each grouped_items[name] as { href, title } (`resource-${slugify(title)}`)}
						<li>
							<a {href} target="_blank" rel="noopener noreferrer">{title}</a>
						</li>
					{/each}
				</ul>
			{/if}
		{/each}
	</div>
{/snippet}

<section id="resources">
	<div class="resources">
		{#if (innerWidth.current ?? 0) < 600}
			<Details summary="DIGM Resource">
				{@render resources_list()}
			</Details>
		{:else}
			<h2>DIGM Resource</h2>
			{@render resources_list()}
		{/if}
	</div>
</section>

<style>
	#resources {
		background-color: var(--color-drexel-blue);
		border-radius: var(--radius);
		grid-area: resources;
		overflow: hidden;

		.resources {
			display: flex;
			flex-direction: column;
			height: 100%;
			overflow: hidden;

			h2 {
				color: var(--color-white);
				margin-inline: var(--space-small);
			}

			.resource-lists {
				align-self: stretch;
				background: linear-gradient(to bottom, var(--color-white), var(--color-neutral-100));
				border-bottom: 1px solid var(--color-neutral-200);
				border-left: 1px solid var(--color-neutral-200);
				border-right: 1px solid var(--color-neutral-200);
				flex-grow: 1;
				padding: var(--space-medium);

				h3 {
					color: var(--color-drexel-blue);
					font-size: var(--font-size-medium);
					font-weight: 650;
					line-height: 1.2;
					margin: 0;
				}

				ul {
					display: grid;
					font-size: var(--font-size-xx-small);
					row-gap: var(--space-small);

					li {
						text-wrap: balance;

						a {
							color: var(--color-drexel-blue-dark);
							font-weight: 500;
							line-height: calc(var(--line-height) / 3);
							text-decoration: none;
							white-space: wrap;

							@media (hover: hover) and (pointer: fine) {
								&:hover {
									color: var(--color-drexel-blue);
									text-decoration: underline;
									transition: color var(--transition);
								}
							}
						}
					}
				}
			}
		}

		@media screen and (width >= 600px) {
			min-height: 400px;
		}
	}
</style>
