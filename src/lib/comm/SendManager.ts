import type { Tickable } from '$lib';
import type { Client } from '$lib/Client';
import type { Writable } from 'svelte/store';
import type { RosMapping } from './RosMapping';
import { type Message } from 'roslib';
import { ClientRosTopic } from './core/ClientRosTopic';

export class SendManager implements Tickable {
	private client: Client;
	private lastSendTime: number = 0;

	private sendQueue: { topic: ClientRosTopic; msg: Message }[] = [];

	constructor(client: Client) {
		this.client = client;
	}

	registerSender<T>(mapping: RosMapping<T>, store: Writable<T | undefined>): void {
		// Create topics from the mapping
		Object.keys(mapping).forEach((key) => {
			const { name, type, objToMsg } = mapping[key as keyof T];

			// Make sure that there is a objToMsg function
			if (objToMsg == undefined) {
				throw new Error(`objToMsg not defined for ${name}`);
			}

			// Create the topic
			const topic = new ClientRosTopic(name, type, this.client.ros);

			// Subscribe to the store
			store.subscribe((data) => {
				// If the data is undefined, don't do anything
				if (data == undefined) {
					return;
				}

				// Replace the message in the queue if it exists
				const existingIndex = this.sendQueue.findIndex((item) => item.topic.name == topic.name);

				if (existingIndex != -1) {
					this.sendQueue[existingIndex].msg = objToMsg(data[key as keyof T]);

					return;
				}

				this.sendQueue.push({
					topic: topic,
					msg: objToMsg(data[key as keyof T])
				});
			});
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tick(delta: number): void {
		// If we haven't waited long enough, don't send anything
		if (this.lastSendTime + 1000 / this.client.config.sendRate > Date.now()) {
			return;
		}

		while (this.sendQueue.length > 0) {
			const { topic, msg } = this.sendQueue.pop()!;

			topic.publish(msg);
		}

		// Update the last send time
		this.lastSendTime = Date.now();
	}
}
