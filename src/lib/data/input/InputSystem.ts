import { get, writable } from 'svelte/store';
import type { InputAxisHandle, InputButtonHandle } from './InputHandle';
import { debug, info } from '../Logger';

/** Axis available for input. */
export type InputAxis =
	| 'leftX'
	| 'leftY'
	| 'rightX'
	| 'rightY'
	| 'leftTrigger'
	| 'rightTrigger'
	| 'dpadX'
	| 'dpadY';

/** Buttons available for input. */
export type InputButton =
	| 'a'
	| 'b'
	| 'x'
	| 'y'
	| 'leftBumper'
	| 'rightBumper'
	| 'leftTrigger'
	| 'rightTrigger'
	| 'select'
	| 'start'
	| 'leftStick'
	| 'rightStick'
	| 'xbox'
	| 'dpadUp'
	| 'dpadDown'
	| 'dpadLeft'
	| 'dpadRight';

export type InputGamepadState = {
	axes: number[];
	buttons: number[];
};

const TAG = 'InputSystem';
const DEFAULT_GAMEPAD_STATE: InputGamepadState = {
	axes: Array(4).fill(0),
	buttons: Array(17).fill(0)
};

const _currentScope = writable('global');
const registeredScopes = new Set<string>(['global']);

let lastInputState = DEFAULT_GAMEPAD_STATE;
let currentInputState = DEFAULT_GAMEPAD_STATE;

const axisHandles: Map<number, InputAxisHandle> = new Map();
const lastEventAxisValues: Map<number, number> = new Map();
let nextAxisHandleId = 0;

const buttonHandles: Map<number, InputButtonHandle> = new Map();
let nextButtonHandleId = 0;

function inputAxisToId(axis: InputAxis): number {
	switch (axis) {
		case 'leftX':
			return 0;
		case 'leftY':
			return 1;
		case 'rightX':
			return 2;
		case 'rightY':
			return 3;
		default:
			// Since Dpad and triggers are not axis internally, we can't use this function for them
			throw new Error(`Invalid axis for this function: ${axis}`);
	}
}

function inputButtonToId(button: InputButton): number {
	switch (button) {
		case 'a':
			return 0;
		case 'b':
			return 1;
		case 'x':
			return 2;
		case 'y':
			return 3;
		case 'leftBumper':
			return 4;
		case 'rightBumper':
			return 5;
		case 'leftTrigger':
			return 6;
		case 'rightTrigger':
			return 7;
		case 'select':
			return 8;
		case 'start':
			return 9;
		case 'leftStick':
			return 10;
		case 'rightStick':
			return 11;
		case 'dpadUp':
			return 12;
		case 'dpadDown':
			return 13;
		case 'dpadLeft':
			return 14;
		case 'dpadRight':
			return 15;
		case 'xbox':
			return 16;
		default:
			throw new Error(`Invalid button for this function: ${button}`);
	}
}

function processAxisValue(value: number, handle: InputAxisHandle): number {
	let newValue = value;

	// Invert the value if needed
	if (handle.inverted ?? false) newValue = -newValue;

	// Apply the deadzone
	if (Math.abs(newValue) < (handle.deadzone ?? 0.05)) newValue = 0;

	return newValue;
}

function poll() {
	// Button input
	for (const handle of buttonHandles.values()) {
		// Before we do anything, check if the scope is correct or global
		if (handle.scope != undefined && handle.scope == get(_currentScope)) continue;

		const prevValue = lastInputState.buttons[inputButtonToId(handle.button)];
		const value = currentInputState.buttons[inputButtonToId(handle.button)];

		if (value > 0.5 && prevValue <= 0.5) {
			handle.callback(true);
		} else if (value <= 0.5 && prevValue > 0.5) {
			handle.callback(false);
		}
	}

	// Axis input
	for (const [id, handle] of axisHandles.entries()) {
		// Before we do anything, check if the scope is correct or global
		if (handle.scope != undefined && handle.scope == get(_currentScope)) continue;

		const prevValue = lastInputState.axes[inputAxisToId(handle.axis)];
		const value = currentInputState.axes[inputAxisToId(handle.axis)];

		// We need to process the value differently depending on the handle options
		const processedValue = processAxisValue(value, handle);

		// Check if the value has changed enough to fire an event from when the event was last fired
		if (Math.abs(processedValue - lastEventAxisValues.get(id)!) >= (handle.eventDelta ?? 0.05)) {
			handle.callback(processedValue);
			lastEventAxisValues.set(id, processedValue);
		}
	}

	// Update the last state
	lastInputState = currentInputState;
}

/**
 * Register a new scope.
 *
 * @param scope The scope to register.
 * @returns True if the scope was registered, false if it already exists.
 */
export function registerScope(scope: string): boolean {
	if (registeredScopes.has(scope)) return false;

	registeredScopes.add(scope);
	debug(TAG, `Registered new input scope: ${scope}`);

	return true;
}

/**
 * Set the current scope.
 *
 * @param scope The scope to set.
 * @returns True if the scope was set, false if it doesn't exist.
 */
export function setScope(scope: string): boolean {
	if (!registeredScopes.has(scope)) return false;

	_currentScope.set(scope);
	info(TAG, `Set current input scope: ${scope}`);

	return true;
}

/**
 * Adds a new handle for an axis.
 *
 * @param options The options for the handle.
 * @returns The ID of the handle.
 */
export function addAxisHandle(options: InputAxisHandle): number {
	axisHandles.set(nextAxisHandleId, options);

	debug(TAG, `Added new axis handle: ${options.axis}`);

	nextAxisHandleId++;

	return nextAxisHandleId - 1;
}

/**
 * Adds a new handle for a button.
 *
 * @param options The options for the handle.
 * @returns The ID of the handle.
 */
export function addButtonHandle(options: InputButtonHandle): number {
	buttonHandles.set(nextButtonHandleId, options);

	debug(TAG, `Added new button handle: ${options.button}`);

	nextButtonHandleId++;

	return nextButtonHandleId - 1;
}

/**
 * Removes a handle.
 *
 * @param id The ID of the handle.
 * @returns True if the handle was removed, false if it didn't exist.
 */
export function removeHandle(type: 'button' | 'axis', id: number): boolean {
	if (type === 'button') {
		return buttonHandles.delete(id);
	} else {
		lastEventAxisValues.delete(id);

		return axisHandles.delete(id);
	}
}

export const currentScope = { subscribe: _currentScope.subscribe };
