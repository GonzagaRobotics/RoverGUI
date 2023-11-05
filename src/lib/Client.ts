import { PUBLIC_PREIVEW_CLIENT, PUBLIC_ROSBRIDGE_URL } from '$env/static/public';
import { Ros } from 'roslib';
import { writable } from 'svelte/store';
import { log, warn, error } from './Logger';

/** Settings for the client. */
export type ClientConfig = {
	/** Whether to preview the client, which won't cause attempt any connection to the rover. */
	preview: boolean;
	/** The URL of the rosbridge server. */
	rosbridgeUrl: string;
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
};

/** The config loaded. */
export const clientConfig: ClientConfig = {
	preview: PUBLIC_PREIVEW_CLIENT == 'true',
	rosbridgeUrl: PUBLIC_ROSBRIDGE_URL
};

/** The current state of the client. */
export const clientState = writable<ClientState>({
	connectionStatus: ClientConnectionStatus.Disconnected,
	publishingAllowed: true
});

/**
 * The ROS client instance.
 *
 * This is null only when previewing the client.
 */
export const ros = clientConfig.preview
	? null
	: new Ros({
			url: clientConfig.rosbridgeUrl
	  });

// Setup the ROS client
if (clientConfig.preview) {
	warn('Client', 'Rover GUI is in preview mode.');
	log('Client', 'Connecting to rosbridge server...');

	// Set the connection status to connected
	clientState.update((val) => {
		log('Client', 'Connected to rosbridge server.');

		val.connectionStatus = ClientConnectionStatus.Connected;

		return val;
	});
} else {
	// Set the connection status to connecting
	clientState.update((val) => {
		log('Client', 'Connecting to rosbridge server...');

		val.connectionStatus = ClientConnectionStatus.Connecting;

		return val;
	});

	// Set up listeners for the ROS client
	ros!.on('connection', () => {
		log('Client', 'Connected to rosbridge server.');

		clientState.update((val) => {
			val.connectionStatus = ClientConnectionStatus.Connected;

			return val;
		});
	});

	ros!.on('error', (rosError) => {
		error('Client', 'Error connecting to rosbridge server.', rosError);

		clientState.update((val) => {
			val.connectionStatus = ClientConnectionStatus.Error;

			return val;
		});
	});

	ros!.on('close', () => {
		log('Client', 'Disconnected from rosbridge server.');

		clientState.update((val) => {
			val.connectionStatus = ClientConnectionStatus.Disconnected;

			return val;
		});
	});
}
