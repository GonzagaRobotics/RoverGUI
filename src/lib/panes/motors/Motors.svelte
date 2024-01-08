<script lang="ts">
	import DPadUp from '~icons/mdi/gamepad-round-up';

	import { getContext } from 'svelte';
	import Pane from '../Pane.svelte';
	import { Client } from '$lib/Client';
	import Arrow from './Arrow.svelte';
	import { sendToRover } from '$lib/comm/SendToRover';
	import { MotorsMapping } from '$lib/comm/mappings/Motors';

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

	let resetButton = client.inputSystem.registerButtonHandle({
		id: 'motors_reset',
		button: 'Up'
	});

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	$: leftOutput = clamp($verticalInput + $horizontalInput, -1, 1);
	$: rightOutput = clamp($verticalInput - $horizontalInput, -1, 1);

	$: if ($resetButton) {
		leftOutput = 0;
		rightOutput = 0;
	}

	client.inputSystem.gamepadConnected.subscribe((v) => {
		if (v == false) {
			leftOutput = 0;
			rightOutput = 0;
		}
	});

	let outputStore = sendToRover(client, MotorsMapping);

	$: outputStore.set({
		left: leftOutput,
		right: rightOutput
	});
</script>

<Pane {start} {end} name="Motors" containerClasses="flex flex-col">
	<svelte:fragment slot="main">
		<div class="flex-grow grid grid-cols-2 items-center">
			<div class="flex flex-col items-center">
				<Arrow direction="up" visible={leftOutput > 0} />

				<span class="h2">{Math.round(Math.abs(leftOutput * 100))}%</span>

				<Arrow direction="down" visible={leftOutput < 0} />
			</div>

			<div class="flex flex-col items-center">
				<Arrow direction="up" visible={rightOutput > 0} />

				<span class="h2">{Math.round(Math.abs(rightOutput * 100))}%</span>

				<Arrow direction="down" visible={rightOutput < 0} />
			</div>
		</div>

		<div>
			<p class="h4 text-center">Press <DPadUp class="inline" /> to reset motors.</p>
		</div>
	</svelte:fragment>
</Pane>
