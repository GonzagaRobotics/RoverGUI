<script lang="ts">
	import '../styles/app.css';
	import Navbar from './navbar/Navbar.svelte';
	import { WindowLayoutParser, type WindowLayout, type Tab } from '$lib/data/WindowLayoutParser';
	import { onMount } from 'svelte';
	import Window from './Window.svelte';
	import Settings from './settings/Settings.svelte';

	let layoutData: WindowLayout | undefined = undefined;
	let selectedTab: Tab | undefined = undefined;

	let showSettings = false;

	function handleTabChange(e: any) {
		const tabId = e.detail;
		selectedTab = layoutData?.tabs.find((tab) => tab.uuid == tabId);
	}

	async function loadWindowLayout() {
		const layoutRes = await fetch('/window-layout-data.json');

		layoutData = WindowLayoutParser.parse(await layoutRes.text());

		selectedTab = layoutData.tabs.length == 0 ? undefined : layoutData.tabs[0];
	}

	onMount(() => {
		loadWindowLayout();
	});
</script>

<Settings bind:showSettings />

{#if layoutData}
	<Navbar
		{layoutData}
		selectedTabId={selectedTab?.uuid}
		on:click={handleTabChange}
		on:open-settings={() => (showSettings = true)}
	/>
	<Window {layoutData} {selectedTab} />
{/if}
