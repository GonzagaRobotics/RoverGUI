<script lang="ts">
	import { onMount } from 'svelte';
	import Pane from '../Pane.svelte';
	import { View3DInternal } from './View3DInternal';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };
	export function tick(delta: number) {
		internal?.tick(delta);
	}

	let canvas: HTMLCanvasElement;
	let internal: View3DInternal;

	onMount(() => {
		// If the parent of the canvas is more than a little larger than the canvas, then
		// resize the canvas to better fit the parent.
		if (canvas.parentElement!.clientWidth > 900 && canvas.parentElement!.clientHeight > 675) {
			canvas.width = 1000;
			canvas.height = 750;
		}

		internal = new View3DInternal(canvas);

		return () => {
			internal.dispose();
		};
	});
</script>

<Pane
	{start}
	{end}
	name="3D View"
	containerClasses="flex justify-center items-center overflow-hidden"
>
	<svelte:fragment slot="main">
		<canvas bind:this={canvas} width="800" height="600" class="max-w-full max-h-full"></canvas>
	</svelte:fragment>
</Pane>
