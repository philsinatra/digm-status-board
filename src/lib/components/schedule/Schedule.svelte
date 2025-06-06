<script lang="ts">
	import { writable } from 'svelte/store';
	import type { ScheduleItem } from '$lib/types';
	import Card from '$lib/components/card/Card.svelte';
	import Modal from '$lib/components/modal/Modal.svelte';
	import { init_event_source } from '$lib/scripts/eventSource';

	const { data_source = 'static/data/schedule.json' } = $props();
	const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
	const modal_data = writable<ScheduleItem | null>(null);
	const rooms = $state<string[]>([]);
	const schedule_data = writable<ScheduleItem[]>([]);
	const schedule_hours: {
		full: string;
		short: string;
		period: string;
	}[] = Array.from({ length: 15 }, (unused, i) => {
		const hour = 8 + i;
		const period = hour >= 12 ? 'PM' : 'AM';
		const display_hour = hour % 12 === 0 ? 12 : hour % 12;
		return {
			full: `${display_hour.toString().padStart(2, '0')}:00 ${period}`,
			short: `${display_hour.toString().padStart(2, '0')} ${period}`,
			period
		};
	});

	let selected_day_state = $state<string>('MON');
	let current_time = new Date();
	let grid_wrapper: HTMLDivElement;

	function format_time(time: number): string {
		const hour = Math.floor(time / 100);
		const min = time % 100;
		const period = hour >= 12 ? 'PM' : 'AM';
		const display_hour = hour % 12 === 0 ? 12 : hour % 12;
		return `${display_hour}:${min.toString().padStart(2, '0')} ${period}`;
	}

	function normalize_room_code(code: string | number | null): string {
		return code == null ? '' : String(code);
	}

	function get_grid_column(time: number | null): number {
		if (typeof time === 'number') {
			const hour = Math.floor(time / 100);
			return hour - 7 + 1;
		}
		return 1;
	}

	// Returns the percent offset (0-100) within the hour grid cell for a given time (e.g. 8:30 = 50).
	function get_fractional_offset(time: number | null): number {
		if (!time) return 0;
		const minutes = time % 100;
		return (minutes / 60) * 100;
	}

	function get_duration_width(start: number, end: number): number {
		const start_hour = Math.floor(start / 100);
		const start_min = start % 100;
		const end_hour = Math.floor(end / 100);
		const end_min = end % 100;

		const start_decimal = start_hour + start_min / 60;
		const end_decimal = end_hour + end_min / 60;

		return (end_decimal - start_decimal) * 100;
	}

	function get_current_hour_decimal() {
		const hour = current_time.getHours();
		const min = current_time.getMinutes();
		return hour + min / 60;
	}

	function get_current_time_column() {
		return get_current_hour_decimal() - 7 + 1;
	}

	function track_current_time() {
		const interval = setInterval(() => {
			current_time = new Date();
		}, 60 * 1000);
		return () => clearInterval(interval);
	}

	function is_current_time_within_bounds() {
		const hour = current_time.getHours();
		return hour >= 8 && hour < 22;
	}

	function center_current_time() {
		if (!grid_wrapper) return;

		const wrapper_width = grid_wrapper.clientWidth;
		const scroll_width = grid_wrapper.scrollWidth;

		const left_percent = (get_current_time_column() - 2) / 15;
		const scroll_to = scroll_width * left_percent - wrapper_width / 2;

		grid_wrapper.scrollLeft = Math.max(scroll_to, 0);
	}

	function arrays_are_equal(a: string[], b: string[]): boolean {
		if (a.length !== b.length) return false;
		return a.every((v, i) => v === b[i]);
	}

	$effect(() => {
		return init_event_source({
			data_source,
			on_message: (data) => {
				return Array.isArray(data) ? data : [];
			},
			target_store: schedule_data,
			log_prefix: 'schedule'
		});
	});

	$effect(() => {
		const unique_rooms = Array.from(
			new Set($schedule_data.map((item) => normalize_room_code(item.room_code)))
		).filter((c) => c !== '' && c !== 'null' && c !== 'undefined');

		// Only update if different to avoid infinite loop
		if (!arrays_are_equal(rooms, unique_rooms)) {
			rooms.length = 0;
			rooms.push(...unique_rooms);
		}
	});

	$effect(() => {
		const today = new Date().getDay();
		selected_day_state = days[today] || 'MON';
		track_current_time();
		center_current_time();
	});
</script>

<section id="schedule">
	<Card>
		{#snippet header()}
			<nav class="weekday-selector">
				{#each days as day (day)}
					<button
						class:selected={day === selected_day_state}
						onclick={() => {
							selected_day_state = day;
							center_current_time();
						}}
					>
						<span class="full">{day}</span>
						<span class="short">{day === 'SUN' ? 'U' : day[0]}</span>
					</button>
				{/each}
			</nav>
		{/snippet}

		<div class="schedule-grid-wrapper" bind:this={grid_wrapper}>
			<div class="schedule-grid" style="grid-template-rows: 34px repeat({rooms.length}, 50px);">
				<!-- Top-left -->
				<div class="grid-cell" style="grid-column: 1; grid-row: 1"></div>
				<!-- Hour headers -->
				{#if schedule_hours.length}
					{#each schedule_hours as hour, i (hour.full)}
						<div
							class="schedule-column grid-cell-hours grid-cell"
							style="grid-column: {i + 2}; grid-row: 1;"
						>
							{hour.full}
						</div>
					{/each}
				{/if}
				{#if rooms && rooms.length}
					{#each rooms as room, i (room)}
						<div
							class="schedule-row grid-cell-room grid-cell {i % 2 === 0
								? 'grid-cell-even'
								: 'grid-cell-odd'}"
							style="grid-column: 1; grid-row: {i + 2}"
						>
							URBN-{room}
						</div>
						{#each Array(15) as _, j (j)}
							<div
								class="grid-cell grid-cell-body {i % 2 === 0 ? 'grid-cell-even' : 'grid-cell-odd'}"
								style="grid-column: {j + 2}; grid-row: {i + 2}"
							></div>
						{/each}
					{/each}
				{/if}
				{#each $schedule_data as item (item)}
					{#if item.day && selected_day_state && item.day[0] === selected_day_state[0]}
						{@const room_index = rooms.indexOf(normalize_room_code(item.room_code))}
						{@const column = get_grid_column(item.begin_time)}
						{@const left_offset = get_fractional_offset(item.begin_time)}
						{@const width =
							item.begin_time != null && item.end_time != null
								? get_duration_width(item.begin_time, item.end_time)
								: 0}
						<div
							class="schedule-event event"
							data-a={item.begin_time}
							data-s={item.end_time}
							style="
						grid-column: {column};
						grid-row: {room_index + 2};
						position: relative;
					"
						>
							<button
								class="event-item"
								style="
							left: {left_offset}%;
							position: absolute;
							width: {width}%;
						"
								aria-label={`${item.subj_code} ${item.crse_numb} with ${item.all_instructors?.split(', ').reverse().join(' ')} from ${item.begin_time} to ${item.end_time}`}
								onclick={() => {
									modal_data?.set(item);
								}}
							>
								{`${item.subj_code} ${item.crse_numb} (${item.all_instructors?.split(', ').reverse().join(' ')})`}
							</button>
						</div>
					{/if}
				{/each}
				{#if is_current_time_within_bounds()}
					<div
						class="schedule-current-time"
						style="left: calc((100% / 15) * {get_current_time_column() - 2});"
					></div>
				{/if}
			</div>
		</div>
	</Card>

	{#if $modal_data}
		<Modal bind:show_modal={$modal_data}>
			{#snippet header()}
				{$modal_data?.subj_code}
				{$modal_data?.crse_numb} - {String($modal_data?.seq_numb).padStart(3, '0')}
			{/snippet}

			<ul class="schedule-modal-list">
				<li><strong>Course:</strong> {$modal_data?.course_title}</li>
				<li><strong>Instructor:</strong> {$modal_data?.all_instructors}</li>
				<li><strong>Room:</strong> {$modal_data?.room_code}</li>
				<li>
					<strong>Time:</strong>
					{#if $modal_data?.begin_time != null && $modal_data?.end_time != null}
						{format_time($modal_data.begin_time)} - {format_time($modal_data.end_time)}
					{:else}
						<em>Time not available</em>
					{/if}
				</li>
			</ul>
		</Modal>
	{/if}
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
		translate: 0 -2px;
	}

	.schedule-grid {
		align-items: stretch;
		border: 1px solid var(--color-neutral-400);
		border-collapse: collapse;
		display: grid;
		grid-template-columns: 100px repeat(15, minmax(80px, 1fr));
		position: relative;
	}

	.grid-cell-hours {
		align-items: center;
		color: var(--color-black);
		display: flex;
		font-size: var(--font-size-small);
		justify-content: center;
		text-align: center;
	}

	.schedule-row {
		align-items: center;
		background-color: var(--color-neutral-50);
		display: flex;
		font-weight: bold;
		padding-right: 0.5rem;
		white-space: nowrap;
	}

	.grid-cell {
		border: 0.0156rem solid var(--color-neutral-400);
		box-sizing: border-box;
		min-height: 0;
		min-width: 0;
		padding: var(--space-small);
	}

	.grid-cell-even {
		background-color: var(--color-neutral-50);
	}

	.grid-cell-odd {
		background-color: var(--color-neutral-200);
	}

	.grid-cell-room {
		color: var(--color-black);
		font-size: var(--font-size-small);
		font-weight: 500;
		justify-content: center;
		text-align: center;
	}

	.event {
		align-items: center;
		display: flex;
	}

	.event-item {
		align-items: center;
		background-color: var(--color-drexel-orange-dark);
		border: 0;
		border-radius: calc(var(--radius) / 2);
		color: var(--color-white);
		cursor: pointer;
		display: flex;
		font-size: var(--font-size-small);
		height: calc(100% - 8px * 2);
		justify-content: center;
		outline: 0;
		overflow: hidden;
		padding: 0 calc(var(--space-small) / 2);
		position: absolute;
		text-overflow: ellipsis;
		white-space: nowrap;
		z-index: 10;
	}

	.weekday-selector {
		display: flex;
		gap: var(--space-medium);
	}

	.weekday-selector button {
		background: var(--color-white);
		border: none;
		border-radius: 9999px;
		cursor: pointer;
		font-size: calc(var(--font-size-small) + 0.2rem);
		font-weight: 700;
		padding: var(--space-small) var(--space-medium);
	}

	.weekday-selector button.selected {
		background-color: var(--color-drexel-gold);
		color: var(--color-black);
	}

	.weekday-selector .short {
		display: none;
	}

	.schedule-current-time {
		background-color: var(--color-drexel-blue);
		bottom: 0;
		position: absolute;
		top: 0;
		width: 2px;
		z-index: 20;
	}

	.schedule-modal-list {
		padding-left: var(--space-medium);

		li {
			margin: var(--space-small) 0;
		}
	}

	@media (width <= 768px) {
		.weekday-selector .short {
			display: inline;
		}

		.weekday-selector .full {
			display: none;
		}

		.schedule-grid {
			font-size: var(--font-size-medium);
			grid-auto-rows: 50px;
			min-width: 900px;
		}
	}
</style>
