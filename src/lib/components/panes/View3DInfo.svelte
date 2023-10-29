<script lang="ts">
	import { gpsimuStore } from '$lib/ros/nodes/GPSIMU';

	let lat = $gpsimuStore ? $gpsimuStore.latitude : 0;
	let lng = $gpsimuStore ? $gpsimuStore.longitude : 0;
	let pitch = $gpsimuStore ? $gpsimuStore.pitch : 0;
	let roll = $gpsimuStore ? $gpsimuStore.roll : 0;
	let yaw = $gpsimuStore ? $gpsimuStore.yaw : 0;
</script>

<div id="background">
	<p>Lat: {lat.toFixed(4)}</p>
	<p>Lng: {lng.toFixed(4)}</p>
	<p>Pitch: {lng.toFixed(2)}</p>
	<p>Roll: {lng.toFixed(2)}</p>
	<p>Yaw: {lng.toFixed(2)}</p>
</div>

<style>
	div#background {
		z-index: 2;
		padding-left: 0.5rem;
		padding-right: 0.5rem;

		text-align: end;

		font-family: var(--font-family-code);

		background-color: color-mix(in srgb, var(--color-background) 75%, transparent);
	}

	p {
		margin: 0.25rem 0rem;
	}
</style>
