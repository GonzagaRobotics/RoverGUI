<script lang="ts">
	import Motors from './motors/Motors.svelte';
	import View3D from './view-3d/View3D.svelte';

	export let uuid: string;
	export let name: string;
</script>

<div id="container">
	<h2>{name}</h2>
	<div id="main">
		<!-- I really don't like this repetitive code. Really, I want this to be fairly automatic. -->
		{#if uuid == 'view-3d'}
			<View3D />
		{:else if uuid == 'motors'}
			<Motors />
		{:else}
			<div>Pane type not supported</div>
		{/if}
	</div>
</div>

<style>
	#container {
		box-sizing: border-box;

		height: 100%;
		width: 100%;

		grid-column: var(--s-pane-column-start) / var(--s-pane-column-end);
		grid-row: var(--s-pane-row-start) / var(--s-pane-row-end);

		display: flex;
		align-items: center;
		flex-direction: column;

		border: 2px solid var(--color-secondary-dark);
	}

	#main {
		position: relative;
		box-sizing: border-box;

		min-height: 0;

		width: 100%;
		height: 100%;
	}
</style>
