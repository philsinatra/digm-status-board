<section id="brand">
	<div class="brand"><svg><use href="#brand" /></svg></div>
</section>

<style>
	#brand {
		background-color: var(--color-drexel-blue);
		border-radius: var(--radius);
		color: var(--color-drexel-gold);
		container-type: size;
		display: grid;
		grid-area: brand;
		height: clamp(80px, 8vw, 100px);
		place-items: center;

		.brand {
			height: min(60cqh, 80px);
			width: auto;

			svg {
				height: 100%;
				max-width: 250px;
				width: auto;
			}

			@container (width >= 440px) {
				justify-self: start;
				padding-inline: var(--space-medium);
			}
		}
	}
</style>
