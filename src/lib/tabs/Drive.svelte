<script lang="ts">
	import Camera from '$lib/panes/camera/Camera.svelte';
	import Map from '$lib/panes/map/Map.svelte';
	import Motors from '$lib/panes/motors/Motors.svelte';
	import View3D from '$lib/panes/view3d/View3D.svelte';

	let map: Map;
	let view3d: View3D;

	export function tick(delta: number) {
		map?.tick(delta);
		view3d?.tick(delta);
	}
</script>

<View3D bind:this={view3d} start={{ x: 1, y: 1 }} end={{ x: 3, y: 2 }} />
<Motors start={{ x: 3, y: 1 }} end={{ x: 4, y: 2 }} />
<Map bind:this={map} start={{ x: 4, y: 1 }} end={{ x: 5, y: 2 }} />
<Camera start={{ x: 1, y: 2 }} end={{ x: 3, y: 3 }} />
