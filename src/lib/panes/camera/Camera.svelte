<script lang="ts">
	import { onMount } from 'svelte';
	import Pane from '../Pane.svelte';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const imgUrl = new URL('/camera-placeholder.png', import.meta.url).href;

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;

		const img = new Image();
		img.src = imgUrl;

		img.onload = () => {
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		};
	});
</script>

<Pane
	{start}
	{end}
	name="Camera"
	containerClasses="flex justify-center items-center overflow-hidden"
>
	<svelte:fragment slot="main">
		<canvas bind:this={canvas} width="800" height="600" class="max-w-full max-h-full"></canvas>
	</svelte:fragment>
</Pane>
