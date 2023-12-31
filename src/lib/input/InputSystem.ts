import type { Disposable, Tickable } from '$lib';
import { derived, get, writable, type Readable, type Writable, readonly } from 'svelte/store';
import { GamepadManager } from './GamepadManager';

export type Button =
	| 'A'
	| 'B'
	| 'X'
	| 'Y'
	| 'LB'
	| 'RB'
	| 'LT'
	| 'RT'
	| 'Back'
	| 'Center'
	| 'Start'
	| 'LS'
	| 'RS'
	| 'Up'
	| 'Down'
	| 'Left'
	| 'Right';

export type Axis = 'LX' | 'LY' | 'RX' | 'RY' | 'LT' | 'RT';

type GamepadState = {
	buttons: number[];
	axes: number[];
};

const DefaultGamepadState: GamepadState = {
	buttons: Array(17).fill(0),
	axes: Array(4).fill(0)
};

interface InputHandle {
	id: string;
}

export interface ButtonHandle extends InputHandle {
	button: Button;
}

export interface AxisHandle extends InputHandle {
	axis: Axis;
	/** @default false */
	inverted?: boolean;
	/** @default 0.05 */
	deadzone?: number;
	/** @default 1  */
	curve?: number;
}

interface InternalInputHandle {
	type: 'button' | 'axis';
	handle: ButtonHandle | AxisHandle;
	store: Writable<boolean> | Writable<number>;
}

export class InputSystem implements Disposable, Tickable {
	private _gamepadManager: GamepadManager;
	private _handles: InternalInputHandle[] = [];

	private _gamepadState: GamepadState = DefaultGamepadState;
	private _lastGamepadTimestamp: number = 0;

	constructor() {
		this._gamepadManager = new GamepadManager();

		// While it seems that the timestamp is consistent across a single
		// gamepad, I don't think it's consistent across multiple gamepads.
		// So we'll reset it to 0 when a gamepad is disconnected.
		this._gamepadManager.gamepad.subscribe((gamepad) => {
			if (gamepad == null) {
				this._lastGamepadTimestamp = 0;
			}
		});
	}

	registerButtonHandle(handle: ButtonHandle): Readable<boolean> {
		if (handle.id.trim() == '') {
			throw new Error('Input handle ID cannot be empty.');
		}

		if (this._handles.some((h) => h.handle.id == handle.id)) {
			throw new Error(`Input handle with ID ${handle.id} already exists.`);
		}

		const store = writable(false);

		this._handles.push({
			type: 'button',
			handle,
			store
		});

		return readonly(store);
	}

	registerAxisHandle(handle: AxisHandle): Readable<number> {
		if (handle.id.trim() == '') {
			throw new Error('Input handle ID cannot be empty.');
		}

		if (this._handles.some((h) => h.handle.id == handle.id)) {
			throw new Error(`Input handle with ID ${handle.id} already exists.`);
		}

		const store = writable(0);

		this._handles.push({
			type: 'axis',
			handle,
			store
		});

		return readonly(store);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tick(delta: number): void {
		const gamepad = get(this._gamepadManager.gamepad);

		if (gamepad == null) {
			return;
		}

		// We can use the timestamp to determine if the gamepad has been updated
		// since the last tick
		if (gamepad.timestamp == this._lastGamepadTimestamp) {
			return;
		}

		// We know that something has changed, so now we need to compare the
		// current state to the previous state and fire any callbacks
		const previousState = this._gamepadState;

		this._gamepadState = {
			buttons: gamepad.buttons.map((b) => b.value),
			axes: gamepad.axes.map((a) => a)
		};

		// Fire button callbacks
		for (const handle of this._handles.filter((h) => h.type == 'button')) {
			const buttonIndex = this.mapButton((handle.handle as ButtonHandle).button);

			const previousPressed = previousState.buttons[buttonIndex] > 0.5;
			const currentPressed = this._gamepadState.buttons[buttonIndex] > 0.5;

			if (currentPressed != previousPressed) {
				(handle.store as Writable<boolean>).set(currentPressed);
			}
		}

		// Fire axis callbacks
		for (const handle of this._handles.filter((h) => h.type == 'axis')) {
			const axisHandle = handle.handle as AxisHandle;
			// If the axis is LT or RT, we need to get the value from the buttons array
			// instead of the axes array
			const isTrigger = axisHandle.axis == 'LT' || axisHandle.axis == 'RT';

			const axisIndex = isTrigger
				? this.mapButton(axisHandle.axis as Button)
				: this.mapAxis(axisHandle.axis);

			const previousValue = isTrigger
				? previousState.buttons[axisIndex]
				: previousState.axes[axisIndex];
			const currentValue = isTrigger
				? this._gamepadState.buttons[axisIndex]
				: this._gamepadState.axes[axisIndex];

			// We're going to compare raw values, and only process them for the callback
			// if they've changed
			if (currentValue != previousValue) {
				(handle.store as Writable<number>).set(this.processAxisValue(currentValue, axisHandle));
			}
		}

		this._lastGamepadTimestamp = gamepad.timestamp;
	}

	dispose(): void {
		this._gamepadManager.dispose();
		this._handles = [];
	}

	private processAxisValue(value: number, handle: AxisHandle): number {
		// Apply deadzone
		if (Math.abs(value) < (handle.deadzone ?? 0.05)) {
			return 0;
		}

		// Apply curve
		value = Math.sign(value) * Math.pow(Math.abs(value), handle.curve ?? 1);

		// Apply inversion
		if (handle.inverted) {
			value *= -1;
		}

		return value;
	}

	private mapButton(button: Button): number {
		switch (button) {
			case 'A':
				return 0;
			case 'B':
				return 1;
			case 'X':
				return 2;
			case 'Y':
				return 3;
			case 'LB':
				return 4;
			case 'RB':
				return 5;
			case 'LT':
				return 6;
			case 'RT':
				return 7;
			case 'Back':
				return 8;
			case 'Center':
				return 16;
			case 'Start':
				return 9;
			case 'LS':
				return 10;
			case 'RS':
				return 11;
			case 'Up':
				return 12;
			case 'Down':
				return 13;
			case 'Left':
				return 14;
			case 'Right':
				return 15;
		}
	}

	private mapAxis(axis: Axis): number {
		switch (axis) {
			case 'LX':
				return 0;
			case 'LY':
				return 1;
			case 'RX':
				return 2;
			case 'RY':
				return 3;
			// LT and RT are not actually axes, so we'll throw an error to make sure
			// that we are getting them from the buttons array
			case 'LT':
			case 'RT':
				throw new Error('LT and RT are not axes internally. Use the buttons array instead.');
		}
	}

	get gamepadConnected(): Readable<boolean> {
		return derived(this._gamepadManager.gamepad, (gamepad) => gamepad != null);
	}
}
