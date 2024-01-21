import type { Disposable, Tickable } from '$lib';
import { ClientConnectionStatus, type Client } from '$lib/Client';
import { Topic } from 'roslib';
import { get, writable, type Readable } from 'svelte/store';

export class Heartbeat implements Tickable, Disposable {
	private client: Client;
	private heartbeatPubTopic: Topic | undefined;
	private heartbeatSubTopic: Topic | undefined;

	private sendTime = -1;
	private receiveTime = -1;
	private _latency = writable<number | undefined>(undefined);
	private sentSkipWarning = false;
	private failCount = 0;

	constructor(client: Client) {
		this.client = client;

		if (this.client.config.preview) {
			return;
		}

		this.heartbeatPubTopic = new Topic({
			name: '/heartbeat/rover',
			messageType: 'std_msgs/Empty',
			ros: client.ros
		});
		this.heartbeatPubTopic.advertise();

		this.heartbeatSubTopic = new Topic({
			name: '/heartbeat/client',
			messageType: 'std_msgs/Empty',
			ros: client.ros
		});

		this.heartbeatSubTopic.subscribe(() => this.receiveHeartbeat());
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
		// The interval we're checking at is much faster than the timeout, so we need to adjust
		// the sent time to account for that based on the number of fails

		const adjustedSendTime =
			this.sendTime + this.failCount * this.client.sharedConfig.heartbeatInterval * 1000;

		if (Date.now() - adjustedSendTime >= this.client.sharedConfig.heartbeatTimeout * 1000) {
			this.failCount++;
			console.log('timeout ' + this.failCount);

			// See if we've reached the fail limit
			if (this.failCount > this.client.sharedConfig.heartbeatFailLimit) {
				console.log('connection lost');

				this.client.toastStore.trigger({
					message: 'The connection to the server has been lost.',
					timeout: 3000,
					background: 'variant-filled-error',
					hideDismiss: true
				});

				this.client.forceDisconnect();
				return;
			}

			this.client.toastStore.trigger({
				message: 'A heartbeat has timed out. Retrying...',
				timeout: 1500,
				background: 'variant-filled-warning',
				hideDismiss: true
			});
		}

		// Send a heartbeat on the interval
		if (Date.now() - this.sendTime >= this.client.sharedConfig.heartbeatInterval * 1000) {
			// We can't send a heartbeat if we haven't received our last one
			if (this.receiveTime == -1) {
				// If this is the first time we've skipped a heartbeat, warn the user
				if (this.sentSkipWarning == false) {
					this.sentSkipWarning = true;

					console.log('skip warning');

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
		this.heartbeatPubTopic?.unadvertise();
	}

	private sendHeartbeat(): void {
		console.log('Sending heartbeat');

		this.sendTime = Date.now();
		this.receiveTime = -1;

		this.heartbeatPubTopic!.publish({});
	}

	private receiveHeartbeat(): void {
		return;
		console.log('Received heartbeat');
		this.sentSkipWarning = false;
		this.failCount = 0;

		this.receiveTime = Date.now();

		this._latency.set(this.receiveTime - this.sendTime);
	}

	get latency(): Readable<number | undefined> {
		return {
			subscribe: this._latency.subscribe
		};
	}
}
