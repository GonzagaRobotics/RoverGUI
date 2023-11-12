<script lang="ts">
	import { ClientConnectionStatus } from '$lib/data/Client';
	import { clientState } from '$lib/data/Client';
	import Icon from '$lib/components/Icon.svelte';
</script>

<li
	id="connection-status"
	class:error={$clientState.connectionStatus == ClientConnectionStatus.Error}
	class:connecting={$clientState.connectionStatus == ClientConnectionStatus.Connecting}
	class:connected={$clientState.connectionStatus == ClientConnectionStatus.Connected}
>
	<Icon icon="wifi" --s-size={'2.5rem'} />
</li>

<style>
	.connecting {
		color: var(--color-status-warning);
	}

	.connected {
		color: var(--color-status-ok);
	}

	.error {
		color: var(--color-status-error);
	}
</style>
