import type { Disposable, Tickable } from '$lib';
import { derived, get, writable, type Readable, type Writable, readonly } from 'svelte/store';
import { GamepadManager } from './GamepadManager';
import type { OSMapper } from './OSMapper';

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

export type GamepadState = {
	buttons: number[];
	axes: number[];
};

export interface InputHandle {
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

export interface InternalInputHandle {
	type: 'button' | 'axis';
	handle: ButtonHandle | AxisHandle;
	store: Writable<boolean> | Writable<number>;
}

export class InputSystem implements Disposable, Tickable {
	private _gamepadManager: GamepadManager;
	private _handles: InternalInputHandle[] = [];

	private _mapper: OSMapper | null = null;
	private _lastGamepadTimestamp: number = 0;

	constructor() {
		this._gamepadManager = new GamepadManager();

		// While it seems that the timestamp is consistent across a single
		// gamepad, I don't think it's consistent across multiple gamepads.
		// So we'll reset it to 0 when a gamepad is disconnected.
		this._gamepadManager.gamepad.subscribe((gamepad) => {
			if (gamepad == null) {
				this._lastGamepadTimestamp = 0;
			} else {
				this._mapper = this._gamepadManager.getMapper();
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

	deregisterHandle(id: string): void {
		const index = this._handles.findIndex((h) => h.handle.id == id);

		if (index != -1) {
			this._handles.splice(index, 1);
		}
	}

	tick(): void {
		const gamepadIndex = get(this._gamepadManager.gamepad);

		if (gamepadIndex == null || this._mapper == null) {
			return;
		}

		const gamepad = navigator.getGamepads()[gamepadIndex]!;

		// We can use the timestamp to determ_gamepadStateine if the gamepad has been updated
		// since the last tick
		if (gamepad.timestamp == this._lastGamepadTimestamp) {
			return;
		}

		// We know that something has changed, so now we need to compare the
		// current state to the previous state and fire any callbacks
		const previousState = this._mapper.gamepadState;

		this._mapper.gamepadState = {
			buttons: gamepad.buttons.map((b) => b.value),
			axes: gamepad.axes.map((a) => a)
		};

		// Fire button callbacks
		const buttonHandles = this._handles.filter((h) => h.type == 'button');
		this._mapper.callButtonHandles(previousState, buttonHandles);

		// Fire axis callbacks
		const axisHandles = this._handles.filter((h) => h.type == 'axis');
		this._mapper.callAxisHandles(previousState, axisHandles, this.processAxisValue.bind(this));

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

	get gamepadConnected(): Readable<boolean> {
		return derived(this._gamepadManager.gamepad, (gamepad) => gamepad != null);
	}
}
