<script lang="ts">
	let { show_modal = $bindable(), header, children } = $props();
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (show_modal && dialog) {
			dialog.showModal();
			document.documentElement.style.overflow = 'hidden';
		} else document.documentElement.style.overflow = '';
	});

	function handle_close() {
		dialog?.close();
		show_modal = false;
		document.documentElement.style.overflow = '';
	}
</script>

<dialog
	aria-modal="true"
	bind:this={dialog}
	onclose={handle_close}
	onclick={(e) => {
		if (e.target === dialog) handle_close();
	}}
>
	<div class="dialog">
		{#if header}
			<header>
				<h2>{@render header()}</h2>
			</header>
		{/if}
		<div class="dialog-content">
			{@render children()}
		</div>
		<div class="dialog-controls">
			<button onclick={handle_close} aria-label="Close modal">
				<svg><use href="#icon-cross" /></svg>
			</button>
		</div>
	</div>
</dialog>

<style>
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}

		to {
			transform: scale(1);
		}
	}

	dialog {
		background-color: var(--color-dialog-backdrop);
		border-radius: var(--radius);
		display: grid;
		height: 100%;
		left: 0;
		margin: 0;
		max-height: none;
		max-width: none;
		padding: 0;
		place-items: center;
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 50;

		&[open] {
			animation: zoom var(--duration-medium) cubic-bezier(0.34, 1.56, 0.64, 1);

			&::backdrop {
				animation: fade var(--duration-short) ease-out;
			}
		}

		&::backdrop {
			background: var(--color-dialog-backdrop);
		}
	}

	.dialog {
		backdrop-filter: blur(10px);
		background: linear-gradient(135deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.05));
		border: 1px solid var(--color-dialog-border);
		border-radius: var(--radius);
		box-shadow: 0 8px 32px rgb(0 0 0 / 0.1);
		color: var(--color-neutral-200);
		font-size: clamp(var(--font-size-small), 4cqw, var(--font-size-medium));
		font-weight: 400;
		margin-inline: auto;
		max-width: 32em;
		padding: var(--space-medium);
		position: relative;
		width: 90dvw;

		&::before {
			background: linear-gradient(
				to bottom right,
				var(--color-dialog-border-1) 0%,
				var(--color-dialog-border-2) 50%,
				var(--color-dialog-border-3) 100%
			);
			border-radius: var(--radius);
			content: '';
			inset: -1px;
			position: absolute;
			z-index: -1;
		}
	}

	h2 {
		color: var(--color-white);
		font-size: var(--font-size-medium);
		font-weight: 600;
		margin: 0;
	}

	.dialog-controls {
		button {
			align-items: center;
			background: transparent;
			border: 0;
			cursor: pointer;
			display: flex;
			height: 2.25rem;
			justify-content: center;
			position: absolute;
			right: 0.75rem;
			top: 0.75rem;
			width: 2.25rem;

			svg {
				color: var(--color-neutral-200);
				height: 2.25rem;
				transition: color var(--duration-short) ease;
				width: 2.25rem;

				@media (hover: hover) and (pointer: fine) {
					&:hover {
						color: var(--color-white);
					}
				}
			}
		}
	}
</style>
