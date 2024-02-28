<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from '../Pane.svelte';
	import { Client } from '$lib/Client';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');
</script>

<Pane {start} {end} name="Auto Nav Status" containerClasses="flex flex-col items-center">
	<svelte:fragment slot="main">
		<p>Current State: Traveling</p>

		<div class="w-[75%] px-4 my-4">
			<p class="h5 text-center">Current Goal</p>

			<div class="flex flex-row justify-between">
				<p>Lat: XXX.XXX</p>
				<p>Lon: YYY.YYY</p>
				<p>Type: Mallet</p>
			</div>
		</div>
	</svelte:fragment>
</Pane>
