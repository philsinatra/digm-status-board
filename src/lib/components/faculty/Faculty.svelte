<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import { writable, type Writable } from 'svelte/store';
	import type { FacultyItem } from '$lib/types';
	import Details from '$lib/components/details/Details.svelte';
	import { init_event_source } from '$lib/scripts/eventSource';
	import { slugify } from '$lib/scripts/utils';
	import '$lib/styles/components/_tables.css';

	const { data_source = 'static/data/faculty.json' } = $props();
	const faculty_data: Writable<FacultyItem[]> = writable([]);

	$effect(() => {
		return init_event_source({
			data_source,
			on_message: (data) => {
				return Array.isArray(data) ? data : [];
			},
			target_store: faculty_data,
			log_prefix: 'faculty',
			debug: true
		});
	});
</script>

{#snippet faculty_table()}
	<table>
		{#if (innerWidth.current ?? 0) >= 1920}
			<colgroup>
				<col style="width: 114px" />
				<col style="width: 205px" />
				<col style="width: 78px" />
				<col style="width: 131px" />
			</colgroup>
		{/if}
		<thead>
			<tr>
				{#if (innerWidth.current ?? 0) < 665}
					<th>Name</th>
					<th>Office</th>
				{:else}
					<th>Name</th>
					<th>Title</th>
					<th>Office</th>
					<th>Email</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each $faculty_data as { name, title, office, email } (`faculty-item-${slugify(name)}`)}
				<tr>
					{#if (innerWidth.current ?? 0) < 665}
						<td><a href="mailto:{email}">{name}</a><br />{title}</td>
						<td>{office}</td>
					{:else if (innerWidth.current ?? 0) < 1920}
						<td><b>{name}</b></td>
						<td>{title}</td>
						<td>{office}</td>
						<td><a href="mailto:{email}">{email}</a></td>
					{:else}
						<td style="width: 135px"><b>{name}</b></td>
						<td style="width: 135px">{title}</td>
						<td style="width: 135px">{office}</td>
						<td style="width: 135px"><a href="mailto:{email}">{email}</a></td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
{/snippet}

<section id="faculty">
	<div class="faculty">
		{#if (innerWidth.current ?? 0) < 600}
			<Details summary="DIGM Faculty">
				{@render faculty_table()}
			</Details>
		{:else}
			{#if (innerWidth.current ?? 0) < 1920}
				<h2>DIGM Faculty</h2>
			{/if}
			{@render faculty_table()}
		{/if}
	</div>
</section>

<style>
	#faculty {
		background-color: var(--color-drexel-blue);
		border-radius: var(--radius);
		grid-area: faculty;
		overflow: hidden;

		.faculty {
			align-items: start;
			display: grid;
			height: 100%;
		}

		h2 {
			color: var(--color-white);
			margin-inline: var(--space-small);

			@media screen and (width >= 1280px) {
				margin-block-end: -12px;
			}
		}

		table {
			place-self: stretch stretch;

			thead {
				@media screen and (width >= 1280px) {
					align-self: stretch;
				}

				@media screen and (width < 1920px) {
					tr {
						height: 38px;
					}
				}

				@media screen and (width >= 1920px) {
					tr {
						background-color: var(--color-drexel-blue);
						color: var(--color-white);
						font-weight: 700;
					}
				}
			}

			@media screen and (width >= 1920px) {
				border-radius: var(--radius);
				display: table;
				place-self: stretch stretch;
				table-layout: fixed;
				width: 100%;
			}
		}

		@media screen and (width >= 600px) {
			min-height: 400px;
		}

		@media screen and (width >= 1920px) {
			min-height: unset;
		}
	}
</style>
