<script lang="ts">
	import type { WindowLayout } from '$lib/data/WindowLayoutParser';
	import Tab from './Tab.svelte';
	import ConnectionStatus from './ConnectionStatus.svelte';
	import AllowPublishing from './AllowPublishing.svelte';
	import Settings from './Settings.svelte';

	export let layoutData: WindowLayout;
	export let selectedTabId: string | undefined;
</script>

<nav>
	<ul id="info">
		<li><h1>Rover GUI</h1></li>
		<li><p class="text-small">v0.4.0 - 11/12/2023</p></li>
	</ul>

	<ul id="tabs">
		{#each layoutData.tabs as tab}
			<li>
				<Tab uuid={tab.uuid} name={tab.name} selected={tab.uuid == selectedTabId} on:click />
			</li>
		{/each}
	</ul>

	<ul id="settings">
		<ConnectionStatus />

		<AllowPublishing />

		<Settings on:open-settings />
	</ul>
</nav>

<style>
	nav {
		box-sizing: border-box;
		height: var(--navbar-height);
		padding: 0.5rem 1rem;

		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		column-gap: 1rem;

		box-shadow: inset 0 -2px 0 0 var(--color-accent);
	}

	@media screen and (max-height: 900px) {
		nav {
			padding: 0.25rem 0.5rem;
		}
	}

	nav ul {
		margin: 0;
		padding: 0;

		list-style: none;
		display: flex;
	}

	ul#info {
		flex-direction: column;
		justify-content: flex-start;
		row-gap: 0.25rem;
	}

	ul#info p {
		margin-left: 0.5rem;
	}

	ul#tabs {
		justify-content: center;
		align-items: center;
		column-gap: 2rem;
	}

	ul#settings {
		justify-content: flex-end;
		align-items: center;
		column-gap: 2rem;
	}
</style>
