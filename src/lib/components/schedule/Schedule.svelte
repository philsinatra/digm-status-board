<script lang="ts">
	import Card from '$lib/components/card/Card.svelte';
	import { useEventSource } from '$lib/scripts/eventSource';
	import type { ScheduleItem } from '$lib/types';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const { data_source = 'static/data/schedule.json' } = $props();
	const schedule_data = writable<ScheduleItem[]>([]);

	$effect(() => {
		useEventSource({
			dataSource: data_source,
			onMessage: (data) => {
				return Array.isArray(data) ? data : [];
			},
			targetStore: schedule_data,
			logPrefix: 'schedule'
		});
	});

	// Track current time for the current time indicator
	let currentTime = new Date();

	function getCurrentHourDecimal() {
		const h = currentTime.getHours();
		const m = currentTime.getMinutes();
		return h + m / 60;
	}

	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 60 * 1000);
		return () => clearInterval(interval);
	});
	function getCurrentTimeColumn() {
		return getCurrentHourDecimal() - 7 + 1;
	}

	const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

	const scheduleHours = $state<string[]>(
		Array.from({ length: 15 }, (_, i) => {
			const hour = 8 + i;
			const period = hour >= 12 ? 'PM' : 'AM';
			const displayHour = hour % 12 === 0 ? 12 : hour % 12;
			return `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
		})
	);
	const rooms = $state<string[]>([]);

	$effect(() => {
		const uniqueRooms = Array.from(
			new Set($schedule_data.map((item) => normalizeRoomCode(item.room_code)))
		).filter((c) => c !== '' && c !== 'null' && c !== 'undefined');

		// Shallow compare; only update if different to avoid infinite loop
		if (JSON.stringify(rooms) !== JSON.stringify(uniqueRooms)) {
			rooms.length = 0;
			rooms.push(...uniqueRooms);
		}
	});

	// Helper to normalize room codes as string
	function normalizeRoomCode(code: string | number | null): string {
		return code == null ? '' : String(code);
	}

	// Helper for grid column based on time (number, e.g. 1800)
	function getGridColumn(time: number | null): number {
		if (typeof time === 'number') {
			const hour = Math.floor(time / 100);
			return hour - 7 + 1;
		}
		return 1;
	}



	const selectedDayDefaultMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
	let selectedDayState = $state<string>(selectedDayDefaultMap[new Date().getDay()]);
</script>

<section id="schedule">
	<Card>
		<nav slot="header" class="weekday-selector">
			{#each days as d}
				<button class:selected={d === selectedDayState} onclick={() => (selectedDayState = d)}>
					<span class="full">{d}</span>
					<span class="short">{d === 'SUN' ? 'U' : d[0]}</span>
				</button>
			{/each}
		</nav>
		<div class="schedule-grid-wrapper">
			<div class="schedule-grid">
				<!-- Top-left -->
				<div class="grid-cell" style="grid-column: 1; grid-row: 1"></div>
				<!-- Hour headers -->
				{#if scheduleHours && scheduleHours.length}
					{#each scheduleHours as hour, i}
						<div
							class="schedule-column grid-cell--hours grid-cell"
							style="grid-column: {i + 2}; grid-row: 1"
						>
							{hour}
						</div>
					{/each}
				{/if}
				{#if rooms && rooms.length}
					{#each rooms as room, i}
						<div
							class="schedule-row grid-cell--room grid-cell {i % 2 === 0
								? 'grid-cell--even'
								: 'grid-cell--odd'}"
							style="grid-column: 1; grid-row: {i + 2}"
						>
							URBN-{room}
						</div>
						{#each Array(15) as _, j}
							<div
								class="grid-cell grid-cell--body {i % 2 === 0
									? 'grid-cell--even'
									: 'grid-cell--odd'}"
								style="grid-column: {j + 2}; grid-row: {i + 2}"
							></div>
						{/each}
					{/each}
				{/if}
				{#each $schedule_data as item}
					{#if item.day && selectedDayState && item.day[0] === selectedDayState[0]}
						<div
							class="schedule-event event"
							style="
							grid-column: {getGridColumn(item.begin_time)} / {getGridColumn(item.end_time)};
							grid-row: {rooms.indexOf(normalizeRoomCode(item.room_code)) + 2};
						"
						>
							{`${item.subj_code} ${item.crse_numb} (${item.all_instructors?.split(', ').reverse().join(' ')})`}
						</div>
					{/if}
				{/each}
				<div
					class="schedule-current-time"
					style="left: calc((100% / 15) * {getCurrentTimeColumn() - 2});"
				></div>
			</div>
		</div>
		<div slot="footer"><button>Room Reservations</button></div>
	</Card>
</section>

<style>
	#schedule {
		border-radius: var(--radius);
		grid-area: schedule;
		overflow-x: auto;
	}

	.schedule-grid-wrapper {
		-webkit-overflow-scrolling: touch;
		overflow-x: auto;
	}

	.schedule-grid {
		align-items: stretch;
		border: 1px solid #a1a1a1;
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
		border: 0.5px solid #a1a1a1;
		box-sizing: border-box;
		min-height: 0;
		min-width: 0;
	}

	.grid-cell--even {
		background-color: #f9f9f9;
	}

	.grid-cell--odd {
		background-color: #d0d3d4;
	}

	.grid-cell--room {
		color: #000;
		font-size: 12px;
		font-style: normal;
		font-weight: 500;
		justify-content: center;
		line-height: normal;
		text-align: center;
	}

	.event {
		background-color: #ffa726;
		border-radius: 4px;
		color: white;
		font-size: 0.75rem;
		margin: 8px 0;
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
			min-width: 900px;
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
