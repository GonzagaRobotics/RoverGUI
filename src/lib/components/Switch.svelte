<script lang="ts">
	export let checked = false;
</script>

<label>
	<input type="checkbox" role="switch" bind:checked />
	<slot />
</label>

<style>
	label {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
	}

	input {
		position: relative;
		box-sizing: border-box;
		width: 3rem;
		height: 1.5rem;

		appearance: none;
		display: grid;
		place-items: center;

		border: var(--border-size-base) solid var(--color-text);
		border-radius: 0.75rem;
		transition: var(--transition-base);
	}

	input:checked {
		background: var(--color-accent-dark);
	}

	input:hover::before {
		scale: 1.05;
	}

	input::before {
		content: '';
		position: absolute;
		left: 0.2rem;
		width: 1rem;
		height: 1rem;

		background: var(--color-text);
		border-radius: 50%;

		transition: var(--transition-base);
	}

	input:checked::before {
		left: calc(100% - 1.2rem);
	}
</style>
