<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from '../Pane.svelte';
	import { Client } from '$lib/Client';
	import Arrow from './Arrow.svelte';
	import { MotorsLoadingData, MotorsMapping } from '$lib/comm/mappings/Motors';
	import { readFromRover } from '$lib/comm/ReadFromRover';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	let motorsStore = readFromRover(client, MotorsMapping, MotorsLoadingData);

	let leftOutput = $motorsStore?.left ?? 0;
	let rightOutput = $motorsStore?.right ?? 0;
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
			<p class="h4 text-center text-warning-500">Motors are being controlled by the rover.</p>
		</div>
	</svelte:fragment>
</Pane>
