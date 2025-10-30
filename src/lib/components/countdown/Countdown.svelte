<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import { writable, type Writable } from 'svelte/store';
	import type { CountdownItem } from '$lib/types';
	import Details from '$lib/components/details/Details.svelte';
	import { init_event_source } from '$lib/scripts/eventSource';
	import { get_days_until, get_simple_date, slugify } from '$lib/scripts/utils';
	import '$lib/styles/components/_tables.css';

	const { data_source = 'static/data/countdown.json' } = $props();
	const countdown_data: Writable<CountdownItem[]> = writable([]);
	const current_time = $state<Date>(new Date());

	function format_date_key(iso_date: string): string {
		return iso_date.slice(0, 10).replace(/-/g, '');
	}

	/**
	 * Updates the current time every hour by forcing a reactivity cycle.
	 *
	 * The component itself is re-rendered when current_time changes because:
	 * - The component contains the current_time state variable
	 * - When that variable changes, Svelte marks the component as "dirty"
	 * - This triggers a re-render of the component
	 * - During re-render, get_days_until() is called again with the latest data
	 */
	$effect(() => {
		const interval = setInterval(
			() => {
				current_time.setTime(new Date().getTime());
				console.log('Refreshed countdown time:', current_time);
			},
			60 * 60 * 1000
		); // Update every hour (60 * 60 * 1000 ms)

		return () => clearInterval(interval);
	});

	$effect(() => {
		return init_event_source({
			data_source,
			on_message: (data) => {
				if (!Array.isArray(data)) return [];
				const future_items = data.filter((item: CountdownItem) => {
					return new Date(item.date_time) > new Date();
				});

				return future_items.sort((a: CountdownItem, b: CountdownItem) => {
					return new Date(a.date_time).getTime() - new Date(b.date_time).getTime();
				});
			},
			target_store: countdown_data,
			log_prefix: 'countdown',
			debug: true
		});
	});
</script>

{#snippet countdown_table()}
	<table>
		{#if (innerWidth.current ?? 0) >= 1920}
			<colgroup>
				<col style="width: 313px" />
				<col style="width: 90px" />
				<col style="width: 65px" />
			</colgroup>
		{/if}
		<thead>
			<tr>
				{#if (innerWidth.current ?? 0) < 665}
					<th>Description</th><th>Countdown</th>
				{:else}
					<th>Description</th><th>Date</th><th>Countdown</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each $countdown_data as { date_time, title } (`countdown-item-${format_date_key(date_time)}-${slugify(title)}`)}
				<tr>
					{#if (innerWidth.current ?? 0) < 665}
						<td>
							<b>{title}</b>
							<br />
							{get_simple_date(new Date(date_time))}
						</td>
					{:else}
						<td>
							<b>{title}</b>
						</td>
						<td>{get_simple_date(new Date(date_time))}</td>
					{/if}
					<td>
						{get_days_until(new Date(date_time))} days
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/snippet}

<section id="countdown">
	<div class="countdown">
		{#if (innerWidth.current ?? 0) < 600}
			<Details summary="Important Dates">
				{@render countdown_table()}
			</Details>
		{:else}
			{#if (innerWidth.current ?? 0) < 1920}
				<h2>Important Dates</h2>
			{/if}
			{@render countdown_table()}
		{/if}
	</div>
</section>

<style>
	#countdown {
		background-color: var(--color-drexel-blue);
		border-radius: var(--radius);
		display: grid;
		grid-area: countdown;
		justify-items: stretch;
		overflow: hidden;

		.countdown {
			border-radius: calc(var(--radius) / 2);
			overflow: hidden;

			h2 {
				color: var(--color-white);
				margin-inline: var(--space-small);
			}

			table {
				-webkit-overflow-scrolling: touch;
				overflow-y: auto;

				thead {
					tr {
						th:not(:first-of-type) {
							text-align: right;
						}

						@media screen and (width >= 1920px) {
							background-color: var(--color-drexel-blue);
							color: var(--color-white);
							font-weight: 700;
						}
					}
				}

				tbody {
					tr {
						td {
							padding: calc(var(--space-small) + 0.05rem) var(--space-small);
							text-wrap: pretty;
						}

						td:first-of-type {
							b {
								font-weight: 700;
							}
						}

						td:not(:first-of-type) {
							text-align: right;
						}
					}
				}
			}
		}

		@media screen and (width >= 600px) {
			min-height: 300px;
		}

		@media screen and (width >= 768px) {
			min-height: unset;
		}

		@media screen and (width >= 1920px) {
			.countdown {
				table {
					tbody {
						tr {
							height: 42px;
							min-height: 42px;
						}
					}
				}
			}
		}
	}
</style>
