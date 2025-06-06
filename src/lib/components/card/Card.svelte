<script lang="ts">
	let { header = null, children, footer = null } = $props();
</script>

<div class="card">
	{#if header}
		<header class="card-header">
			{@render header()}
		</header>
	{/if}
	<div class="card-content">
		{@render children()}
	</div>

	{#if footer}
		<footer class="card-footer">
			{@render footer()}
		</footer>
	{/if}
</div>

<style>
	.card {
		background-color: var(--color-white);
		border-radius: calc(var(--radius) / 2);
	}

	.card-header,
	.card-footer {
		background-color: var(--color-drexel-blue);
		color: var(--color-white);
		font-weight: bold;
		padding: var(--space-small) 0;
	}

	.card-header {
		border-bottom: 1px solid var(--color-neutral-50);
		color: var(--color-white);
		padding: var(--space-medium);
	}

	.card-content {
		background-color: var(--color-drexel-neutral-gray);
		color: var(--color-drexel-blue);
	}

	.card-footer {
		border-top: 1px solid var(--color-neutral-50);
		font-size: 0.9rem;
	}
</style>
