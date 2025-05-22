<script lang="ts">
	import '$lib/styles/app.css';

	let { children } = $props();
</script>

<main>{@render children?.()}</main>
