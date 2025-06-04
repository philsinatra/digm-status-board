<script>
	import Card from '$lib/components/card/Card.svelte';
	// import schedule from '../../../../static/data/schedule.json';

	import { onMount } from 'svelte';
const { schedule = 'static/data/schedule.json' } = $props();
	let currentTime = new Date();

	function getCurrentHourDecimal() {
		const h = currentTime.getHours();
		const m = currentTime.getMinutes();
		return h + m / 60;
	}

	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 60 * 1000); // update every minute
		return () => clearInterval(interval);
	});

	// Convert to grid column number (e.g., 8am = column 2)
	function getCurrentTimeColumn() {
		return getCurrentHourDecimal() - 7 + 1; // +1 offset for room label column
	}

	const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
	
  const scheduleHours = Array.from({ length: 15 }, (_, i) => {
		const hour = 8 + i;
		const period = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour % 12 === 0 ? 12 : hour % 12;
		return `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
	});

	const rooms = Array.from(new Set(schedule.map((s) => s.roomCode)));

	const getGridColumn = (time) => {
		const hour = parseInt(time.split(':')[0], 10);
		return hour - 7; // 8AM starts at column 1
	};

	const getDuration = (start, end) => {
		const [sh, sm] = start.split(':').map(Number);
		const [eh, em] = end.split(':').map(Number);
		return eh + em / 60 - (sh + sm / 60);
	};

	let selectedDay = 'THU';
</script>

<section id="schedule">
	<Card>
		<nav slot="header" class="weekday-selector">
			{#each days as d}
				<button class:selected={d === selectedDay} on:click={() => (selectedDay = d)}>
					<span class="full">{d}</span>
					<span class="short">{d[0]}</span>
				</button>
			{/each}
		</nav>
		<div class="schedule-grid">
			<!-- Top-left -->
			<div class="grid-cell" style="grid-column: 1; grid-row: 1"></div>
			<!-- Hour headers -->
			{#each scheduleHours as hour, i}
				<div class="schedule-column grid-cell--hours grid-cell" style="grid-column: {i + 2}; grid-row: 1">
					{hour}
				</div>
			{/each}
			{#each rooms as room, i}
				<div class="schedule-row grid-cell--room grid-cell {i % 2 === 0 ? 'grid-cell--even' : 'grid-cell--odd'}" style="grid-column: 1; grid-row: {i + 2}">{room}</div>
				{#each Array(15) as _, j}
					<div class="grid-cell grid-cell--body {i % 2 === 0 ? 'grid-cell--even' : 'grid-cell--odd'}" style="grid-column: {j + 2}; grid-row: {i + 2}"></div>
				{/each}
			{/each}
			{#each schedule as event}
				{#if event.day === selectedDay}
					<div
						class="schedule-event event"
						style="
                grid-column: {getGridColumn(event.beginTime)} / span {Math.ceil(
							getDuration(event.beginTime, event.endTime)
						)};
                grid-row: {rooms.indexOf(event.roomCode) + 2}
              "
					>
						{`${event.subjCode} ${event.crseNumb} (${event.seqNumb}) (${event.courseTitle})`}
					</div>
				{/if}
			{/each}
			<div
				class="schedule-current-time"
				style="left: calc((100% / 15) * {getCurrentTimeColumn() - 1});"
			></div>
		</div>
		<div slot="footer">Footer actions go here</div>
	</Card>
</section>

<style>
	#schedule {
		border-radius: var(--radius);
		grid-area: schedule;
		overflow-x: auto;
	}

	.schedule-grid {
		align-items: stretch;
		border: 1px solid #ccc;
		border-collapse: collapse;
		display: grid;
		grid-auto-rows: 60px;
		grid-template-columns: 100px repeat(15, 1fr);
		position: relative;
	}

	.schedule-column {
    align-items: center;
		color: var(--color-black);
        display: flex;
		font-size: 0.75rem;
    justify-content: center;
		text-align: center;
	}

	.schedule-row {
		align-items: center;
		background-color: #f9f9f9;
		display: flex;
		font-weight: bold;
		padding-right: 0.5rem;
		white-space: nowrap;
	}

	.grid-cell {
		border: 1px solid #ccc;
		box-sizing: border-box;
		min-height: 0;
		min-width: 0;
	}


  .grid-cell--even {
  background-color: #f9f9f9;
}

.grid-cell--odd {
  background-color: #efefef;
}

	.event {
		background-color: #ffa726;
		border-radius: 4px;
		color: white;
		font-size: 0.75rem;
		overflow: hidden;
		padding: 0.25rem;
		text-overflow: ellipsis;
		white-space: nowrap;
		z-index: 2;
	}

	.weekday-selector {
    display: flex;
    gap: 1rem;
		padding: 1rem;
	}

	.weekday-selector button {
		background: white;
		border: none;
		border-radius: 9999px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: bold;
		padding: 0.5rem 1rem;
	}

	.weekday-selector button.selected {
		background-color: #ffc300;
		color: black;
	}

	.weekday-selector .short {
		display: none;
	}

	.weekday-selector .full {
		display: inline;
	}

	@media (width <= 768px) {
		.weekday-selector .short {
			display: inline;
		}

		.weekday-selector .full {
			display: none;
		}
	}

	@media (width <= 768px) {
		.schedule-grid {
			font-size: 0.6rem;
			grid-auto-rows: 50px;
		}
	}

	.schedule-current-time {
		background-color: var(--color-drexel-blue);
		bottom: 0;
		position: absolute;
		top: 0;
		width: 2px;
		z-index: 10;
	}
</style>
