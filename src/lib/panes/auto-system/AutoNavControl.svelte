<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from '../Pane.svelte';
	import { Client } from '$lib/Client';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');
</script>

<Pane {start} {end} name="Auto Nav Control" containerClasses="flex flex-col items-center">
	<svelte:fragment slot="main">
		<div class="w-[50%] my-2 flex flex-row justify-between">
			<button class="btn btn-lg variant-filled-primary">Pause</button>

			<button class="btn btn-lg variant-filled-error">Terminate</button>
		</div>

		<p class="h5">Set New Goal</p>

		<form class="w-[75%]">
			<label class="label mb-2">
				<span>Latitude</span>
				<input
					class="input"
					type="number"
					name="lat"
					placeholder="Latitude"
					min="-90"
					max="90"
					step="any"
					required
				/>
			</label>

			<label class="label mb-2">
				<span>Longitude</span>
				<input
					class="input"
					type="number"
					name="lat"
					placeholder="Longitude"
					min="-180"
					max="180"
					step="any"
					required
				/>
			</label>

			<label class="label mb-4">
				<span>Type</span>
				<select class="select">
					<option value="0">Post</option>
					<option value="1">GNSS</option>
					<option value="2">Mallet</option>
				</select>
			</label>

			<button type="submit" class="w-full btn btn-lg variant-filled-secondary">Execute</button>
		</form>
	</svelte:fragment>
</Pane>
