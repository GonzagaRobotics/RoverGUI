<script lang="ts">
	import type { AppLayout } from '$lib/AppLayoutParser';
	import Icon from '$lib/components/Icon.svelte';
	import View3D from '$lib/components/panes/View3D.svelte';

	export let layoutData: AppLayout;
	export let selectedTabId: string;

	$: selectedTabObj = layoutData.tabs.find((tab) => tab.uuid == selectedTabId)!;
</script>

<main>
	{#if selectedTabId != ''}
		<!-- I really don't like this repetitive code. Really, I want this to be fairly automatic. -->
		{#each selectedTabObj.panes as pane}
			{#if pane.uuid == 'view-3d'}
				<View3D
					--s-pane-column-start={pane.start.x}
					--s-pane-column-end={pane.start.x + pane.size.width}
					--s-pane-row-start={pane.start.y}
					--s-pane-row-end={pane.start.y + pane.size.height}
				/>
			{:else}
				<div>Pane type not supported</div>
			{/if}
		{/each}
	{:else}
		<div id="no-tab-selected">
			<h1>No tab selected</h1>
			<Icon icon="frown" --s-size={'10%'} />
		</div>
	{/if}
</main>

<style>
	main {
		box-sizing: border-box;
		height: var(--window-height);

		padding: 0.5rem;

		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(2, 1fr);
	}

	div#no-tab-selected {
		grid-row: 1 / 3;
		grid-column: 2 / 4;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
