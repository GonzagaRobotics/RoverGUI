<script lang="ts">
	import type { WindowLayoutData } from '$lib/LayoutParser';
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import { writable, type Writable } from 'svelte/store';

	export let layout: WindowLayoutData;
	export let selectedTabId: Writable<string>;
</script>

<TabGroup justify="justify-center">
	{#each layout.tabs as tab (tab.id)}
		<Tab bind:group={$selectedTabId} name={tab.id} value={tab.id}>{tab.name}</Tab>
	{/each}
</TabGroup>
