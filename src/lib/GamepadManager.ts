import { get, writable } from 'svelte/store';
import { info, log, debug, warn } from './Logger';

/** All gamepads that we can use. */
const allGamepads: Gamepad[] = [];
/** The primary gamepad that we are actually acting on input from. */
let primaryGamepadInternal: Gamepad | null = null;
/**
 * The index of the primary gamepad. We use this so we can allow automatic
 * reconnection of the primary gamepad, so there may be times when the
 * primary gamepad is not in the allGamepads array.
 */
let primaryGamepadIndex = -1;

let disposed = false;

const primaryGamepadStore = writable<Gamepad | null>(primaryGamepadInternal);
/** Whether we allow new primary gamepads to be set (not including automatic reconnection). */
export const allowNewPrimaryGamepad = writable<boolean>(false);

// When a gamepad is connected
window.addEventListener('gamepadconnected', (event) => {
	info('GamepadManager', `Gamepad connected: ${event.gamepad.id}`);

	// Add it to the list of all gamepads
	allGamepads.push(event.gamepad);

	// We might have lost connection to the primary gamepad, so we can check if it's back
	if (primaryGamepadInternal == null && primaryGamepadIndex == event.gamepad.index) {
		log('GamepadManager', 'Primary gamepad reconnected.');
		primaryGamepadInternal = event.gamepad;
		primaryGamepadStore.set(primaryGamepadInternal);
	}

	debug('GamepadManager', `There are now ${allGamepads.length} gamepads.`);
});

// When a gamepad is disconnected
window.addEventListener('gamepaddisconnected', (event) => {
	info('GamepadManager', `Gamepad disconnected: ${event.gamepad.id}`);

	// Remove it from the list of all gamepads
	allGamepads.splice(allGamepads.indexOf(event.gamepad), 1);

	// Check if the primary gamepad was disconnected, and clear it if so, but don't reset the index
	if (primaryGamepadIndex == event.gamepad.index) {
		warn('GamepadManager', 'Primary gamepad disconnected.');
		primaryGamepadInternal = null;
		primaryGamepadStore.set(primaryGamepadInternal);
	}

	debug('GamepadManager', `There are now ${allGamepads.length} gamepads.`);
});

/** The id of the interval used for polling so we can later clear it. */
const pollIntervalId = window.setInterval(() => {
	poll();
}, 20);

/**
 * Polls the gamepad for updates, triggering events as necessary.
 */
function poll(): void {
	// If there is no primary gamepad, poll for one if we are allowed to
	if (get(allowNewPrimaryGamepad)) {
		pollForPrimaryGamepad();
	}

	// If we still don't have a primary gamepad, we can't do anything
	if (primaryGamepadInternal == null) {
		return;
	}

	if (primaryGamepadInternal.buttons[0].pressed) {
		log('GamepadManager', 'A button pressed.');
	}
}

/**
 * Polls all gamepads to determine if any are holding down both RT and LT.
 * The first gamepad to do so is considered the primary gamepad.
 */
function pollForPrimaryGamepad(): void {
	for (const gamepad of allGamepads) {
		if (gamepad.buttons[7].pressed && gamepad.buttons[6].pressed) {
			log('GamepadManager', `Primary gamepad found: ${gamepad.id}`);

			primaryGamepadInternal = gamepad;
			primaryGamepadIndex = gamepad.index;

			primaryGamepadStore.set(primaryGamepadInternal);
			allowNewPrimaryGamepad.set(false);

			return;
		}
	}
}

/**
 * Disposes of the gamepad manager and stops polling for updates.
 */
export function disposeGamepadManager(): void {
	if (disposed) {
		warn(
			'GamepadManager',
			'Trying to dispose of gamepad manager, but it has already been disposed of.'
		);
		return;
	}

	info('GamepadManager', 'Disposing of gamepad manager.');
	window.clearInterval(pollIntervalId);
	primaryGamepadStore.set(null);
	disposed = true;
}

/**
 * Clears the primary gamepad, allowing a new one to be set.
 */
export function clearPrimaryGamepad(): void {
	primaryGamepadInternal = null;
	primaryGamepadIndex = -1;
	primaryGamepadStore.set(primaryGamepadInternal);

	log('GamepadManager', 'Primary gamepad cleared.');
}

export const primaryGamepad = { subscribe: primaryGamepadStore.subscribe };
