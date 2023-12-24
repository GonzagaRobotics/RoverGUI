<script lang="ts">
	import Disconnected from '~icons/mdi/lan-disconnect';
	import Connecting from '~icons/mdi/lan-pending';
	import Connected from '~icons/mdi/lan-connect';
	import { getContext } from 'svelte';
	import { ClientConnectionStatus, type Client } from '$lib/Client';

	const client = getContext('client') as Client;
	const clientState = client.state;
</script>

<div style="font-size: 2em;">
	{#if $clientState.connectionStatus == ClientConnectionStatus.Disconnected}
		<Disconnected class="text-warning-500"></Disconnected>
	{:else if $clientState.connectionStatus == ClientConnectionStatus.Connecting}
		<Connecting class="animate-pulse-fast"></Connecting>
	{:else}
		<Connected class="text-success-500"></Connected>
	{/if}
</div>
