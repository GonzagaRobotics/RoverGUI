<script lang="ts">
	import HeartPulse from '~icons/mdi/heart-pulse';

	let latency: number | null = null;
</script>

<div class="flex flex-row justify-center items-center gap-1">
	<HeartPulse style="font-size: 2em;" class="animate-heartbeat"></HeartPulse>
	<p>
		{#if latency}
			{latency}ms
		{:else}
			--
		{/if}
	</p>
</div>
