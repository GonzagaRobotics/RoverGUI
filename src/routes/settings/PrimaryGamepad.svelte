<script lang="ts">
	import { clientConfig } from '$lib/data/Client';
	import {
		allowNewPrimaryGamepad,
		getPrimaryGamepad,
		resetPrimaryGamepad
	} from '$lib/data/input/GamepadManager';

	function onClick() {
		$allowNewPrimaryGamepad = !$allowNewPrimaryGamepad;
	}

	function onReset() {
		resetPrimaryGamepad();
	}
</script>

<li>
	<div id="container">
		{#if clientConfig.autoPrimaryGamepad == false}
			<h4>
				{#if $allowNewPrimaryGamepad}
					Hold LT and RT on the new primary gamepad
				{:else}
					Primary Gamepad:
					{#if $getPrimaryGamepad}
						{$getPrimaryGamepad.id} {$getPrimaryGamepad.index}
					{:else}
						None
					{/if}
				{/if}
			</h4>

			<button on:click={onClick}>
				{#if $allowNewPrimaryGamepad}
					Cancel
				{:else}
					Set
				{/if}
			</button>

			{#if $getPrimaryGamepad}
				<button on:click={onReset}>Clear</button>
			{/if}
		{:else}
			<h4>
				Auto Primary Gamepad:
				{#if $getPrimaryGamepad}
					{$getPrimaryGamepad.id} {$getPrimaryGamepad.index}
				{:else}
					None
				{/if}
			</h4>
		{/if}
	</div>
</li>

<style>
	li {
		list-style-type: '- ';
	}

	#container {
		display: flex;
		justify-content: start;
		align-items: center;
		column-gap: 2rem;
	}

	button {
		background: none;
		border: 1px solid var(--color-accent);
		border-radius: var(--border-radius-base);
		padding: 0.25rem;
		color: var(--color-accent);

		transition: var(--transition-base);
	}

	button:hover {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);

		scale: 1.05;
	}
</style>
