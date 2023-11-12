import { get, writable } from 'svelte/store';
import { info, log, debug, warn } from './Logger';
import { clientConfig } from './Client';

type GamepadState = {
	axes: number[];
	buttons: number[];
};

export type gamepadAxis = 'leftStickX' | 'leftStickY' | 'rightStickX' | 'rightStickY';
export type gamepadButton =
	| 'a'
	| 'b'
	| 'x'
	| 'y'
	| 'leftBumper'
	| 'rightBumper'
	| 'leftTrigger'
	| 'rightTrigger'
	| 'back'
	| 'start'
	| 'leftStick'
	| 'rightStick'
	| 'dpadUp'
	| 'dpadDown'
	| 'dpadLeft'
	| 'dpadRight'
	| 'xbox';

const gamepadAxisMap: { [key: number]: gamepadAxis } = {
	0: 'leftStickX',
	1: 'leftStickY',
	2: 'rightStickX',
	3: 'rightStickY'
};

const gamepadButtonMap: { [key: number]: gamepadButton } = {
	0: 'a',
	1: 'b',
	2: 'x',
	3: 'y',
	4: 'leftBumper',
	5: 'rightBumper',
	6: 'leftTrigger',
	7: 'rightTrigger',
	8: 'back',
	9: 'start',
	10: 'leftStick',
	11: 'rightStick',
	12: 'dpadUp',
	13: 'dpadDown',
	14: 'dpadLeft',
	15: 'dpadRight',
	16: 'xbox'
};

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

/** How often the gamepad is polled in ms. */
const pollInterval = 20;

const primaryGamepadLastState: GamepadState = {
	axes: Array(4).fill(0),
	buttons: Array(17).fill(0)
};

const primaryGamepadAxisEvents: { axis: number; callback: (val: number) => void }[] = [];
const primaryGamepadButtonEvents: { button: number; callback: (val: number) => void }[] = [];

// When a gamepad is connected
window.addEventListener('gamepadconnected', (event) => {
	info('GamepadManager', `Gamepad connected: ${event.gamepad.id}`);

	// Add it to the list of all gamepads
	allGamepads.push(event.gamepad);

	// If autoPrimaryGamepad is enabled, the new gamepad is the primary gamepad
	if (clientConfig.autoPrimaryGamepad) {
		log('GamepadManager', 'Primary gamepad set automatically.');

		primaryGamepad.set(event.gamepad);
		primaryGamepadIndex = event.gamepad.index;
	} else {
		// We might have lost connection to the primary gamepad, so we can check if it's back
		if (get(primaryGamepad) == null && primaryGamepadIndex == event.gamepad.index) {
			log('GamepadManager', 'Primary gamepad reconnected.');
			primaryGamepad.set(event.gamepad);
		}
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
		primaryGamepad.set(null);
	}

	// If autoPrimaryGamepad is enabled, the first gamepad is the primary gamepad
	if (clientConfig.autoPrimaryGamepad && allGamepads.length > 0) {
		log('GamepadManager', 'Primary gamepad set automatically.');

		primaryGamepad.set(allGamepads[0]);
		primaryGamepadIndex = allGamepads[0].index;
	}

	debug('GamepadManager', `There are now ${allGamepads.length} gamepads.`);
});

// Poll for events every 20ms
window.setInterval(() => {
	poll();
}, pollInterval);

/**
 * Polls the gamepad for updates, triggering events as necessary.
 */
function poll(): void {
	// If there is no primary gamepad, poll for one if we are allowed to
	if (get(allowNewPrimaryGamepad) && clientConfig.autoPrimaryGamepad == false) {
		pollForPrimaryGamepad();
	}

	const primaryGamepadInternal = get(primaryGamepad);

	// If we still don't have a primary gamepad, we can't do anything
	if (primaryGamepadInternal == null) {
		return;
	}

	// Check for axis events
	for (const event of primaryGamepadAxisEvents) {
		const axis = primaryGamepadInternal.axes[event.axis];

		if (axis != primaryGamepadLastState.axes[event.axis]) {
			event.callback(axis);
		}
	}

	// Check for button events
	for (const event of primaryGamepadButtonEvents) {
		const button = primaryGamepadInternal.buttons[event.button].value;

		if (button != primaryGamepadLastState.buttons[event.button]) {
			event.callback(button);
		}
	}

	// Update the last state
	primaryGamepadLastState.axes = [...primaryGamepadInternal.axes];
	primaryGamepadLastState.buttons = [...primaryGamepadInternal.buttons].map(
		(button) => button.value
	);
}

/**
 * Polls all gamepads to determine if any are holding down both RT and LT.
 * The first gamepad to do so is considered the primary gamepad.
 */
function pollForPrimaryGamepad(): void {
	for (const gamepad of allGamepads) {
		if (gamepad.buttons[7].pressed && gamepad.buttons[6].pressed) {
			log('GamepadManager', `Primary gamepad found: ${gamepad.id}`);

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

	log('GamepadManager', 'Primary gamepad reset.');
}

/** A subscription to the primary gamepad. */
export const getPrimaryGamepad = { subscribe: primaryGamepad.subscribe };

export function bindAxis(axis: gamepadAxis, callback: (val: number) => void): void {
	const index = Object.values(gamepadAxisMap).indexOf(axis);

	primaryGamepadAxisEvents.push({ axis: index, callback });
}

export function bindButton(button: gamepadButton, callback: (val: number) => void): void {
	const index = Object.values(gamepadButtonMap).indexOf(button);

	primaryGamepadButtonEvents.push({ button: index, callback });
}
