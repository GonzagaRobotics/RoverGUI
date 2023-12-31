<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from './Pane.svelte';
	import { Client } from '$lib/Client';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	let verticalInput = client.inputSystem.registerAxisHandle({
		id: 'motors_vertical',
		axis: 'LY',
		inverted: true,
		curve: 1.5
	});

	let horizontalInput = client.inputSystem.registerAxisHandle({
		id: 'motors_horizontal',
		axis: 'RX',
		curve: 1.5
	});

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	$: leftOutput = clamp($verticalInput + $horizontalInput, -1, 1);
	$: rightOutput = clamp($verticalInput - $horizontalInput, -1, 1);

	client.inputSystem.gamepadConnected.subscribe((v) => {
		if (v == false) {
			leftOutput = 0;
			rightOutput = 0;
		}
	});
</script>

<Pane {start} {end} name="Motors">
	<svelte:fragment slot="main">
		<p>Left {leftOutput} | Right {rightOutput}</p>
	</svelte:fragment>
</Pane>
