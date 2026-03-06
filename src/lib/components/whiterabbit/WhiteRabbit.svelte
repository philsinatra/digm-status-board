<script lang="ts">
	import { reel_status } from '$lib/stores/reel'

	const MESSAGES = [
		'Wake up, Neo...',
		'The Matrix has you...',
		'Follow the white rabbit.',
		'Knock, knock, Neo.',
		''
	]
	const CHAR_DELAY = 120
	const MESSAGE_PAUSE = 3000
	const PRE_TYPE_DELAY = 500
	const FINAL_HOLD = 3000
	const TRANSITION_MS = 600
	const WINDOW_START = 7.5 // 07:30
	const WINDOW_END = 18 // 18:00
	const PLAYS_PER_DAY = 2
	const STORAGE_KEY = 'whiterabbit'

	interface StoredSchedule {
		date: string
		times: number[]
		played: number
	}

	let visible = $state(false)
	let hiding = $state(false)
	let current_text = $state('')
	let cursor_visible = $state(true)

	let timers: ReturnType<typeof setTimeout>[] = []
	let cursor_interval: ReturnType<typeof setInterval> | null = null

	function schedule(fn: () => void, ms: number) {
		const id = setTimeout(fn, ms)
		timers.push(id)
		return id
	}

	function today_key(): string {
		const now = new Date()
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
	}

	function generate_times(): number[] {
		const now = new Date()
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
		const start_ms = today.getTime() + WINDOW_START * 3_600_000
		const end_ms = today.getTime() + WINDOW_END * 3_600_000
		const times: number[] = []

		for (let i = 0; i < PLAYS_PER_DAY; i++) {
			times.push(start_ms + Math.random() * (end_ms - start_ms))
		}

		return times.sort((a, b) => a - b)
	}

	function load_schedule(): StoredSchedule {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (raw) {
				const data = JSON.parse(raw) as StoredSchedule
				if (data.date === today_key()) {
					return data
				}
			}
		} catch {
			// Corrupted data, regenerate
		}

		const sched: StoredSchedule = {
			date: today_key(),
			times: generate_times(),
			played: 0
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sched))
		return sched
	}

	function mark_played() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (raw) {
				const data = JSON.parse(raw) as StoredSchedule
				data.played++
				localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
			}
		} catch {
			// Best effort
		}
	}

	function ms_until_midnight(): number {
		const now = new Date()
		const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
		return tomorrow.getTime() - now.getTime()
	}

	function schedule_day() {
		const now = Date.now()
		const sched = load_schedule()
		const remaining = sched.times.slice(sched.played)

		for (const t of remaining) {
			const delay = t - now
			if (delay > 0) {
				schedule(trigger_animation, delay)
			}
		}

		schedule(schedule_day, ms_until_midnight() + 1000)
	}

	function trigger_animation() {
		mark_played()
		visible = true
		schedule(run_sequence, PRE_TYPE_DELAY)
	}

	function type_message(message: string, on_done: () => void) {
		let i = 0
		current_text = ''

		function tick() {
			if (i < message.length) {
				current_text = message.slice(0, i + 1)
				i++
				schedule(tick, CHAR_DELAY)
			} else {
				on_done()
			}
		}

		tick()
	}

	function run_sequence() {
		let idx = 0

		function next() {
			if (idx >= MESSAGES.length) {
				schedule(() => {
					current_text = ''
					hide_and_reset()
				}, FINAL_HOLD)
				return
			}

			const msg = MESSAGES[idx] as string
			idx++

			type_message(msg, () => {
				if (idx < MESSAGES.length) {
					schedule(() => {
						current_text = ''
						next()
					}, MESSAGE_PAUSE)
				} else {
					next()
				}
			})
		}

		next()
	}

	function hide_and_reset() {
		hiding = true
		schedule(() => {
			visible = false
			hiding = false
			current_text = ''
		}, TRANSITION_MS)
	}

	function cleanup() {
		timers.forEach(clearTimeout)
		timers = []
		if (cursor_interval) {
			clearInterval(cursor_interval)
			cursor_interval = null
		}
	}

	$effect(() => {
		reel_status.set(visible && !hiding ? 'hidden' : 'visible')
	})

	$effect(() => {
		cursor_interval = setInterval(() => {
			cursor_visible = !cursor_visible
		}, 530)

		schedule_day()

		return cleanup
	})
</script>

<div class="matrix-overlay" class:visible class:hiding>
	<div class="container">
		{#if current_text}
			<div class="message">
				<span>{current_text}</span><span class="cursor" class:on={cursor_visible}>|</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.matrix-overlay {
		align-items: center;
		background-color: var(--color-black-pure);
		display: flex;
		height: 100vh;
		justify-content: center;
		left: 0;
		position: fixed;
		top: 0;
		transform: translateY(-100vh);
		transition: transform 0.6s ease;
		width: 100vw;
		z-index: 2147483647;

		&.visible {
			transform: translateY(0);
		}

		&.hiding {
			transform: translateY(-100vh);
		}
	}

	.container {
		max-width: 90vw;
		padding: 2rem;
		text-align: center;
	}

	.message {
		color: var(--color-matrix-green);
		font-family: 'Courier New', Courier, monospace;
		font-size: 2.5rem;
		line-height: 1.4;
		text-shadow:
			0 0 5px var(--color-matrix-green),
			0 0 5px var(--color-matrix-green),
			0 0 10px #003b00;
	}

	.cursor {
		color: var(--color-matrix-green);
		opacity: 0;

		&.on {
			opacity: 1;
		}
	}
</style>
