import { writable } from 'svelte/store';

/** Severity of log message. */
export type LogLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';

/** A log message. */
export type Log = {
	severity: LogLevel;
	tag: string;
	message: string;
	args: unknown[];
};

const logsInternal = writable<Log[]>([]);

export function debug(tag: string, message: string, ...args: unknown[]) {
	addLog({ severity: 'debug', tag, message, args });

	console.debug(formatLogMessage(tag, message), ...args);
}

export function info(tag: string, message: string, ...args: unknown[]) {
	addLog({ severity: 'info', tag, message, args });

	console.info(formatLogMessage(tag, message), ...args);
}

export function log(tag: string, message: string, ...args: unknown[]) {
	addLog({ severity: 'log', tag, message, args });

	console.log(formatLogMessage(tag, message), ...args);
}

export function warn(tag: string, message: string, ...args: unknown[]) {
	addLog({ severity: 'warn', tag, message, args });

	console.warn(formatLogMessage(tag, message), ...args);
}

export function error(tag: string, message: string, ...args: unknown[]) {
	addLog({ severity: 'error', tag, message, args });

	console.error(formatLogMessage(tag, message), ...args);
}

function addLog(log: Log) {
	logsInternal.update((logs) => {
		return [...logs, log];
	});
}

function formatLogMessage(tag: string, message: string) {
	return `[${tag}] ${message}`;
}

export const logs = {
	subscribe: logsInternal.subscribe
};
