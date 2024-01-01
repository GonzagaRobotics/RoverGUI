<script lang="ts">
	import { readFromRover } from '$lib/comm/ReadFromRover';
	import { getContext } from 'svelte';
	import Pane from './Pane.svelte';
	import { Client } from '$lib/Client';
	import { GPSLoadingData, GPSMapping } from '$lib/comm/mappings/GPS';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	const gpsStore = client.config.preview
		? null
		: readFromRover(client.ros, GPSMapping, GPSLoadingData);

	$: loading = gpsStore != null && $gpsStore == null;
</script>

<Pane {start} {end} name="Map" {loading}>
	<svelte:fragment slot="main">
		{#if gpsStore && $gpsStore}
			Latitude: {$gpsStore.latitude} <br />
			Longitude: {$gpsStore.longitude} <br />
			Heading: {$gpsStore.heading} <br />
		{/if}
	</svelte:fragment>
</Pane>
