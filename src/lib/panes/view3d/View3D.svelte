<script lang="ts">
	export let start: { x: number; y: number };
	export let end: { x: number; y: number };
</script>

<div
	style="grid-column: {start.x} / {end.x}; grid-row: {start.y} / {end.y};"
	class="flex flex-col items-center border-2 rounded-container-token border-secondary-300"
>
	<h2 class="w-full h4 text-center">3D View</h2>
	<div class="w-full flex-grow"></div>
</div>
