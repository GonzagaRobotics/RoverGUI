import type { Disposable, Tickable } from '$lib';
import { ClientConnectionStatus, type Client } from '$lib/Client';
import { Topic } from 'roslib';
import { get, writable, type Readable } from 'svelte/store';

export class Heartbeat implements Tickable, Disposable {
	private client: Client;
	private heartbeatTopic: Topic | undefined;

	private sendTime = -1;
	private receiveTime = -1;
	private _latency = writable<number | undefined>(undefined);
	private sentSkipWarning = false;
	private retryCount = 0;

	constructor(client: Client) {
		this.client = client;

		if (this.client.config.preview) {
			return;
		}

		this.heartbeatTopic = new Topic({
			name: '/heartbeat',
			messageType: 'std_msgs/Empty',
			ros: client.ros
		});
		this.heartbeatTopic.advertise();

		this.heartbeatTopic.subscribe(this.receiveHeartbeat);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tick(delta: number): void {
		// Nothing happens if we're in preview mode
		if (this.client.config.preview) {
			return;
		}

		// We don't send heartbeats if we're not connected
		if (get(this.client.state).connectionStatus != ClientConnectionStatus.Connected) {
			return;
		}

		// Publish a heartbeat the first time we tick after connecting
		if (this.sendTime == -1) {
			this.sendHeartbeat();
			return;
		}

		// See if we've timed out
		if (Date.now() - this.sendTime >= this.client.sharedConfig.heartbeatTimeout * 1000) {
			// See if we've reached the fail limit
			if (this.retryCount == this.client.sharedConfig.heartbeatFailLimit - 1) {
				this.client.toastStore.trigger({
					message: 'The connection to the server has been lost.',
					timeout: 3000,
					background: 'variant-filled-error',
					hideDismiss: true
				});

				this.client.forceDisconnect();
				return;
			}

			// If this is the first time we've timed out, warn the user
			if (this.retryCount == 0) {
				this.client.toastStore.trigger({
					message: 'A heartbeat has timed out. Retrying...',
					timeout: 1500,
					background: 'variant-filled-warning',
					hideDismiss: true
				});
			}

			this.retryCount++;
		}

		// Send a heartbeat on the interval
		if (Date.now() - this.sendTime >= this.client.sharedConfig.heartbeatInterval * 1000) {
			// We can't send a heartbeat if we haven't received our last one
			if (this.receiveTime == -1) {
				// If this is the first time we've skipped a heartbeat, warn the user
				if (this.sentSkipWarning == false) {
					this.sentSkipWarning = true;

					this.client.toastStore.trigger({
						message:
							'The sending of a heartbeat has been skipped. The connection may become unstable.',
						timeout: 1500,
						background: 'variant-filled-warning',
						hideDismiss: true
					});
				}

				return;
			}

			this.sendHeartbeat();
		}
	}

	dispose(): void {
		this.heartbeatTopic?.unadvertise();
	}

	private sendHeartbeat(): void {
		this.sendTime = Date.now();
		this.receiveTime = -1;

		this.heartbeatTopic!.publish({});
	}

	private receiveHeartbeat(): void {
		this.sentSkipWarning = false;
		this.retryCount = 0;

		this.receiveTime = Date.now();

		this._latency.set(this.receiveTime - this.sendTime);
	}

	get latency(): Readable<number | undefined> {
		return {
			subscribe: this._latency.subscribe
		};
	}
}
