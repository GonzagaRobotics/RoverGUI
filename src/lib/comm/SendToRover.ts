import type { Client } from '$lib/Client';
import { writable, type Writable } from 'svelte/store';
import type { RosMapping } from './RosMapping';

export function sendToRover<T>(client: Client, mapping: RosMapping<T>): Writable<T | undefined> {
	const store = writable<T | undefined>(undefined);

	client.sendManager.registerSender(mapping, store);

	return store;
}
