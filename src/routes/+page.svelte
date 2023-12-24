<script lang="ts">
	import { AppShell, getToastStore } from '@skeletonlabs/skeleton';
	import AppBar from './appbar/AppBar.svelte';
	import { Client } from '$lib/Client';
	import { setContext, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Drive from '$lib/tabs/Drive.svelte';

	const client = new Client(getToastStore());
	setContext('client', client);

	let selectedTabId = writable<string>('drive');

	onMount(() => {
		// When the page is destroyed, we need to dispose of the client
		return () => {
			client.dispose();
		};
	});
</script>

<AppShell>
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
</AppShell>
