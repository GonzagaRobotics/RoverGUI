import type { Disposable, Tickable } from '$lib';
import { writable, type Writable } from 'svelte/store';
import { PUBLIC_PREVIEW, PUBLIC_ROVER_URL } from '$env/static/public';
import type { ToastStore } from '@skeletonlabs/skeleton';
import { Ros } from 'roslib';
import { InputSystem } from './input/InputSystem';

export type ClientConfig = {
	/**
	 * Whether the client is in preview mode.
	 * This fakes rover data and is meant for testing without the rover.
	 */
	preview: boolean;
	/** The URL of the rover. */
	roverUrl: string;
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
};

export class Client implements Disposable, Tickable {
	private _config: ClientConfig;
	private _state: Writable<ClientState>;
	private _ros: Ros;
	private _inputSystem: InputSystem;
	private _toastStore: ToastStore;

	constructor(toastStore: ToastStore) {
		this._toastStore = toastStore;

		this._config = {
			preview: PUBLIC_PREVIEW.toLowerCase() == 'true',
			roverUrl: PUBLIC_ROVER_URL
		};

		this._state = writable<ClientState>({
			connectionStatus: ClientConnectionStatus.Disconnected,
			dataReductionLevel: DataReductionLevel.None
		});

		this._inputSystem = new InputSystem();

		this._ros = new Ros({});

		this._ros.on('connection', () => {
			this.setConnectionStatus(ClientConnectionStatus.Connected);
		});

		this._ros.on('error', (e) => {
			console.error('ROS error', e);

			this._toastStore.trigger({
				message: 'There was an error in ROS. Check the console for details.',
				timeout: 3000,
				background: 'variant-filled-error',
				hideDismiss: true
			});
		});

		this._ros.on('close', () => {
			this.setConnectionStatus(ClientConnectionStatus.Disconnected);
		});

		if (this._config.preview == false) {
			this.setConnectionStatus(ClientConnectionStatus.Connecting);
		} else {
			this.setConnectionStatus(ClientConnectionStatus.Connected);
		}
	}

	tick(delta: number): void {
		this._inputSystem.tick(delta);
	}

	dispose(): void {
		if (this._config.preview == false) {
			this._ros.close();
		}

		this._inputSystem.dispose();
	}

	/**
	 * Gets the main ros instance.
	 */
	get ros(): ROSLIB.Ros {
		return this._ros;
	}

	/**
	 * Gets the client's configuration.
	 */
	get config(): ClientConfig {
		return this._config;
	}

	/**
	 * Gets the client's state.
	 */
	get state(): Writable<ClientState> {
		return this._state;
	}

	/**
	 * Gets the client's input system.
	 */
	get inputSystem(): InputSystem {
		return this._inputSystem;
	}

	private setConnectionStatus(status: ClientConnectionStatus): void {
		this._state.update((state) => {
			state.connectionStatus = status;
			return state;
		});

		// Show a toast when the client connects or disconnects
		if (status == ClientConnectionStatus.Connecting) return;

		this._toastStore.trigger({
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
