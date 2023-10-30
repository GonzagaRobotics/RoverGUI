import { Ros } from 'roslib';
import { writable } from 'svelte/store';
import { type ClientConfig, type ClientState, ClientConnectionStatus } from './ClientTypes';

export const clientConfig: ClientConfig = {
	preview: true,
	rosbridgeUrl: 'ws://localhost:9090'
};

export const clientState = writable<ClientState>({
	connectionStatus: ClientConnectionStatus.Disconnected
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

// Set up the ROS client
if (clientConfig.preview) {
	console.warn('Rover GUI is in preview mode.');
	console.log('Connecting to rosbridge server...');

	// Set the connection status to connected
	clientState.update((val) => {
		console.log('Connected to rosbridge server.');

		val.connectionStatus = ClientConnectionStatus.Connected;
		return val;
	});
} else {
	// Set the connection status to connecting
	clientState.update((val) => {
		console.log('Connecting to rosbridge server...');

		val.connectionStatus = ClientConnectionStatus.Connecting;
		return val;
	});

	// Set up listeners for the ROS client
	ros!.on('connection', () => {
		console.log('Connected to rosbridge server.');

		clientState.update((val) => {
			val.connectionStatus = ClientConnectionStatus.Connected;
			return val;
		});
	});

	ros!.on('error', (error) => {
		console.error('Error connecting to rosbridge server.', error);

		clientState.update((val) => {
			val.connectionStatus = ClientConnectionStatus.Error;
			return val;
		});
	});

	ros!.on('close', () => {
		console.log('Disconnected from rosbridge server.');

		clientState.update((val) => {
			val.connectionStatus = ClientConnectionStatus.Disconnected;
			return val;
		});
	});
}
