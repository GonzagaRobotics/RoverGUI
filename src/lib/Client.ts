import type { Disposable } from '$lib';
import { writable, type Writable } from 'svelte/store';
import { PUBLIC_PREVIEW, PUBLIC_ROVER_URL } from '$env/static/public';
import type { ToastStore } from '@skeletonlabs/skeleton';
import ROSLIB from 'roslib';
import { GamepadManager } from './input/GamepadManager';
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

export class Client implements Disposable {
	private _config: ClientConfig;
	private _state: Writable<ClientState>;
	private _ros: ROSLIB.Ros | null = null;
	private _inputSystem: InputSystem;

	private toastStore: ToastStore;

	constructor(toastStore: ToastStore) {
		this.toastStore = toastStore;

		this._config = {
			preview: PUBLIC_PREVIEW.toLowerCase() == 'true',
			roverUrl: PUBLIC_ROVER_URL
		};

		this._state = writable<ClientState>({
			connectionStatus: ClientConnectionStatus.Disconnected,
			dataReductionLevel: DataReductionLevel.None
		});

		if (this._config.preview == false) {
			this._ros = new ROSLIB.Ros({
				url: this._config.roverUrl
			});

			this.setConnectionStatus(ClientConnectionStatus.Connecting);

			// ROS event handlers

			this._ros.on('connection', () => {
				this.setConnectionStatus(ClientConnectionStatus.Connected);
			});

			this._ros.on('error', (e) => {
				this.setConnectionStatus(ClientConnectionStatus.Disconnected);

				console.error('ROS error', e);

				this.toastStore.trigger({
					message: 'There was an error in ROS. Check the console for details.',
					timeout: 3000,
					background: 'variant-filled-error',
					hideDismiss: true
				});
			});

			this._ros.on('close', () => {
				this.setConnectionStatus(ClientConnectionStatus.Disconnected);
			});
		} else {
			this.setConnectionStatus(ClientConnectionStatus.Connected);
		}

		const gamepadManager = new GamepadManager();
		this._inputSystem = new InputSystem(gamepadManager);

		// Start ticking
		window.requestAnimationFrame(this.tick.bind(this));
	}

	tick(): void {
		this._inputSystem.tick(0);
		window.requestAnimationFrame(this.tick.bind(this));
	}

	dispose(): void {
		if (this._config.preview == false) {
			this._ros!.close();
		}

		this._inputSystem.dispose();
	}

	/**
	 * Gets the main ros instance.
	 *
	 * @throws {Error} If the client is in preview mode.
	 */
	get ros(): ROSLIB.Ros {
		if (this._config.preview) {
			throw new Error('Cannot get ROS instance in preview mode');
		}

		return this._ros!;
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
