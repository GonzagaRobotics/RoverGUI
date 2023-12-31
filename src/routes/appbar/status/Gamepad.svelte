<script lang="ts">
	import { Client } from '$lib/Client';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { getContext } from 'svelte';
	import { backOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import Controller from '~icons/mdi/microsoft-xbox-controller';
	import NoController from '~icons/mdi/microsoft-xbox-controller-off';

	const client = getContext<Client>('client');
	const gamepadConnected = client.inputSystem.gamepadConnected;

	const toastStore = getToastStore();

	gamepadConnected.subscribe((connected) => {
		toastStore.trigger({
			message: connected ? 'Gamepad Connected' : 'Gamepad Disconnected',
			timeout: 2000,
			background: 'variant-filled-secondary',
			hideDismiss: true
		});
	});
</script>

{#key $gamepadConnected}
	<div style="font-size: 2.25em;" in:scale={{ easing: backOut }}>
		{#if $gamepadConnected}
			<Controller></Controller>
		{:else}
			<NoController></NoController>
		{/if}
	</div>
{/key}
