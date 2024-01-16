<script lang="ts">
	import { Client } from '$lib/Client';
	import { getContext } from 'svelte';
	import HeartPulse from '~icons/mdi/heart-pulse';

	const client = getContext<Client>('client');
	const latency = client.heartbeat.latency;
</script>

<div class="flex flex-row justify-center items-center gap-1">
	<HeartPulse style="font-size: 2em;" class="animate-heartbeat"></HeartPulse>
	<p>
		{#if $latency}
			{$latency} ms
		{:else}
			--
		{/if}
	</p>
</div>
