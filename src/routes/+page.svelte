<script lang="ts">
	import { AppShell, getToastStore } from '@skeletonlabs/skeleton';
	import AppBar from './appbar/AppBar.svelte';
	import { Client } from '$lib/Client';
	import { setContext, onMount } from 'svelte';
	import { parseWindowLayout, type WindowLayoutData } from '$lib/LayoutParser';
	import { writable } from 'svelte/store';
	import Pane from './Pane.svelte';

	const client = new Client(getToastStore());
	setContext('client', client);

	let layout: WindowLayoutData | null = null;
	let selectedTabId = writable<string>('');

	$: selectedTabObj = layout?.tabs.find((tab) => tab.id == $selectedTabId);

	async function loadLayout() {
		const layoutText = await fetch('/layout-data.json').then((res) => res.text());

		layout = parseWindowLayout(layoutText);

		// Select the first tab by default
		if (layout.tabs.length > 0) {
			selectedTabId.set(layout.tabs[0].id);
		}
	}

	onMount(() => {
		loadLayout();

		// When the layout is destroyed, we need to dispose of the client
		return () => {
			client.dispose();
		};
	});
</script>

{#if layout}
	<AppShell>
		<svelte:fragment slot="header">
			<AppBar {layout} {selectedTabId} />
		</svelte:fragment>
		<div class="w-full h-full p-1 grid grid-cols-4 grid-rows-2 gap-1">
			{#if selectedTabObj}
				<!-- Create all panes in the selected tab. -->
				{#each selectedTabObj.panes as pane}
					<Pane
						tabData={selectedTabObj}
						paneId={pane.id}
						name={layout.panes.find((p) => p.id == pane.id)?.name ?? 'Unknown Pane'}
					/>
				{/each}
			{/if}
		</div>
	</AppShell>
{/if}
