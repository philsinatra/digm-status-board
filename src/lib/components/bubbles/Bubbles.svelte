<script lang="ts">
	let { parent_component } = $props();
</script>

<div class="bubbles" id="bubbles">
	{#if parent_component === 'weather'}
		<div
			class="bubble"
			style=" animation-delay: 4s; animation-duration: 9s; height: 73px; left: -9%; top: -13%;width: 73px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 4s; animation-duration: 9s; height: 73px; left: 91%; top: 33%;width: 73px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 0s; animation-duration: 6s; height: 58px; left: 62%; top: 32%;width: 58px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 3s; animation-duration: 6s; height: 26px; left: 50%; top: 70%;width: 26px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 1s; animation-duration: 9s; height: 31px; left: 17%; top: 52%;width: 31px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 2s; animation-duration: 8s; height: 73px; left: 25%; top: 92%;width: 73px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 1s; animation-duration: 6s; height: 62px; left: 53%; top: 51%;width: 62px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 4s; animation-duration: 11s; height: 55px; left: 8%; top: 44%;width: 55px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 4s; animation-duration: 11s; height: 73px; left: 23%; top: 44%;width: 73px;"
		></div>
	{/if}

	{#if parent_component === 'today'}
		<div
			class="bubble"
			style=" animation-delay: 4s; animation-duration: 9s; height: 73px; left: 91%; top: -13%;width: 73px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 1s; animation-duration: 9s; height: 31px; left: 17%; top: 52%;width: 31px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 1s; animation-duration: 6s; height: 62px; left: 53%; top: 51%;width: 62px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 4s; animation-duration: 11s; height: 55px; left: -8%; top: 44%;width: 55px;"
		></div>
		<div
			class="bubble"
			style=" animation-delay: 4s; animation-duration: 11s; height: 73px; left: 23%; top: -4%;width: 73px;"
		></div>
	{/if}
</div>

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0) translateX(0);
		}

		50% {
			transform: translateY(-20px) translateX(10px);
		}
	}

	.bubbles {
		height: 100%;
		left: 0;
		overflow: hidden;
		pointer-events: none;
		position: absolute;
		top: 0;
		width: 100%;
		z-index: 0;
	}

	.bubble {
		animation: float 8s infinite ease-in-out;
		background: rgb(255 255 255 / 0.1);
		border-radius: 50%;
		position: absolute;
	}
</style>
