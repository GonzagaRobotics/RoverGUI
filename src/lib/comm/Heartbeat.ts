import type { Disposable, Tickable } from '$lib';
import { ClientConnectionStatus, type Client } from '$lib/Client';
import { get } from 'svelte/store';
import { ClientRosTopic } from './core/ClientRosTopic';
import type { Message } from 'roslib';

export class Heartbeat implements Tickable, Disposable {
	private client: Client;
	private heartbeatPubTopic: ClientRosTopic;
	private heartbeatSubTopic: ClientRosTopic;

	private sendTime = -1;
	private nextHeartbeatId = 0;
	private receiveTime = -1;
	private timeoutCount = 0;

	constructor(client: Client) {
		this.client = client;

		this.heartbeatPubTopic = new ClientRosTopic(
			'/heartbeat/rover',
			'rcs_interfaces/Heartbeat',
			client.ros
		);
		this.heartbeatPubTopic.advertise();

		this.heartbeatSubTopic = new ClientRosTopic(
			'/heartbeat/client',
			'rcs_interfaces/Heartbeat',
			client.ros
		);
		this.heartbeatSubTopic.subscribe(this.receiveHeartbeat.bind(this));
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tick(): void {
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

		// Send a heartbeat on the interval
		if (Date.now() - this.sendTime >= this.client.config.heartbeatInterval * 1000) {
			this.sendHeartbeat();
		}

		if (this.receiveTime == -1) {
			return;
		}

		const currentTime = Date.now();
		const lastHeartbeatTimeout = this.receiveTime + this.client.config.heartbeatTimeout * 1000;
		const heartbeatTimeoutOffset = this.timeoutCount * this.client.config.heartbeatTimeout * 1000;

		// A timeout occurs when the current time is greater than the last heartbeat time plus the heartbeat timeout.
		if (currentTime > lastHeartbeatTimeout) {
			// Because we check for the heartbeat much more frequently than the heartbeat interval, we might
			// think we have multiple timeouts before we should. So we need to offset the time by the number of
			// timeouts we have had.
			if (currentTime < lastHeartbeatTimeout + heartbeatTimeoutOffset) {
				return;
			}

			this.timeoutCount++;

			// See if we've reached the fail limit
			if (this.timeoutCount >= this.client.config.heartbeatTimeoutLimit) {
				this.client.toastStore.trigger({
					message: 'The connection to the server has been lost.',
					timeout: 3000,
					background: 'variant-filled-error',
					hideDismiss: true
				});

				this.client.ros.disconnect();
				return;
			}

			this.client.toastStore.trigger({
				message: 'A heartbeat has timed out. Count: ' + this.timeoutCount,
				timeout: 1500,
				background: 'variant-filled-warning',
				hideDismiss: true
			});
		}
	}

	dispose(): void {
		this.heartbeatPubTopic.unadvertise();
	}

	private sendHeartbeat(): void {
		this.sendTime = Date.now();

		this.heartbeatPubTopic.publish({
			sent_time: {
				sec: Math.floor(this.sendTime / 1000),
				nanosec: (this.sendTime % 1000) * 1000000
			},
			id: this.nextHeartbeatId,
			source: 'client'
		});

		this.nextHeartbeatId++;
	}

	private receiveHeartbeat(message: Message): void {
		// Because we are publishing to a topic we are also subscribed to, we might receive the heartbeat message we sent.
		// We need to check for this and ignore it. Roslib seems to already do this, but it's better to be safe.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ((message as any).source == 'client') {
			return;
		}

		this.timeoutCount = 0;

		this.receiveTime = Date.now();

		this.client.state.update((state) => {
			state.latency = this.receiveTime - this.sendTime;
			return state;
		});
	}
}
