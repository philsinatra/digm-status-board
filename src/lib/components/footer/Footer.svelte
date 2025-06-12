<footer>
	<div class="footer">
		<p>DIGM Status &copy; Drexel University {new Date().getFullYear()}</p>
	</div>
</footer>

<style>
	footer {
		background: linear-gradient(var(--color-drexel-blue-dark), var(--color-drexel-blue));
		border-radius: var(--radius);
		color: var(--color-white);
		display: grid;
		grid-area: footer;
		min-height: 84px;
		place-items: center;

		p {
			font-size: clamp(var(--font-size-small), 4cqw, var(--font-size-medium));
			font-weight: 400;
			margin: 0;
		}
	}
</style>
