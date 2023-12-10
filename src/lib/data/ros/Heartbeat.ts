import { Message, Topic } from 'roslib';
import { clientConfig, ros } from '../Client';
import { writable } from 'svelte/store';

let heartbeatPub: Topic | null;
let heartbeatSub: Topic | null;

let heartbeatIntervalId: NodeJS.Timeout | null;
let heartneatTimeoutId: NodeJS.Timeout | null;
let heartbeatSendTime: number | null;

export const lastRoundTripTime = writable<number | null>(null);

/**
 * Starts the heartbeat.
 *
 * If the heartbeat is already running or the client is in preview mode, this function does nothing.
 */
export function startHeartbeat() {
	if (heartbeatIntervalId || clientConfig.preview) return;

	if (!heartbeatPub || !heartbeatSub) {
		heartbeatPub = new Topic({
			ros: ros!,
			name: '/rover_gui/heartbeat/pub',
			messageType: 'rcs_interfaces/Heartbeat'
		});

		heartbeatSub = new Topic({
			ros: ros!,
			name: '/rover_gui/heartbeat/sub',
			messageType: 'rcs_interfaces/Heartbeat'
		});
	}

	heartbeatIntervalId = setInterval(sendHeartbeat, clientConfig.heartbeatInterval);

	heartbeatSub!.subscribe(receiveHeartbeat);
}

/**
 * Stops the heartbeat.
 *
 * If the heartbeat is already running or the client is in preview mode, this function does nothing.
 */
export function stopHeartbeat() {
	if (!heartbeatIntervalId || clientConfig.preview) return;

	clearInterval(heartbeatIntervalId);
	if (heartneatTimeoutId) clearTimeout(heartneatTimeoutId);
	heartbeatSub!.unsubscribe(receiveHeartbeat);

	heartbeatIntervalId = null;
	heartneatTimeoutId = null;
}

function sendHeartbeat() {
	// If we have still not received our heartbeat back, we need to wait
	// until we receive it before sending another one
	if (heartbeatSendTime != null) {
		console.warn('|Client| Heartbeat not received yet. Waiting to send another.');
		return;
	}

	heartbeatSendTime = Date.now();

	// Convert the heartbeat send time to a ROS timestamp (int32 sec, uint 32 nanosec from 0 to 1million)
	const rosTimestamp = {
		sec: Math.floor(heartbeatSendTime / 1000),
		nsec: Math.floor((heartbeatSendTime % 1000) * 1000000)
	};

	heartbeatPub!.publish({
		header: { stamp: rosTimestamp, frame_id: '' },
		entity_name: 'rover_gui'
	});

	// If there was a previous heartbeat timeout, clear it
	if (heartneatTimeoutId) clearTimeout(heartneatTimeoutId);

	heartneatTimeoutId = setTimeout(() => {
		console.error('|Client| Heartbeat timeout. Rover GUI may be disconnected.');
	}, clientConfig.hearbeatTimeout);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function receiveHeartbeat(message: Message) {
	// Calculate the round trip time
	const roundTripTime = Date.now() - heartbeatSendTime!;

	lastRoundTripTime.set(roundTripTime);

	console.log(`|Client| Received heartbeat. Round trip time: ${roundTripTime}ms`);

	// Clear the previous heartbeat timeout
	if (heartneatTimeoutId) clearTimeout(heartneatTimeoutId);

	// Clear the heartbeat send time
	heartbeatSendTime = null;
}
