import type { Writable } from 'svelte/store';
import type {
	Button,
	Axis,
	GamepadState,
	AxisHandle,
	ButtonHandle,
	InternalInputHandle
} from './InputSystem';
import type { OSMapper } from './OSMapper';

export class WinMapper implements OSMapper {
	gamepadState: GamepadState = {
		buttons: Array(17).fill(0),
		axes: Array(4).fill(0)
	};

	mapButton(button: Button): number {
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

	mapAxis(axis: Axis): number {
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

	callButtonHandles(prevState: GamepadState, handles: InternalInputHandle[]) {
		for (const intHandle of handles) {
			const btnHandle = intHandle.handle as ButtonHandle;

			const buttonIndex = this.mapButton(btnHandle.button);

			const previousPressed = prevState.buttons[buttonIndex] > 0.5;
			const currentPressed = this.gamepadState.buttons[buttonIndex] > 0.5;

			if (currentPressed != previousPressed) {
				(intHandle.store as Writable<boolean>).set(currentPressed);
			}
		}
	}

	callAxisHandles(
		prevState: GamepadState,
		handles: InternalInputHandle[],
		processFunc: (v: number, h: AxisHandle) => number
	) {
		for (const intHandle of handles) {
			const axisHandle = intHandle.handle as AxisHandle;

			// If the axis is LT or RT, we need to get the value from the buttons array
			// instead of the axes array
			const isTrigger = axisHandle.axis == 'LT' || axisHandle.axis == 'RT';

			const axisIndex = isTrigger
				? this.mapButton(axisHandle.axis as Button)
				: this.mapAxis(axisHandle.axis);

			const previousValue = isTrigger ? prevState.buttons[axisIndex] : prevState.axes[axisIndex];
			const currentValue = isTrigger
				? this.gamepadState.buttons[axisIndex]
				: this.gamepadState.axes[axisIndex];

			// We're going to compare raw values, and only process them for the callback
			// if they've changed
			if (currentValue != previousValue) {
				(intHandle.store as Writable<number>).set(processFunc(currentValue, axisHandle));
			}
		}
	}
}
