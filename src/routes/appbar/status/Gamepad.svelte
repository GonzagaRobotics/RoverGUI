<script lang="ts">
	import Controller from '~icons/mdi/microsoft-xbox-controller';
	import NoController from '~icons/mdi/microsoft-xbox-controller-off';

	let foo = false;
</script>

<div style="font-size: 2em;">
	{#if foo}
		<Controller></Controller>
	{:else}
		<NoController></NoController>
	{/if}
</div>
