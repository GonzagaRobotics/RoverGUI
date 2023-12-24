<script lang="ts">
	import Pane from '../Pane.svelte';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };
</script>

<Pane {start} {end} name="3D View">
	<svelte:fragment slot="main">Hello World</svelte:fragment>
</Pane>
