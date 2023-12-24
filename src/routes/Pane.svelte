<script lang="ts">
	import type { Tab } from '$lib/LayoutParser';
	import Motors from '$lib/panes/Motors.svelte';
	import View3D from '$lib/panes/view3d/View3D.svelte';

	export let tabData: Tab;
	export let paneId: string;
	export let name: string;
</script>

{#if paneId == 'view-3d'}
	<View3D {tabData} {paneId} {name} />
{:else if paneId == 'motors'}
	<Motors {tabData} {paneId} {name} />
{/if}
