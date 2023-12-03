import {
	PUBLIC_PREIVEW_CLIENT,
	PUBLIC_ROSBRIDGE_URL,
	PUBLIC_ALLOW_PARTIAL_DATA,
	PUBLIC_AUTO_PRIMARY_GAMEPAD
} from '$env/static/public';
import { Ros } from 'roslib';
import { writable } from 'svelte/store';

/** Settings for the client. */
export type ClientConfig = {
	/** Whether the client should be in preview mode, this disables rosbridge and uses mock data and behavior. */
	preview: boolean;
	/** The URL of the rosbridge server. If the client is in preview mode, this is not used. */
	rosbridgeUrl: string;
	/**
	 * If true, the client will wait for all topics in a client datatype to be received before
	 * loading is considered complete. If false, the datatype will load immediately with the loading data.
	 */
	allowPartialData: boolean;
	/** If true, the most recent gamepad connected will be used as the primary gamepad. */
	autoPrimaryGamepad: boolean;
};

/** The current status of the connection between Client and Rosbridge. */
export enum ClientConnectionStatus {
	/** Disconnected cleanly by the client. The status on init. */
	Disconnected,
	/** Attempting to connect to the rosbridge server. */
	Connecting,
	/** Connected to the rosbridge server. */
	Connected,
	/** An error occurred while connecting to the rosbridge server. */
	Error
}

/** The state of the client. */
export type ClientState = {
	/** Whether publishing is allowed from the client to the rover. */
	publishingAllowed: boolean;
	/** The current connection status. */
	connectionStatus: ClientConnectionStatus;
	/** How often messages are published to the rover. */
	publishingRate: number;
};

/** The config loaded. */
export const clientConfig: ClientConfig = {
	preview: PUBLIC_PREIVEW_CLIENT == 'true',
	rosbridgeUrl: PUBLIC_ROSBRIDGE_URL,
	allowPartialData: PUBLIC_ALLOW_PARTIAL_DATA == 'true',
	autoPrimaryGamepad: PUBLIC_AUTO_PRIMARY_GAMEPAD == 'true'
};

/** The current state of the client. */
export const clientState = writable<ClientState>({
	connectionStatus: ClientConnectionStatus.Disconnected,
	publishingAllowed: true,
	publishingRate: 10
});

/**
 * The ROS client instance.
 *
 * This is null only when previewing the client.
 */
export const ros = clientConfig.preview ? null : new Ros({ url: clientConfig.rosbridgeUrl });

// Setup the ROS client
if (clientConfig.preview) {
	console.warn('|Client| Rover GUI is in preview mode.');
	console.log('|Client| Connecting to rosbridge server...');

	// Set the connection status to connected
	clientState.update((val) => {
		console.log('|Client| Connected to rosbridge server.');

		val.connectionStatus = ClientConnectionStatus.Connected;

		return val;
	});
} else {
	// Set the connection status to connecting
	clientState.update((val) => {
		console.log('|Client| Connecting to rosbridge server...');

		val.connectionStatus = ClientConnectionStatus.Connecting;

		return val;
	});

	// Set up listeners for the ROS client
	ros!.on('connection', () => {
		console.log('|Client| Connected to rosbridge server.');

		clientState.update((val) => {
			val.connectionStatus = ClientConnectionStatus.Connected;

			return val;
		});
	});

	ros!.on('error', (rosError) => {
		console.error('|Client| Error connecting to rosbridge server.', rosError);

		clientState.update((val) => {
			val.connectionStatus = ClientConnectionStatus.Error;

			return val;
		});
	});

	ros!.on('close', () => {
		console.log('|Client| Disconnected from rosbridge server.');

		clientState.update((val) => {
			val.connectionStatus = ClientConnectionStatus.Disconnected;

			return val;
		});
	});
}
