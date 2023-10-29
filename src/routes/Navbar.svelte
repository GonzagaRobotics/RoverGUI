<script lang="ts">
	import type { AppLayout } from '$lib/AppLayoutParser';
	import Tab from '$lib/components/Tab.svelte';
	import Switch from '$lib/components/Switch.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { ClientConnectionStatus } from '$lib/ros/ClientTypes';
	import { clientState } from '$lib/ros/Client';

	export let layoutData: AppLayout;
	export let selectedTab: string;
</script>

<nav>
	<ul id="info">
		<li><h1>Rover GUI</h1></li>
		<li><p class="text-small">v0.2.0 - 10/29/2023</p></li>
	</ul>

	<ul id="tabs">
		{#each layoutData.tabs as tab}
			<li>
				<Tab uuid={tab.uuid} name={tab.name} selected={tab.uuid == selectedTab} on:click />
			</li>
		{/each}
	</ul>

	<ul id="settings">
		<li
			id="connection-status"
			class:error={$clientState.connectionStatus == ClientConnectionStatus.Error}
			class:connecting={$clientState.connectionStatus == ClientConnectionStatus.Connecting}
			class:connected={$clientState.connectionStatus == ClientConnectionStatus.Connected}
		>
			<Icon icon="wifi" --s-size={'2.5rem'} />
		</li>

		<li id="allow-publish">
			<Switch checked={true}>
				<span>Publish</span>
			</Switch>
		</li>

		<li id="open-settings">
			<Icon
				icon="settings"
				--s-size={'2rem'}
				--s-hover-color={'var(--color-accent)'}
				--s-hover-scale={1.1}
			/>
		</li>
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

	ul#settings li#connection-status.connecting {
		color: var(--color-status-warning);
	}

	ul#settings li#connection-status.connected {
		color: var(--color-status-ok);
	}

	ul#settings li#connection-status.error {
		color: var(--color-status-error);
	}
</style>
