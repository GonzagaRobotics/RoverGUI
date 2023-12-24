<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton';
	import Tabs from './Tabs.svelte';
	import type { Writable } from 'svelte/store';
	import Connection from './status/Connection.svelte';
	import Gamepad from './status/Gamepad.svelte';
	import Latency from './status/Latency.svelte';

	export let selectedTabId: Writable<string>;
</script>

<AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
	<svelte:fragment slot="lead">
		<h1 class="h3">Rover GUI</h1>
	</svelte:fragment>

	<Tabs {selectedTabId} />

	<svelte:fragment slot="trail">
		<Latency></Latency>
		<Connection></Connection>
		<Gamepad></Gamepad>
	</svelte:fragment>
</AppBar>
