<script lang="ts">
	import IconCloseCircle from '$lib/components/icons/IconCloseCircle.svelte';
	let { show_modal = $bindable(), header, children } = $props();
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		console.log('Modal show state changed:', show_modal);
		if (show_modal) {
			dialog.show_modal();
			document.documentElement.style.overflow = 'hidden';
		} else {
			document.documentElement.style.overflow = '';
		}
	});

	function handle_close() {
		show_modal = false;
		document.documentElement.style.overflow = ''; // Ensure cleanup
	}
</script>

<dialog
	bind:this={dialog}
	onclose={handle_close}
	onclick={(e) => {
		if (e.target === dialog) {
			handle_close();
		}
	}}
>
	<div class="modal-card">
		{#if header}
			<header>
				<h2>{@render header()}</h2>
			</header>
		{/if}

		<hr />
		<div class="modal-content">{@render children()}</div>
		<button class="modal-close" onclick={handle_close} aria-label="Close modal">
			<IconCloseCircle />
		</button>
	</div>
</dialog>

<style>
	dialog {
		backdrop-filter: blur(2px);
		background: rgb(51 51 51 / 0.5);
		border: none;
		display: grid;
		height: 100vh;
		left: 0;
		margin: 0;
		padding: 0;
		place-items: center;
		position: fixed;
		top: 0;
		width: 100vw;
		z-index: 50;
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.3);
	}

	.modal-card {
		background-color: var(--color-drexel-blue);
		border-radius: 0.5rem;
		box-shadow: 0 10px 30px rgb(0 0 0 / 0.3);
		color: var(--color-white);
		font-size: 1rem;
		margin: 1rem;
		max-width: 32em;
		padding: 1rem;
		position: relative;
		width: 100%;
	}

	h2 {
		font-size: 20px;
		font-weight: 700;
		line-height: normal;
	}

	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes zoom {
		from {
			transform: scale(0.95);
		}

		to {
			transform: scale(1);
		}
	}

	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	button {
		display: block;
	}

	.modal-close {
		align-items: center;
		background: transparent;
		border: 0;
		cursor: pointer;
		display: flex;
		font-size: 1.25rem;
		font-weight: bold;
		height: 36px;
		justify-content: center;
		line-height: 1;
		position: absolute;
		right: 0.75rem;
		top: 0.75rem;
		width: 36px;
	}
</style>
