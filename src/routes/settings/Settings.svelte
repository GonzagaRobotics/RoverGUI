<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import PrimaryGamepad from './PrimaryGamepad.svelte';

	export let showSettings: Boolean;
</script>

<Modal bind:showModal={showSettings} size="full">
	<h2 slot="header">Settings</h2>

	<ul>
		<PrimaryGamepad />
	</ul>
</Modal>
