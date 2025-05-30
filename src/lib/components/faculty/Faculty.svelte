<script lang="ts">
	import '$lib/styles/components/_tables.css';
	import { innerWidth } from 'svelte/reactivity/window';
	import faculty from '$lib/data/faculty.json';
</script>

<section id="faculty">
	<div class="faculty">
		{#if (innerWidth.current ?? 0) < 1920}
			<h2>DIGM Faculty</h2>
		{/if}

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
				{#each faculty as { name, title, office, email }}
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
	</div>
</section>

<style>
	#faculty {
		background-color: var(--color-drexel-blue);
		border-radius: var(--radius);
		grid-area: faculty;
		min-height: 400px;
		overflow: hidden;

		.faculty {
			display: grid;
			height: 100%;
		}

		h2 {
			color: var(--color-white);
			margin-inline: var(--space-small);
		}

		table {
			thead {
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
				justify-self: stretch;
				table-layout: fixed;
				width: 100%;
			}
		}

		@media screen and (width >= 1920px) {
			min-height: unset;
		}
	}
</style>
