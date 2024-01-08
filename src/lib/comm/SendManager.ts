import type { Tickable } from '$lib';
import type { Client } from '$lib/Client';
import type { Writable } from 'svelte/store';
import type { RosMapping } from './RosMapping';
import { Topic, type Message } from 'roslib';

export class SendManager implements Tickable {
	private client: Client;
	private lastSendTime: number = 0;

	private sendQueue: { topic: Topic; msg: Message }[] = [];

	constructor(client: Client) {
		this.client = client;
	}

	registerSender<T>(mapping: RosMapping<T>, store: Writable<T | undefined>): void {
		// If we're in preview mode, don't send anything
		if (this.client.config.preview) {
			return;
		}

		// Create topics from the mapping
		Object.keys(mapping).forEach((key) => {
			const { name, type, objToMsg } = mapping[key as keyof T];

			// Make sure that there is a objToMsg function
			if (objToMsg == undefined) {
				throw new Error(`objToMsg not defined for ${name}`);
			}

			// Create the topic
			const topic = new Topic({
				ros: this.client.ros,
				name: name,
				messageType: type
			});

			// Subscribe to the store
			store.subscribe((data) => {
				// If the data is undefined, don't do anything
				if (data == undefined) {
					return;
				}

				// The store can change mutliple times before the next tick,
				// and we only care about the last change, so we nned to clear
				// any messages in the queue for this topic if they exist
				this.sendQueue.splice(
					this.sendQueue.findIndex((item) => item.topic.name == topic.name),
					1
				);

				this.sendQueue.push({
					topic: topic,
					msg: objToMsg(data[key as keyof T])
				});
			});
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tick(delta: number): void {
		console.log(this.sendQueue.length);

		// If we're in preview mode, don't send anything
		if (this.client.config.preview) {
			return;
		}

		// If we haven't waited long enough, don't send anything
		if (this.lastSendTime + 1000 / this.client.config.sendRate > Date.now()) {
			return;
		}

		// Send all messages in the queue
		for (let i = this.sendQueue.length - 1; i >= 0; i--) {
			const { topic, msg } = this.sendQueue[i];

			// Send the message
			topic.publish(msg);

			// Remove the message from the queue
			this.sendQueue.splice(i, 1);
		}

		// Update the last send time
		this.lastSendTime = Date.now();
	}
}
