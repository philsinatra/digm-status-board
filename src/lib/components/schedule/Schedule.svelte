<script lang="ts">
	import { writable, get } from 'svelte/store';
	import type { ScheduleItem } from '$lib/types';
	import Modal from '$lib/components/modal/Modal.svelte';
	import { init_event_source } from '$lib/scripts/eventSource';

	const { data_source = 'static/data/schedule.json' } = $props();
	const days = ['MON', 'TUE', 'WED', 'R', 'FRI', 'SAT', 'SUN'];
	const modal_data = writable<ScheduleItem | null>(null);
	const rooms = $state<string[]>([]);
	const sorted_rooms = $derived(rooms.slice().sort((a, b) => a.localeCompare(b)));
	const schedule_data = writable<ScheduleItem[]>([]);
	const current_time = writable(new Date());
	const schedule_hours: {
		full: string;
		short: string;
		period: string;
	}[] = Array.from({ length: 14 }, (unused, i) => {
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
	let current_position = $state(0);
	let grid_wrapper: HTMLDivElement;
	let grid_el: HTMLDivElement;

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
			return hour - 8 + 2;
		}
		return 1;
	}

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
		const time = get(current_time);
		const hour = time.getHours();
		const min = time.getMinutes();
		return hour + min / 60;
	}

	function track_current_time() {
		current_time.set(new Date());
		const time = get(current_time);
		const seconds = time.getSeconds();
		const milliseconds = time.getMilliseconds();
		const time_to_next_minute = (60 - seconds) * 1000 - milliseconds;

		let interval: ReturnType<typeof setInterval> | undefined;
		const timeout = setTimeout(() => {
			current_time.set(new Date());
			interval = setInterval(() => {
				current_time.set(new Date());
			}, 60_000);
		}, time_to_next_minute);

		return () => {
			clearTimeout(timeout);
			if (interval) clearInterval(interval);
		};
	}

	function is_current_time_within_bounds() {
		const time = get(current_time);
		const hour = time.getHours();
		return hour >= 8 && hour < 22;
	}

	function center_current_time() {
		if (!grid_wrapper) return;
		const wrapper_width = grid_wrapper.clientWidth;
		const scroll_width = grid_wrapper.scrollWidth;
		const hour_decimal = get_current_hour_decimal();
		const time_progress = (hour_decimal - 8) / 14;
		const scroll_to = (scroll_width - 100) * time_progress - wrapper_width / 2;
		grid_wrapper.scrollLeft = Math.max(scroll_to, 0);
	}

	function arrays_are_equal(a: string[], b: string[]): boolean {
		if (a.length !== b.length) return false;
		return a.every((v, i) => v === b[i]);
	}

	function get_current_time_left_px(): number {
		if (!grid_el || !grid_wrapper) return 0;
		const hour_decimal = get_current_hour_decimal();
		if (hour_decimal < 8 || hour_decimal >= 22) return 0;
		const first_cell = grid_el.querySelector('.grid-cell:first-child') as HTMLElement;
		const room_col_width = first_cell ? first_cell.offsetWidth : 100;
		const time_progress = (hour_decimal - 8) / 14;
		const total_grid_width = grid_el.offsetWidth;
		const time_columns_width = total_grid_width - room_col_width;
		return room_col_width + time_progress * time_columns_width;
	}

	$effect(() => {
		return init_event_source({
			data_source,
			on_message: (data) => (Array.isArray(data) ? data : []),
			target_store: schedule_data,
			log_prefix: 'schedule'
		});
	});

	$effect(() => {
		const unique_rooms = Array.from(
			new Set($schedule_data.map((item) => normalize_room_code(item.room_code)))
		).filter((c) => c !== '' && c !== 'null' && c !== 'undefined');
		if (!arrays_are_equal(rooms, unique_rooms)) {
			rooms.length = 0;
			rooms.push(...unique_rooms);
		}
	});

	$effect(() => {
		const today = new Date().getDay();
		selected_day_state = days[today === 0 ? 6 : today - 1] || 'MON';
		const cleanup = track_current_time();
		center_current_time();
		return cleanup;
	});

	$effect(() => {
		return current_time.subscribe(() => {
			if (grid_el && is_current_time_within_bounds()) {
				current_position = get_current_time_left_px();
			} else {
				current_position = 0;
			}
		});
	});
</script>

<section id="schedule">
	<div class="schedule">
		<nav class="weekday-selector">
			{#each days as day (day)}
				<button
					class:selected={day === selected_day_state}
					onclick={() => {
						selected_day_state = day;
						center_current_time();
					}}
				>
					<!-- <span class="full">{day}</span> -->
					<span class="full">{day === 'R' ? 'THU' : day}</span>
					<span class="short">{day === 'SUN' ? 'U' : day[0]}</span>
				</button>
			{/each}
		</nav>

		<div class="schedule-grid-wrapper" bind:this={grid_wrapper}>
			<div class="schedule-grid" bind:this={grid_el}>
				<div class="grid-cell" style="grid-column: 1; grid-row: 1"></div>
				{#each schedule_hours as hour, i (hour.full)}
					<div
						class="schedule-column grid-cell-hours grid-cell"
						style="grid-column: {i + 2}; grid-row: 1;"
					>
						<span style="font-weight: 700;">{hour.full}</span>
					</div>
				{/each}
				{#each sorted_rooms as room, i (room)}
					<div
						class="schedule-row grid-cell-room grid-cell {i % 2 === 0
							? 'grid-cell-even'
							: 'grid-cell-odd'}"
						style="grid-column: 1; grid-row: {sorted_rooms.indexOf(room) + 2};"
					>
						<span style="font-weight: 700;">URBN-{room}</span>
					</div>
					{#each Array(14) as _, j (j)}
						<div
							class="grid-cell grid-cell-body {i % 2 === 0 ? 'grid-cell-even' : 'grid-cell-odd'}"
							style="grid-column: {j + 2}; grid-row: {i + 2}"
						></div>
					{/each}
				{/each}
				{#each $schedule_data as item (item)}
					{#if item.day && selected_day_state && item.day[0] === selected_day_state[0]}
						{@const room_index = sorted_rooms.indexOf(normalize_room_code(item.room_code))}
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
							style="grid-column: {column}; grid-row: {room_index + 2}; position: relative;"
						>
							<button
								class="event-item program-{item.subj_code.toLowerCase()}"
								style:left="{left_offset}%"
								style:width="{width}%"
								style:background-color={item.color_override
									? `var(${item.color_override})`
									: undefined}
								aria-label={`${item.subj_code} ${item.crse_numb} with ${item.all_instructors?.split(', ').reverse().join(' ')} from ${item.begin_time} to ${item.end_time}`}
								onclick={() => modal_data?.set(item)}
							>
								<span>{`${item.subj_code} ${item.crse_numb}`}</span>
								{#if item.all_instructors}
									<span>
										{(item.end_time ?? 0) - (item.begin_time ?? 0) >= 200
											? `(${item.all_instructors?.split(', ').reverse().join(' ')})`
											: ''}
									</span>
								{/if}
							</button>
						</div>
					{/if}
				{/each}
			</div>
			{#if is_current_time_within_bounds()}
				<div
					class="schedule-current-time"
					style="left: {current_position}px;"
					data-position={current_position}
				></div>
			{/if}
		</div>

		{#if $modal_data}
			<Modal bind:show_modal={$modal_data}>
				{#snippet header()}
					{$modal_data?.subj_code}
					{$modal_data?.crse_numb} - {String($modal_data?.seq_numb).padStart(3, '0')}
				{/snippet}
				<ul class="schedule-modal-list">
					<li><strong>Course:</strong> {$modal_data?.course_title}</li>
					{#if $modal_data?.all_instructors}
						<li><strong>Instructor:</strong> {$modal_data?.all_instructors}</li>
					{/if}
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
	</div>
</section>

<style>
	#schedule {
		border-radius: var(--radius);
		grid-area: schedule;
		overflow: auto hidden;
	}

	.schedule-grid-wrapper {
		overflow: auto hidden;
		-webkit-overflow-scrolling: touch;
		position: relative;
		translate: 0 -2px;
	}

	.schedule-grid {
		align-items: stretch;
		border-collapse: collapse;
		border-top: 1px solid var(--color-neutral-300);
		display: grid;
		font-size: var(--font-size-medium);
		grid-auto-rows: 50px;
		grid-template-columns: 100px repeat(14, minmax(90px, 1fr));
		grid-template-rows: 34px repeat(8, 1fr);
		height: calc(34px + (8 * 1fr));
		min-width: 900px;
		position: relative;

		@media screen and (width >= 768px) {
			grid-auto-rows: unset;
			min-width: unset;
		}

		@media screen and (width >= 1920px) {
			min-height: 322px;
		}
	}

	.grid-cell-hours {
		align-items: center;
		color: var(--color-black);
		display: flex;
		justify-content: center;
		text-align: center;
	}

	.schedule-row {
		align-items: center;
		background-color: var(--color-neutral-50);
		display: flex;
		padding-right: var(--space-small);
		white-space: nowrap;

		span {
			font-size: var(--font-size-small);
			font-weight: 600;
		}
	}

	.schedule-column {
		span {
			font-size: var(--font-size-xxxx-small);
			font-weight: 600;
		}
	}

	.grid-cell {
		border: 0.0156rem solid var(--color-neutral-300);
		box-sizing: border-box;
		min-height: 0;
		min-width: 0;
		padding: var(--space-small);
	}

	.grid-cell:first-child {
		background-color: var(--color-neutral-50);
		left: 0;
		position: sticky;
		z-index: 6;
	}

	.grid-cell-even {
		background-color: var(--color-neutral-50);
	}

	.grid-cell-odd {
		background-color: var(--color-neutral-200);
	}

	.grid-cell-room {
		background-color: var(--color-neutral-50);
		color: var(--color-black);
		font-size: var(--font-size-small);
		font-weight: 500;
		justify-content: center;
		left: 0;
		position: sticky;
		text-align: center;
		z-index: 5;
	}

	.event {
		align-items: center;
		display: flex;
	}

	.event-item {
		align-items: center;
		background-color: var(--color-purple-600);
		border: 0;
		border-radius: calc(var(--radius) / 2);
		color: var(--color-white);
		cursor: pointer;
		display: flex;
		font-size: calc(var(--font-size-xxxx-small) - 0.75px);
		font-weight: 550;
		gap: var(--space-small);
		height: 94%;
		justify-content: center;
		outline: 0;
		overflow: hidden;
		position: absolute;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;

		&.program-anim,
		&.program-vrim {
			background-color: var(--color-drexel-orange-dark);
		}

		&.program-gdap,
		&.program-gmap {
			background-color: var(--color-red-600);
		}

		&.program-idm,
		&.program-uxid {
			background-color: var(--color-blue-600);
		}
	}

	.weekday-selector {
		background-color: var(--color-drexel-blue);
		display: flex;
		overflow-y: auto;
		width: 100%;

		&::-webkit-scrollbar {
			display: none;
		}

		button {
			background-color: var(--color-drexel-blue);
			border: none;
			color: var(--color-white);
			cursor: pointer;
			font-size: var(--font-size-small);
			font-weight: 700;
			min-height: 3rem;
			min-width: 3rem;
			transition: background-color var(--duration-short) ease;

			&.selected {
				background-color: var(--color-emerald-600);
				color: var(--color-white);
			}

			@media (hover: hover) and (pointer: fine) {
				&:hover,
				&.selected:hover {
					background-color: var(--color-drexel-blue-dark);
					color: var(--color-white);
				}
			}
		}

		.short {
			display: inline;

			@media screen and (width >= 768px) {
				display: none;
			}
		}

		.full {
			display: none;

			@media screen and (width >= 768px) {
				display: block;
			}
		}
	}

	.schedule-current-time {
		display: none;

		@media screen and (width >= 1920px) {
			background-color: var(--color-drexel-blue-dark);
			bottom: 0;
			display: block;
			position: absolute;
			top: 0;
			transition: left 0.5s linear;
			width: 2px;
			z-index: 5;
		}
	}

	.schedule-modal-list {
		padding-left: var(--space-medium);

		li {
			margin: var(--space-small) 0;
		}
	}
</style>
