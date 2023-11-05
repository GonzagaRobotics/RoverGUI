<script lang="ts">
	import { onMount } from 'svelte';
	import { View3DInternal } from './View3DInternal';
	import View3DHeading from './View3DHeading.svelte';
	import View3DInfo from './View3DInfo.svelte';

	let rendererCanvas: HTMLCanvasElement;
	let internal: View3DInternal;

	onMount(() => {
		rendererCanvas.width = rendererCanvas.clientWidth;
		rendererCanvas.height = rendererCanvas.clientHeight;

		internal = new View3DInternal(rendererCanvas);

		return () => {
			internal.dispose();
		};
	});
</script>

<div>
	<View3DHeading />
	<View3DInfo />
</div>
<canvas bind:this={rendererCanvas} />

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
