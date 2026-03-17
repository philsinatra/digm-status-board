<div id="message">
	<h2>Good Luck On Your Finals</h2>
</div>

<style>
	@keyframes slide {
		0% {
			background-position: 0 0;
		}

		100% {
			background-position: 28px 28px;
		}
	}

	div {
		border-radius: var(--radius);
		color: var(--color-white);
		display: grid;
		grid-area: message;
		overflow: auto hidden;
		place-items: center;

		h2 {
			background: linear-gradient(
				to bottom right,
				var(--color-drexel-blue) 50%,
				var(--color-drexel-blue-dark)
			);
			color: var(--color-white);
			display: grid;
			font-size: 4.5cqw;
			height: 100%;
			line-height: 1.1;
			margin: 0;
			place-items: center;
			text-align: center;
			text-shadow: 0 2px 4px var(--color-black);
			width: 100%;
		}
	}
</style>
