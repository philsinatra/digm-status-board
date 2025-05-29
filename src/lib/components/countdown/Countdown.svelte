<script lang="ts">
	import { countdown } from '$lib/data/countdown.json';
</script>

<section id="countdown">
	<div class="countdown">
		<ul>
			{#each countdown as event}
				<li>
					{event.title}
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	#countdown {
		background-color: var(--color-drexel-blue);
		border-radius: var(--radius);
		display: grid;
		grid-area: countdown;
		justify-items: stretch;
		min-height: 300px;
		overflow: hidden;
		padding: var(--space-small);

		.countdown {
			background-color: var(--color-neutral-200);
			border-radius: calc(var(--radius) / 2);
			overflow: hidden;

			ul {
				list-style: none;
				margin: 0;
				padding: 0;

				li {
					padding: var(--space-medium);
				}
			}
		}

		@media screen and (width >= 768px) {
			min-height: unset;
		}
	}
</style>
