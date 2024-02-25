<script lang="ts">
	import { Client } from '$lib/Client';
	import { getContext } from 'svelte';
	import HeartPulse from '~icons/mdi/heart-pulse';

	const client = getContext<Client>('client');
	const state = client.state;

	$: latencyHistory = Array<number>();
	$: rollingLatency = 0;

	state.subscribe((value) => {
		if (value.latency) {
			latencyHistory.push(value.latency);
			if (latencyHistory.length > 5) {
				latencyHistory.shift();
			}

			rollingLatency = latencyHistory.reduce((a, b) => a + b, 0);
			rollingLatency /= latencyHistory.length;
		}
	});
</script>

<div class="flex flex-row justify-center items-center gap-1">
	<HeartPulse style="font-size: 2em;" class="animate-heartbeat"></HeartPulse>
	<p>
		{#if latencyHistory.length > 0}
			{rollingLatency.toFixed(0)} ms
		{:else}
			--
		{/if}
	</p>
</div>
