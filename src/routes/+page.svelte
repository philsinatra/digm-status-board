<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import Alumni from '$lib/components/alumni/Alumni.svelte';
	import AnimatedQuote from '$lib/components/quote/AnimatedQuote.svelte';
	import Brand from '$lib/components/brand/Brand.svelte';
	import Countdown from '$lib/components/countdown/Countdown.svelte';
	import Events from '$lib/components/events/Events.svelte';
	import Faculty from '$lib/components/faculty/Faculty.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';
	import Quote from '$lib/components/quote/Quote.svelte';
	import Reel from '$lib/components/reel/Reel.svelte';
	import Resources from '$lib/components/resources/Resources.svelte';
	import Schedule from '$lib/components/schedule/Schedule.svelte';
	import Today from '$lib/components/today/Today.svelte';
	import Weather from '$lib/components/weather/Weather.svelte';

	type Props = {
		data: {
			posts: any[];
			success: boolean;
			total_posts: number;
			current_page: number;
			total_pages: number;
		};
	};

	let { data }: Props = $props();
</script>

<Brand />

{#if (innerWidth.current ?? 0) >= 340}
	<Weather />
{/if}

<Schedule />
<Countdown />
{#if (innerWidth.current ?? 0) < 1920}
	<Quote />
{:else}
	<AnimatedQuote />
{/if}
<Reel />
<Events event_data={data} />
<Faculty />

{#if (innerWidth.current ?? 0) < 1920}
	<Alumni />
	<Resources />
	<Footer />
{/if}

{#if (innerWidth.current ?? 0) >= 1920}
	<Today />
{/if}
