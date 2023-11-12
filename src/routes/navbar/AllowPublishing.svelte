<script lang="ts">
	import Switch from '$lib/components/Switch.svelte';
	import { clientState } from '$lib/data/Client';
	import { log } from '$lib/data/Logger';

	function handleSwitch(e: any) {
		if (e.detail) {
			log('NavbarComponent', 'Publishing allowed');
		} else {
			log('NavbarComponent', 'Publishing not allowed');
		}

		$clientState.publishingAllowed = e.detail;
	}
</script>

<li id="allow-publish">
	<Switch checked={$clientState.publishingAllowed} on:checked={handleSwitch}>
		<span>Publish</span>
	</Switch>
</li>

<style>
</style>
