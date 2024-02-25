<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import AppBar from './appbar/AppBar.svelte';
	import { Client, ClientConnectionStatus } from '$lib/Client';
	import { setContext, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Drive from '$lib/tabs/Drive.svelte';
	import AutoNav from '$lib/tabs/AutoNav.svelte';
	import { beforeNavigate } from '$app/navigation';

	const client = new Client(getToastStore());
	setContext('client', client);
	const clientState = client.state;

	let selectedTabId = writable<string>('drive');

	let lastTickTimestamp: number | undefined;

	let tabComponent: Drive | AutoNav;

	function tick(timestamp: number) {
		if (lastTickTimestamp == undefined) {
			lastTickTimestamp = timestamp;
		}

		const delta = timestamp - lastTickTimestamp;

		client.tick(delta / 1000);
		tabComponent?.tick(delta / 1000);

		lastTickTimestamp = timestamp;
		requestAnimationFrame(tick);
	}

	beforeNavigate((navigation) => {
		// When the page is destroyed, we need to dispose of the client
		if (navigation.type == 'leave') {
			client.dispose();
		}
	});

	onMount(() => {
		requestAnimationFrame(tick);
	});
</script>

<div class="w-full h-full flex flex-col">
	<AppBar {selectedTabId} />

	<main class="min-h-0 grow grid grid-cols-4 grid-rows-2 gap-1">
		{#if $clientState.connectionStatus == ClientConnectionStatus.Connecting}
			<div class="col-span-full row-span-full flex justify-center items-center">
				<p class="h1">Connecting...</p>
			</div>
		{:else if $clientState.connectionStatus == ClientConnectionStatus.Connected}
			{#if $selectedTabId == 'drive'}
				<Drive bind:this={tabComponent} />
			{:else if $selectedTabId == 'auto-nav'}
				<AutoNav bind:this={tabComponent} />
			{/if}
		{/if}
	</main>
</div>
