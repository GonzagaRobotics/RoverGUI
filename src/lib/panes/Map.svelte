<script lang="ts">
	import { readFromRover } from '$lib/comm/ReadFromRover';
	import { getContext } from 'svelte';
	import Pane from './Pane.svelte';
	import { Client } from '$lib/Client';
	import { GPSLoadingData, GPSMapping } from '$lib/comm/mappings/GPS';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	const gpsStore = readFromRover(client, GPSMapping, GPSLoadingData, {
		latitude: 40.1106,
		longitude: -89.2073,
		heading: 60
	});
</script>

<Pane {start} {end} name="Map" loading={$gpsStore == null}>
	<svelte:fragment slot="main">
		{#if gpsStore && $gpsStore}
			Latitude: {$gpsStore.latitude} <br />
			Longitude: {$gpsStore.longitude} <br />
			Heading: {$gpsStore.heading} <br />
		{/if}
	</svelte:fragment>
</Pane>
