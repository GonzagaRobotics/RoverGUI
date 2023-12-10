<script lang="ts">
	export let icon: string;
</script>

<svg>
	<use href="/feather-sprites.svg#{icon}" />
</svg>

<style>
	svg {
		width: var(--s-size, 100%);
		height: var(--s-size, 100%);
		stroke: var(--s-color, currentColor);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;

		transition: var(--transition-base);
	}

	svg:hover {
		stroke: var(--s-hover-color, currentColor);
		scale: var(--s-hover-scale, 1);
	}
</style>
