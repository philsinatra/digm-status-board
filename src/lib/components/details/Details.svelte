<script lang="ts">
	const { summary, children } = $props();
</script>

<details>
	<summary>
		<div class="summary">{summary}</div>
		<div class="icon">
			<svg><use href="#icon-chevron-right" /></svg>
		</div>
	</summary>
	{@render children?.()}
</details>

<style>
	details {
		summary {
			align-items: center;
			background-color: var(--color-drexel-blue);
			color: var(--color-white);
			cursor: pointer;
			display: flex;
			font-size: 1.5rem;
			font-weight: 700;
			justify-content: space-between;
			padding: var(--space-small);
			text-wrap: pretty;
			transition: background-color var(--duration-short) ease-in-out;

			& div:first-of-type {
				flex-grow: 1;
			}

			& div:last-of-type {
				display: grid;
				height: 48px;
				place-items: center;
				width: 48px;

				svg {
					height: 36px;
					width: 36px;
				}
			}

			@media (hover: hover) and (pointer: fine) {
				&:hover {
					background-color: var(--color-drexel-blue-dark);
				}
			}
		}

		&[open] summary {
			div:last-of-type {
				transform: rotate(90deg);
			}
		}
	}
</style>
