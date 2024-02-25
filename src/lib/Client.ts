import type { Disposable, Tickable } from '$lib';
import { writable, type Writable } from 'svelte/store';
import {
	PUBLIC_HEARTBEAT_INTERVAL,
	PUBLIC_HEARTBEAT_TIMEOUT,
	PUBLIC_HEARTBEAT_TIMEOUT_LIMIT,
	PUBLIC_PREVIEW,
	PUBLIC_ROVER_URL,
	PUBLIC_SEND_RATE
} from '$env/static/public';
import type { ToastStore } from '@skeletonlabs/skeleton';
import { InputSystem } from './input/InputSystem';
import { SendManager } from './comm/SendManager';
import { Heartbeat } from './comm/Heartbeat';
import { ClientRos } from './comm/core/ClientRos';
import { ClientRosTopic } from './comm/core/ClientRosTopic';

export type ClientConfig = {
	/**
	 * Whether the client is in preview mode.
	 * This fakes rover data and is meant for testing without the rover.
	 */
	preview: boolean;
	/** The URL of the rover. */
	roverUrl: string;
	/** How frequently data is sent to the rover (Hz). */
	sendRate: number;
	/** How long between each heartbeat the client sends to the rover (seconds). */
	heartbeatInterval: number;
	/** How long between heartbeats before it's considered a timeout (seconds). */
	heartbeatTimeout: number;
	/** How many timeouts before the connection is considered lost. */
	heartbeatTimeoutLimit: number;
};

export enum ClientConnectionStatus {
	Disconnected,
	Connecting,
	Connected
}

export enum DataReductionLevel {
	None = 0,
	Low = 1,
	Medium = 2,
	Maximum = 3
}

export type ClientState = {
	/** The client's connection to the rover. */
	connectionStatus: ClientConnectionStatus;
	/** The level of data reduction. */
	dataReductionLevel: number;
	/** Current round-trip latency from client to rover. */
	latency?: number;
};

export class Client implements Disposable, Tickable {
	readonly config: ClientConfig;
	readonly state: Writable<ClientState>;
	readonly ros: ClientRos;
	readonly inputSystem: InputSystem;
	readonly sendManager: SendManager;
	readonly heartbeat: Heartbeat;
	readonly confirmStartTopic: ClientRosTopic;
	readonly confirmStopTopic: ClientRosTopic;
	readonly toastStore: ToastStore;

	constructor(toastStore: ToastStore) {
		this.toastStore = toastStore;

		this.config = {
			preview: PUBLIC_PREVIEW.toLowerCase() == 'true',
			roverUrl: PUBLIC_ROVER_URL,
			sendRate: Number.parseInt(PUBLIC_SEND_RATE),
			heartbeatInterval: Number.parseFloat(PUBLIC_HEARTBEAT_INTERVAL),
			heartbeatTimeout: Number.parseFloat(PUBLIC_HEARTBEAT_TIMEOUT),
			heartbeatTimeoutLimit: Number.parseInt(PUBLIC_HEARTBEAT_TIMEOUT_LIMIT)
		};

		this.state = writable<ClientState>({
			connectionStatus: ClientConnectionStatus.Disconnected,
			dataReductionLevel: DataReductionLevel.None
		});

		this.inputSystem = new InputSystem();

		this.sendManager = new SendManager(this);

		this.ros = new ClientRos(this.config);

		this.heartbeat = new Heartbeat(this);

		this.confirmStartTopic = new ClientRosTopic(
			'/confirm_start',
			'rcs_interfaces/ConfirmStart',
			this.ros
		);
		this.confirmStartTopic.advertise();

		this.confirmStopTopic = new ClientRosTopic(
			'/confirm_stop',
			'rcs_interfaces/ConfirmStop',
			this.ros
		);
		this.confirmStopTopic.advertise();

		this.ros.on('connection', async () => {
			this.sendConfirmStart();

			this.setConnectionStatus(ClientConnectionStatus.Connected);
		});

		this.ros.on('error', (e) => {
			console.error('ROS error', e);

			this.toastStore.trigger({
				message: 'There was an error in ROS. Check the console for details.',
				timeout: 3000,
				background: 'variant-filled-error',
				hideDismiss: true
			});
		});

		this.ros.on('close', () => {
			this.setConnectionStatus(ClientConnectionStatus.Disconnected);
		});

		if (this.config.preview == false) {
			this.setConnectionStatus(ClientConnectionStatus.Connecting);
			this.ros.connect();
		} else {
			this.setConnectionStatus(ClientConnectionStatus.Connected);
		}
	}

	tick(delta: number): void {
		this.heartbeat.tick();
		this.inputSystem.tick();
		this.sendManager.tick(delta);
	}

	dispose(): void {
		this.sendConfirmStop();

		this.ros.disconnect();

		this.inputSystem.dispose();
		this.heartbeat.dispose();
	}

	private sendConfirmStart() {
		this.confirmStartTopic.publish({
			heartbeat_interval: this.config.heartbeatInterval,
			heartbeat_timeout: this.config.heartbeatTimeout,
			heartbeat_timeout_limit: this.config.heartbeatTimeoutLimit
		});
	}

	private sendConfirmStop() {
		this.confirmStopTopic.publish({});
	}

	private setConnectionStatus(status: ClientConnectionStatus): void {
		this.state.update((state) => {
			state.connectionStatus = status;
			return state;
		});

		// Show a toast when the client connects or disconnects
		if (
			status == ClientConnectionStatus.Connected ||
			status == ClientConnectionStatus.Disconnected
		) {
			this.toastStore.trigger({
				message:
					status == ClientConnectionStatus.Connected
						? 'Connected to rover'
						: 'Disconnected from rover',
				timeout: 2000,
				background: 'variant-filled-primary',
				hideDismiss: true
			});
		}
	}
}
