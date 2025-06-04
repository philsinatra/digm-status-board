<script lang="ts">
	import { innerWidth } from 'svelte/reactivity/window';
	import AnimatedQuote from '$lib/components/quote/AnimatedQuote.svelte';
	import Brand from '$lib/components/brand/Brand.svelte';
	import Countdown from '$lib/components/countdown/Countdown.svelte';
	import Faculty from '$lib/components/faculty/Faculty.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';
	import Marquee from '$lib/components/marquee/Marquee.svelte';
	import Quote from '$lib/components/quote/Quote.svelte';
	import Reel from '$lib/components/reel/Reel.svelte';
	import Resources from '$lib/components/resources/Resources.svelte';
	import Schedule from '$lib/components/schedule/Schedule.svelte';
	import Today from '$lib/components/today/Today.svelte';
	import Weather from '$lib/components/weather/Weather.svelte';
	import { invalidate } from '$app/navigation';

	type Props = {
		data: {
			posts: any[]; //eslint-disable-line
			success: boolean;
			total_posts: number;
			current_page: number;
			total_pages: number;
		};
	};

	let { data }: Props = $props();

	const db_refresh_interval = 3_600_000; // One hour
	const max_retries = 3;

	let is_refreshing = $state(false);
	let error: string | null = $state(null);
	let retry_count = $state(0);

	$effect(() => {
		if (typeof window === 'undefined') return;

		let active_timeout: ReturnType<typeof setTimeout> | null = null;

		const refresh = async () => {
			const now = Date.now();
			const next_refresh = Math.ceil(now / db_refresh_interval) * db_refresh_interval;
			const delay = next_refresh - now;

			active_timeout = setTimeout(async () => {
				try {
					is_refreshing = true;
					await invalidate('app:gallery');
					error = null;
					retry_count = 0;
					console.log(`Gallery data refreshed: ${new Date().toISOString()}`);
				} catch (e) {
					retry_count++;
					if (retry_count <= max_retries) setTimeout(refresh, 5_000);
					else {
						error = 'Failed to refresh gallery data';
						console.error(`Refresh error: ${e}`);
						retry_count = 0;
					}
				} finally {
					is_refreshing = false;
					active_timeout = null;
					if (import.meta.env.DEV) {
						console.log(`Refresh status: is_refreshing=${is_refreshing}, error=${error}`);
					}
					refresh();
				}
			}, delay);
		};

		refresh();

		return () => {
			if (active_timeout) clearTimeout(active_timeout);
		};
	});
</script>

<Brand />
<Countdown />
<Faculty />
<Reel />
<Schedule />

{#if (innerWidth.current ?? 0) >= 340}
	<Weather />
{/if}

{#if (innerWidth.current ?? 0) < 1920}
	<Footer />
	<Quote />
	<Resources />
{/if}

{#if (innerWidth.current ?? 0) >= 1920}
	<AnimatedQuote />
	<Marquee gallery_data={data} />
	<Today />
{/if}
