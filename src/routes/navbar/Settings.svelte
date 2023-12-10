<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('open-settings');
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li id="open-settings" on:click={handleClick}>
	<Icon
		icon="settings"
		--s-size={'2rem'}
		--s-hover-color={'var(--color-accent)'}
		--s-hover-scale={1.1}
	/>
</li>

<style>
	li {
		cursor: pointer;
	}
</style>
