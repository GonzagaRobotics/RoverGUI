<script lang="ts">
	import { logs, type LogLevel, type Log } from '$lib/Logger';

	const debugMarker = String.fromCodePoint(0x1f50d);
	const infoMarker = String.fromCodePoint(0x2139) + String.fromCodePoint(0xfe0f);
	const warnMarker = String.fromCodePoint(0x26a0) + String.fromCodePoint(0xfe0f);
	const errorMarker = String.fromCodePoint(0x274c);

	let visibleLogLevels: LogLevel[] = [];

	function formatLogMessage(log: Log): string {
		let message = '';

		switch (log.severity) {
			case 'debug':
				// Magnifying glass
				message += debugMarker + ' ';
				break;
			case 'info':
				// Information mark
				message += infoMarker + ' ';
				break;
			case 'warn':
				// Warning sign
				message += warnMarker + ' ';
				break;
			case 'error':
				// Cross mark
				message += errorMarker + ' ';
				break;
		}

		message += `[${log.tag}] ${log.message}`;

		if (log.args.length > 0) {
			message += ` (${log.args.length} args)`;
		}

		return message;
	}
</script>

<div>
	{#each $logs as log}
		<code class={log.severity}>
			{formatLogMessage(log)} <br />
		</code>
	{/each}
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		row-gap: 0.5rem;

		max-height: 100%;
		overflow-y: auto;
	}

	code {
		display: inline-block;

		line-height: 110%;
		margin-left: 0.25rem;
	}

	code.warn {
		color: var(--color-status-warning);
	}

	code.error {
		color: var(--color-status-error);
	}
</style>
