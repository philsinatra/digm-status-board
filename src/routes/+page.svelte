<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import Alumni from '$lib/components/alumni/Alumni.svelte';
	import Brand from '$lib/components/brand/Brand.svelte';
	import Countdown from '$lib/components/countdown/Countdown.svelte';
	import Events from '$lib/components/events/Events.svelte';
	import Faculty from '$lib/components/faculty/Faculty.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';
	import Quote from '$lib/components/quote/Quote.svelte';
	import Reel from '$lib/components/reel/Reel.svelte';
	import Resources from '$lib/components/resources/Resources.svelte';
	import Schedule from '$lib/components/schedule/Schedule.svelte';
	import Weather from '$lib/components/weather/Weather.svelte';
	import Today from '$lib/components/today/Today.svelte';
</script>

<Brand />

{#if (innerWidth.current ?? 0) >= 340}
	<Weather />
{/if}

<Schedule />
<Countdown />
<Quote />
<Reel />
<Events />
<Faculty />

{#if (innerWidth.current ?? 0) < 1920}
	<Alumni />
	<Resources />
	<Footer />
{/if}

{#if (innerWidth.current ?? 0) >= 1920}
	<Today />
{/if}
