<script lang="ts">
	import type { Tab, WindowLayout } from '$lib/data/WindowLayoutParser';
	import Icon from '$lib/components/Icon.svelte';
	import Pane from '$lib/components/panes/Pane.svelte';

	export let layoutData: WindowLayout;
	export let selectedTab: Tab | undefined = undefined;
</script>

<main>
	{#if selectedTab}
		{#each selectedTab.panes as pane}
			<Pane
				uuid={pane.uuid}
				name={layoutData.panes.find((p) => p.uuid == pane.uuid)?.name ?? 'Unknown'}
				--s-pane-column-start={pane.start.x}
				--s-pane-column-end={pane.start.x + pane.size.x}
				--s-pane-row-start={pane.start.y}
				--s-pane-row-end={pane.start.y + pane.size.y}
			/>
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
