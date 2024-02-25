<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from '../Pane.svelte';
	import type { Client } from '$lib/Client';
	import { readFromRover } from '$lib/comm/ReadFromRover';
	import { CameraMapping } from '$lib/comm/mappings/CameraImage';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	let cameraStore = readFromRover(client, CameraMapping, null, null);

	let image: HTMLImageElement;

	$: if (image) {
		image.src = `data:image/jpeg;base64,${$cameraStore?.image.data}`;
	}
</script>

<Pane
	{start}
	{end}
	name="Camera"
	loading={$cameraStore == null}
	containerClasses="flex justify-center items-center overflow-hidden"
>
	<svelte:fragment slot="main">
		<img bind:this={image} width="640" height="480" alt="" />
	</svelte:fragment>
</Pane>
