<script lang="ts">
	import type { Tab } from '$lib/LayoutParser';

	export let tabData: Tab;
	export let paneId: string;
	export let name: string;

	$: pane = tabData.panes.find((pane) => pane.id === paneId)!;
	$: start = pane.start;
	$: end = { x: start.x + pane.size.x, y: start.y + pane.size.y };
</script>

<div
	style="grid-column: {start.x} / {end.x}; grid-row: {start.y} / {end.y};"
	class="flex flex-col items-center border-2 rounded-container-token border-secondary-300"
>
	<h2 class="w-full h4 text-center">{name}</h2>
	<div class="w-full flex-grow">
		Hello {name}!
	</div>
</div>
