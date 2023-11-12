<script lang="ts">
	import { onMount } from 'svelte';
	import { View3DInternal } from './View3DInternal';
	import View3DHeading from './View3DHeading.svelte';
	import View3DInfo from './View3DInfo.svelte';
	import { gpsimuStore } from '$lib/data/ros/GPSIMU';
	import { clientConfig } from '$lib/data/Client';

	let rendererCanvas: HTMLCanvasElement;
	let internal: View3DInternal;

	$: loading = clientConfig.preview == false && $gpsimuStore == undefined;

	onMount(() => {
		rendererCanvas.width = rendererCanvas.clientWidth;
		rendererCanvas.height = rendererCanvas.clientHeight;

		internal = new View3DInternal(rendererCanvas);

		return () => {
			internal.dispose();
		};
	});
</script>

<div class:skeleton-loading={loading}>
	{#if loading == false}
		<View3DHeading />
		<View3DInfo />
	{/if}
</div>
<canvas bind:this={rendererCanvas} style:visibility={loading ? 'hidden' : 'inherit'} />

<style>
	canvas {
		position: absolute;

		width: 100%;
		height: 100%;
	}

	div {
		position: absolute;

		width: 100%;
		height: 100%;

		display: flex;

		flex-direction: column;
		justify-content: start;
		align-items: end;
	}
</style>
