import type { Disposable, Tickable } from '$lib';
import { writable, type Writable } from 'svelte/store';
import {
	PUBLIC_HEARTBEAT_FAIL_LIMIT,
	PUBLIC_HEARTBEAT_INTERVAL,
	PUBLIC_HEARTBEAT_TIMEOUT,
	PUBLIC_PREVIEW,
	PUBLIC_ROVER_URL,
	PUBLIC_SEND_RATE
} from '$env/static/public';
import type { ToastStore } from '@skeletonlabs/skeleton';
import { Ros, Service } from 'roslib';
import { InputSystem } from './input/InputSystem';
import { SendManager } from './comm/SendManager';
import { Heartbeat } from './comm/Heartbeat';

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
};

export type SharedConfig = {
	/** How long between each heartbeat the client sends to the rover (in seconds). */
	heartbeatInterval: number;
	/** How long to wait for a heartbeat response from the rover (in seconds). */
	heartbeatTimeout: number;
	/** How many times to retry a heartbeat before giving up. */
	heartbeatFailLimit: number;
};

export enum ClientConnectionStatus {
	Disconnected,
	Connecting,
	SharingConfigs,
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
};

export class Client implements Disposable, Tickable {
	readonly config: ClientConfig;
	readonly sharedConfig: SharedConfig;
	readonly state: Writable<ClientState>;
	readonly ros: Ros;
	readonly inputSystem: InputSystem;
	readonly sendManager: SendManager;
	readonly heartbeat: Heartbeat;

	readonly toastStore: ToastStore;

	constructor(toastStore: ToastStore) {
		this.toastStore = toastStore;

		this.config = {
			preview: PUBLIC_PREVIEW.toLowerCase() == 'true',
			roverUrl: PUBLIC_ROVER_URL,
			sendRate: Number.parseInt(PUBLIC_SEND_RATE)
		};

		this.sharedConfig = {
			heartbeatInterval: Number.parseFloat(PUBLIC_HEARTBEAT_INTERVAL),
			heartbeatTimeout: Number.parseFloat(PUBLIC_HEARTBEAT_TIMEOUT),
			heartbeatFailLimit: Number.parseInt(PUBLIC_HEARTBEAT_FAIL_LIMIT)
		};

		this.state = writable<ClientState>({
			connectionStatus: ClientConnectionStatus.Disconnected,
			dataReductionLevel: DataReductionLevel.None
		});

		this.inputSystem = new InputSystem();

		this.sendManager = new SendManager(this);

		this.heartbeat = new Heartbeat(this);

		this.ros = new Ros({});

		this.ros.on('connection', async () => {
			// Send the shared config to the rover
			this.setConnectionStatus(ClientConnectionStatus.SharingConfigs);

			const result = await this.sendSharedConfig();

			if (result == false) {
				console.error('Failed to send shared config to rover');
				this.ros.close();
				return;
			}

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
			this.ros.connect(this.config.roverUrl);
		} else {
			this.setConnectionStatus(ClientConnectionStatus.Connected);
		}
	}

	tick(delta: number): void {
		this.heartbeat.tick(delta);
		this.inputSystem.tick(delta);
		this.sendManager.tick(delta);
	}

	dispose(): void {
		if (this.config.preview == false) {
			this.ros.close();
		}

		this.inputSystem.dispose();
		this.heartbeat.dispose();
	}

	forceDisconnect(): void {
		if (this.config.preview == false) {
			this.ros.close();
		}
	}

	private async sendSharedConfig(): Promise<boolean> {
		const service = new Service({
			ros: this.ros,
			name: '/shared_config',
			serviceType: 'rcs_interfaces/SharedConfig'
		});

		return new Promise<boolean>((resolve) => {
			service.callService(this.sharedConfig, (result) => {
				resolve(result);
			});
		});
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
