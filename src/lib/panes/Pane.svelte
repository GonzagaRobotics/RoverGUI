<script lang="ts">
	export let start: { x: number; y: number };
	export let end: { x: number; y: number };
	export let name: string;
	export let loading: boolean = false;
	export let containerClasses: string = '';

	$: _loadingClasses = loading ? 'placeholder animate-pulse rounded-none' : '';
</script>

<div
	style="grid-column: {start.x} / {end.x}; grid-row: {start.y} / {end.y};"
	class="flex flex-col items-center border-2 rounded-container-token border-secondary-300"
>
	<h2 class="w-full h4 text-center">{name}</h2>
	<div class="w-full flex-grow {containerClasses} {_loadingClasses}">
		{#if loading == false}
			<slot name="main" />
		{/if}
	</div>
</div>
