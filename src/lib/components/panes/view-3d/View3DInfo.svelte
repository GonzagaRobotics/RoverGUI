<script lang="ts">
	import { gpsimuStore } from '$lib/ros/GPSIMU';

	$: lat = $gpsimuStore ? $gpsimuStore.latitude : 0;
	$: lng = $gpsimuStore ? $gpsimuStore.longitude : 0;
	$: pitch = $gpsimuStore ? $gpsimuStore.pitch : 0;
	$: roll = $gpsimuStore ? $gpsimuStore.roll : 0;
	$: yaw = $gpsimuStore ? $gpsimuStore.yaw : 0;
</script>

<div id="background">
	<p>Lat: {lat.toFixed(4)}</p>
	<p>Lng: {lng.toFixed(4)}</p>
	<p>Pitch: {pitch.toFixed(2)}</p>
	<p>Roll: {roll.toFixed(2)}</p>
	<p>Yaw: {yaw.toFixed(2)}</p>
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
