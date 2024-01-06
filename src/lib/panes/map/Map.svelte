<script lang="ts">
	import { readFromRover } from '$lib/comm/ReadFromRover';
	import { getContext, onMount } from 'svelte';
	import Pane from '../Pane.svelte';
	import { Client } from '$lib/Client';
	import { GPSLoadingData, GPSMapping } from '$lib/comm/mappings/GPS';
	import { MapCanvas } from './MapCanvas';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };
	export function tick(delta: number) {
		internal?.tick(delta);
	}

	const client = getContext<Client>('client');

	const gpsStore = readFromRover(client, GPSMapping, GPSLoadingData, {
		latitude: 38.40629672161739,
		longitude: -110.79178163652442,
		heading: 60
	});

	let canvas: HTMLCanvasElement;
	let internal: MapCanvas;

	onMount(() => {
		internal = new MapCanvas(canvas);
	});
</script>

<Pane
	{start}
	{end}
	name="Map"
	loading={$gpsStore == null}
	containerClasses="relative flex flex-col min-h-0"
>
	<svelte:fragment slot="main">
		<div class="mx-2 my-1 flex flex-row justify-between">
			<p>Latitude: {$gpsStore?.latitude.toFixed(4)}</p>
			<p>Longitude: {$gpsStore?.longitude.toFixed(4)}</p>
			<p>Heading: {$gpsStore?.heading.toFixed(2)}</p>
		</div>
		<div class="w-full h-full flex justify-center items-center overflow-hidden">
			<canvas bind:this={canvas} width="600" height="600" class="max-w-full max-h-full"></canvas>
		</div>
	</svelte:fragment>
</Pane>
