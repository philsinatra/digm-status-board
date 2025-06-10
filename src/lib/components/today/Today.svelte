<script lang="ts">
	import Bubbles from '$lib/components/bubbles/Bubbles.svelte';

	let date_time = $state(new Date());
	const interval_duration = 1_000;

	const date_options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'America/New_York'
	};

	const time_options: Intl.DateTimeFormatOptions = {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
		second: '2-digit',
		timeZone: 'America/New_York'
	};

	function format_date_time(date: Date): string {
		return date.toLocaleDateString('en-US', date_options);
	}

	function format_time(date: Date): string {
		return date.toLocaleTimeString('en-US', time_options);
	}

	$effect(() => {
		date_time = new Date();
		const time_interval = setInterval(() => {
			date_time = new Date();
		}, interval_duration);
		return () => clearInterval(time_interval);
	});
</script>

<section id="today">
	<div class="today">
		<div class="time">{format_time(date_time)}</div>
		<div class="date">{format_date_time(date_time)}</div>
	</div>
	<Bubbles parent_component="today" />
</section>

<style>
	#today {
		background: linear-gradient(to right, var(--color-drexel-blue), var(--color-drexel-blue-dark));
		border-radius: var(--radius);
		color: var(--color-neutral-50);
		container-type: size;
		display: grid;
		grid-area: today;
		height: clamp(80px, 8vw, 100px);
		position: relative;

		.today {
			display: grid;
			place-items: center;

			.time {
				align-self: end;
				font-family: var(--font-family-mono);
				font-size: 40cqh;
				font-weight: 500;
				grid-row: 1;
				letter-spacing: var(--letter-spacing-tight);
			}

			.date {
				align-self: start;
				font-size: clamp(var(--font-size-small), 4cqw, var(--font-size-medium));
				font-weight: 500;
				grid-row: 2;
				letter-spacing: var(--letter-spacing-loose);
			}
		}
	}
</style>
