<script>
	import { fade } from 'svelte/transition'

	// Switch the active message by changing this key.
	const active_message = 'finals-graduation'

	// How long each line stays visible, and how long the cross-fade takes.
	const cycle_duration = 5000
	const transition_duration = 600

	const messages = {
		'finals-graduation': {
			theme: 'finals-grad',
			lines: [
				{ id: 'finals', text: 'Good Luck On Your Finals', variant: 'primary' },
				{ id: 'grads', text: 'Congrats Graduates!', variant: 'accent', confetti: true }
			]
		}
	}

	const current = messages[active_message]
	let index = $state(0)
	const current_line = $derived(current.lines[index])

	$effect(() => {
		const id = setInterval(() => {
			index = (index + 1) % current.lines.length
		}, cycle_duration)
		return () => clearInterval(id)
	})

	const confetti_colors = [
		'var(--color-drexel-gold)',
		'var(--color-drexel-blue)',
		'var(--color-drexel-blue-light)',
		'var(--color-drexel-red-light)',
		'var(--color-drexel-orange-light)',
		'var(--color-white)'
	]

	const confetti_pieces = Array.from({ length: 80 }, (_, i) => ({
		id: i,
		left: Math.random() * 100,
		delay: -Math.random() * 5,
		duration: 3.5 + Math.random() * 3.5,
		color: confetti_colors[i % confetti_colors.length],
		width: 6 + Math.random() * 8,
		height: 8 + Math.random() * 6,
		sway: `${(Math.random() - 0.5) * 60}cqw`,
		spin: 360 + Math.random() * 720
	}))
</script>

<div id="message" class={current.theme}>
	{#key current_line?.id}
		<div
			class="frame {current_line?.variant}"
			in:fade={{ duration: transition_duration }}
			out:fade={{ duration: transition_duration }}
		>
			<h2>{current_line?.text}</h2>
			{#if current_line?.confetti}
				<div class="confetti" aria-hidden="true">
					{#each confetti_pieces as p (p.id)}
						<span
							class="piece"
							style:left="{p.left}%"
							style:animation-delay="{p.delay}s"
							style:animation-duration="{p.duration}s"
							style:background={p.color}
							style:width="{p.width}px"
							style:height="{p.height}px"
							style:--sway={p.sway}
							style:--spin="{p.spin}deg"
						></span>
					{/each}
				</div>
			{/if}
		</div>
	{/key}
</div>

<style>
	div#message {
		border-radius: var(--radius);
		container-type: size;
		display: grid;
		grid-area: message;
		overflow: hidden;

		.frame {
			display: grid;
			grid-area: 1 / 1;
			overflow: hidden;
			padding: 0.5cqh 2cqw;
			place-items: center;
			position: relative;
		}

		h2 {
			letter-spacing: var(--letter-spacing-tight);
			line-height: 1;
			margin: 0;
			position: relative;
			text-align: center;
			text-wrap: balance;
			z-index: 1;
		}

		&.finals-grad .frame.primary {
			background:
				radial-gradient(ellipse 70% 60% at 50% 0%, rgb(255 255 255 / 0.12), transparent 70%),
				linear-gradient(180deg, var(--color-drexel-blue-dark) 0%, var(--color-drexel-blue) 100%);
		}

		&.finals-grad .frame.primary h2 {
			color: var(--color-white);
			font-size: 5.5cqw;
			font-weight: 700;
			text-shadow: 0 2px 10px rgb(0 0 0 / 0.45);
		}

		&.finals-grad .frame.accent {
			background:
				radial-gradient(ellipse 70% 60% at 50% 100%, rgb(255 255 255 / 0.18), transparent 70%),
				linear-gradient(
					135deg,
					#ffdc5f 0%,
					var(--color-drexel-gold) 45%,
					var(--color-drexel-orange-dark) 100%
				);
		}

		&.finals-grad .frame.accent h2 {
			color: var(--color-drexel-blue);
			font-size: 6.5cqw;
			font-weight: 800;
			letter-spacing: var(--letter-spacing-x-tight);
			text-shadow: 0 1px 0 rgb(255 255 255 / 0.35);
		}

		.confetti {
			inset: 0;
			pointer-events: none;
			position: absolute;
			z-index: 2;
		}

		.piece {
			animation: confetti-fall linear infinite;
			border-radius: 2px;
			position: absolute;
			top: 0;
			will-change: transform;
		}
	}

	@keyframes confetti-fall {
		0% {
			opacity: 0;
			transform: translate3d(0, -15cqh, 0) rotate(0deg);
		}

		8% {
			opacity: 1;
		}

		92% {
			opacity: 1;
		}

		100% {
			opacity: 0;
			transform: translate3d(var(--sway, 0), 115cqh, 0) rotate(var(--spin, 720deg));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.piece {
			display: none;
		}
	}
</style>
