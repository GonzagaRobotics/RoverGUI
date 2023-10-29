<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let uuid: string;
	export let name: string;
	export let selected: boolean;

	const dispatch = createEventDispatcher();

	function handleClick() {
		// Nothing will change if the tab is already selected
		if (selected) return;

		dispatch('click', uuid);
	}
</script>

<button class:selected on:click|preventDefault={handleClick}>{name}</button>

<style>
	button {
		padding: 0.67rem 1.33rem;

		background: transparent;
		border-width: var(--border-size-base);
		border-radius: var(--border-radius-base);

		font-size: var(--font-size-medium);

		transition: var(--transition-base);

		color: var(--color-secondary);
		border-color: var(--color-secondary);
	}

	.selected {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	button:hover {
		cursor: pointer;

		background: color-mix(in srgb, var(--color-secondary) 10%, transparent);

		scale: 1.05;
	}

	button:hover.selected {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
	}
</style>
