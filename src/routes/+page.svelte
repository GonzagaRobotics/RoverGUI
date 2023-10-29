<script lang="ts">
	import '../styles/app.css';
	import Navbar from './Navbar.svelte';
	import { AppLayoutParser, type AppLayout } from '$lib/AppLayoutParser';
	import { onMount } from 'svelte';
	import Window from './Window.svelte';

	let layoutData: AppLayout = { panes: [], tabs: [] };
	let selectedTabId: string = '';

	function handleTabChange(e: CustomEvent<any>) {
		selectedTabId = e.detail;
	}

	onMount(async () => {
		const layoutRes = await fetch('/layout-data.json');

		layoutData = AppLayoutParser.parse(await layoutRes.text());

		selectedTabId = layoutData.tabs.length == 0 ? '' : layoutData.tabs[0].uuid;
	});
</script>

<Navbar {layoutData} selectedTab={selectedTabId} on:click={handleTabChange} />
<Window {layoutData} {selectedTabId} />
