import { get, writable } from 'svelte/store';
import { clientConfig } from '../Client';
import { updateGamepadState, type InputGamepadState, resetGamepadState } from './InputSystem';

/** All gamepads that are connected. However, only the primary gamepad is polled. */
const allGamepads: Gamepad[] = [];

/** The primary gamepad that we are actually acting on input from. */
const primaryGamepad = writable<Gamepad | null>(null);

/**
 * The index of the primary gamepad. We use this so we can allow automatic
 * reconnection of the primary gamepad, so there may be times when the
 * primary gamepad is not in the allGamepads array.
 */
let primaryGamepadIndex = -1;

/** Whether we allow new primary gamepads to be set (not including automatic reconnection). */
export const allowNewPrimaryGamepad = writable(false);

// When a gamepad is connected
window.addEventListener('gamepadconnected', (event) => {
	console.info(`|GamepadManager| Gamepad connected: ${event.gamepad.id}`);

	// Add it to the list of all gamepads
	allGamepads.push(event.gamepad);

	// If autoPrimaryGamepad is enabled, the new gamepad is the primary gamepad
	if (clientConfig.autoPrimaryGamepad) {
		console.log('|GamepadManager| Primary gamepad set automatically.');

		primaryGamepad.set(event.gamepad);
		primaryGamepadIndex = event.gamepad.index;
	} else {
		// We might have lost connection to the primary gamepad, so we can check if it's back
		if (get(primaryGamepad) == null && primaryGamepadIndex == event.gamepad.index) {
			console.log('|GamepadManager', 'Primary gamepad reconnected.');
			primaryGamepad.set(event.gamepad);
		}
	}

	console.debug(`|GamepadManager| There are now ${allGamepads.length} gamepads.`);
});

// When a gamepad is disconnected
window.addEventListener('gamepaddisconnected', (event) => {
	console.info(`|GamepadManager| Gamepad disconnected: ${event.gamepad.id}`);

	// Remove it from the list of all gamepads
	allGamepads.splice(allGamepads.indexOf(event.gamepad), 1);

	// Check if the primary gamepad was disconnected, and clear it if so, but don't reset the index
	if (primaryGamepadIndex == event.gamepad.index) {
		console.warn('|GamepadManager| Primary gamepad disconnected.');
		primaryGamepad.set(null);

		resetGamepadState();
	}

	// If autoPrimaryGamepad is enabled, the first gamepad is the primary gamepad
	if (clientConfig.autoPrimaryGamepad && allGamepads.length > 0) {
		console.log('|GamepadManager| Primary gamepad set automatically.');

		primaryGamepad.set(allGamepads[0]);
		primaryGamepadIndex = allGamepads[0].index;
	}

	console.debug(`|GamepadManager| There are now ${allGamepads.length} gamepads.`);
});

export function gamepadManagerPoll(): void {
	// If there is no primary gamepad, poll for one if we are allowed to
	if (get(allowNewPrimaryGamepad) && clientConfig.autoPrimaryGamepad == false) {
		pollForPrimaryGamepad();
	}

	const primaryGamepadInternal = get(primaryGamepad);

	// If we still don't have a primary gamepad, we can't do anything
	if (primaryGamepadInternal) {
		const newPrimaryGamepadState: InputGamepadState = {
			axes: [...primaryGamepadInternal.axes],
			buttons: [...primaryGamepadInternal.buttons].map((button) => button.value)
		};

		// Tell the input system about the new state
		updateGamepadState(newPrimaryGamepadState);
	}
}

/**
 * Polls all gamepads to determine if any are holding down both RT and LT.
 * The first gamepad to do so is considered the primary gamepad.
 */
function pollForPrimaryGamepad(): void {
	for (const gamepad of allGamepads) {
		if (gamepad.buttons[7].pressed && gamepad.buttons[6].pressed) {
			console.log(`|GamepadManager| Primary gamepad found: ${gamepad.id}`);

			primaryGamepad.set(gamepad);
			primaryGamepadIndex = gamepad.index;
			allowNewPrimaryGamepad.set(false);

			return;
		}
	}
}

/**
 * Resets the primary gamepad to null.
 */
export function resetPrimaryGamepad(): void {
	if (clientConfig.autoPrimaryGamepad) {
		return;
	}

	primaryGamepad.set(null);
	primaryGamepadIndex = -1;

	resetGamepadState();

	console.log('|GamepadManager| Primary gamepad reset.');
}

/** A subscription to the primary gamepad. */
export const getPrimaryGamepad = { subscribe: primaryGamepad.subscribe };
