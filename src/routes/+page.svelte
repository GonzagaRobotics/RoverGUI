<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import AppBar from './appbar/AppBar.svelte';
	import { Client } from '$lib/Client';
	import { setContext, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Drive from '$lib/tabs/Drive.svelte';

	const client = new Client(getToastStore());
	setContext('client', client);

	let selectedTabId = writable<string>('drive');

	let lastTickTimestamp: number | undefined;

	let tabComponent: Drive;

	function tick(timestamp: number) {
		if (lastTickTimestamp == undefined) {
			lastTickTimestamp = timestamp;
		}

		const delta = timestamp - lastTickTimestamp;

		client.tick(delta / 1000);
		tabComponent.tick(delta / 1000);

		lastTickTimestamp = timestamp;
		requestAnimationFrame(tick);
	}

	onMount(() => {
		requestAnimationFrame(tick);

		// When the page is destroyed, we need to dispose of the client
		return () => {
			client.dispose();
		};
	});
</script>

<div class="w-full h-full flex flex-col">
	<AppBar {selectedTabId} />

	<main class="min-h-0 grow grid grid-cols-4 grid-rows-2 gap-1">
		{#if $selectedTabId == 'drive'}
			<Drive bind:this={tabComponent} />
		{:else}
			<div class="col-span-full row-span-full flex justify-center items-center">
				<p class="h1">No Tab Selected</p>
			</div>
		{/if}
	</main>
</div>

<!-- <AppShell>
	<svelte:fragment slot="header">
		<AppBar {selectedTabId} />
	</svelte:fragment>
	<div class="w-full h-full p-1 grid grid-cols-4 grid-rows-2 gap-1">
		{#if $selectedTabId == 'drive'}
			<Drive />
		{:else}
			<div class="col-span-full row-span-full flex justify-center items-center">
				<p class="h1">No Tab Selected</p>
			</div>
		{/if}
	</div>
</AppShell> -->
