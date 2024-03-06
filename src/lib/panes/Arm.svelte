<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from './Pane.svelte';
	import type { Client } from '$lib/Client';
	import { ClientRosTopic } from '$lib/comm/core/ClientRosTopic';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	const shoulderTopic = new ClientRosTopic('/shoulder_input', 'std_msgs/Float32', client.ros);
	const forearmTopic = new ClientRosTopic('/forearm_input', 'std_msgs/Float32', client.ros);
	const wristTopic = new ClientRosTopic('/wrist_input', 'std_msgs/Float32', client.ros);

	const shoulderInput = client.inputSystem.registerAxisHandle({
		id: 'shoulder',
		axis: 'LY',
		curve: 1.5,
		deadzone: 0.1
	});

	shoulderInput.subscribe((value) => shoulderTopic.publish({ data: value }));

	const forearmInput = client.inputSystem.registerAxisHandle({
		id: 'forearm',
		axis: 'RY',
		curve: 1.5,
		deadzone: 0.1
	});

	forearmInput.subscribe((value) => forearmTopic.publish({ data: value }));

	const wristInputForward = client.inputSystem.registerButtonHandle({
		id: 'wristForward',
		button: 'A'
	});

	const wristInputBackward = client.inputSystem.registerButtonHandle({
		id: 'wristBackward',
		button: 'B'
	});

	$: wristTopic.publish({ data: ($wristInputForward ? 1 : 0) - ($wristInputBackward ? 1 : 0) });
</script>

<Pane {start} {end} name="Arm" containerClasses="flex justify-center items-center overflow-hidden">
	<svelte:fragment slot="main">Arm Stuff here</svelte:fragment>
</Pane>
