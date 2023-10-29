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

<div id="container">
	<h2>3D View</h2>
	<div id="main">
		<div>
			<View3DHeading />
			<View3DInfo />
		</div>
		<canvas bind:this={rendererCanvas} />
	</div>
</div>

<style>
	div#container {
		box-sizing: border-box;

		height: 100%;
		width: 100%;

		grid-column: var(--s-pane-column-start) / var(--s-pane-column-end);
		grid-row: var(--s-pane-row-start) / var(--s-pane-row-end);

		display: flex;
		align-items: center;
		flex-direction: column;

		border: 2px solid var(--color-secondary-dark);
	}

	h2 {
		margin: 0;
	}

	div#main {
		position: relative;
		box-sizing: border-box;

		width: 100%;
		height: 100%;
	}

	div#main canvas {
		position: absolute;

		width: 100%;
		height: 100%;
	}

	div#main div {
		position: absolute;

		width: 100%;
		height: 100%;

		display: flex;

		flex-direction: column;
		justify-content: start;
		align-items: end;
	}
</style>
