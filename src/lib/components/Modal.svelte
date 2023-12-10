<script lang="ts">
	import Icon from './Icon.svelte';

	export let showModal: Boolean;
	export let size: 'small' | 'medium' | 'large' | 'full' = 'medium';

	let dialog: HTMLDialogElement;

	$: if (dialog && showModal) {
		dialog.showModal();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
	class:medium={size == 'medium'}
	class:large={size == 'large'}
	class:full={size == 'full'}
>
	<div>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div on:click={() => dialog.close()}>
			<Icon
				icon="x"
				--s-size="1.5rem"
				--s-hover-color="var(--color-accent)"
				--s-hover-scale="1.1"
			/>
		</div>

		<slot name="header" />
		<hr />
		<slot />
	</div>
</dialog>

<style>
	dialog {
		min-width: 15%;
		max-width: 25%;
		min-height: 20%;
		max-height: 100%;

		padding: 0;

		border: var(--border-size-base) solid var(--color-secondary-dark);
		border-radius: var(--border-radius-large);
		background: var(--color-background);
		color: var(--color-text);
	}

	dialog.medium {
		min-width: 30%;
		max-width: 50%;
		min-height: 50%;
	}

	dialog.large {
		min-width: 60%;
		max-width: 80%;
		min-height: 75%;
	}

	dialog.full {
		max-width: 100%;
		width: 90%;
		height: 90%;
	}

	dialog[open] {
		animation: zoom 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}

	dialog[open]::backdrop {
		animation: fade 0.25s ease-in-out;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	dialog > div {
		padding: 1rem;
	}
</style>
