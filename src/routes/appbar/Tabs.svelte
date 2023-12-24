<script lang="ts">
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import type { Writable } from 'svelte/store';

	export let selectedTabId: Writable<string>;

	const tabs = [{ id: 'drive', name: 'Drive' }];
</script>

<TabGroup justify="justify-center">
	{#each tabs as tab (tab.id)}
		<Tab bind:group={$selectedTabId} name={tab.id} value={tab.id}>{tab.name}</Tab>
	{/each}
</TabGroup>
