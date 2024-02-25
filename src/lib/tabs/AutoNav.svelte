<script lang="ts">
	import Camera from '$lib/panes/camera/Camera.svelte';
	import Map from '$lib/panes/map/Map.svelte';
	import ReadonlyMotors from '$lib/panes/motors/ReadonlyMotors.svelte';

	let map: Map;

	export function tick(delta: number) {
		map?.tick(delta);
	}
</script>

<ReadonlyMotors start={{ x: 3, y: 1 }} end={{ x: 4, y: 2 }} />
<Map bind:this={map} start={{ x: 4, y: 1 }} end={{ x: 5, y: 2 }} />
<Camera start={{ x: 1, y: 1 }} end={{ x: 3, y: 2 }} />
