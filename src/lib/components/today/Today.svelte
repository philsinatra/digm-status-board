<script lang="ts">
	let date_time = $state(new Date());

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
		}, 60_000);
		return () => clearInterval(time_interval);
	});
</script>

<section id="today">
	<div class="today">
		<div class="time">{format_time(date_time)}</div>
		<div class="date">{format_date_time(date_time)}</div>
	</div>
</section>

<style>
	#today {
		background-color: var(--color-drexel-blue-light);
		border-radius: var(--radius);
		color: var(--color-drexel-blue);
		container-type: size;
		display: grid;
		grid-area: today;
		height: clamp(80px, 8vw, 100px);

		.today {
			display: grid;
			place-items: center;

			.time {
				align-self: end;
				font-size: 40cqh;
				font-weight: 800;
				grid-row: 1;
				letter-spacing: var(--letter-spacing-tight);
			}

			.date {
				align-self: start;
				font-size: clamp(var(--font-size-small), 4cqw, var(--font-size-medium));
				font-weight: 600;
				grid-row: 2;
				letter-spacing: var(--letter-spacing);
			}
		}
	}
</style>
