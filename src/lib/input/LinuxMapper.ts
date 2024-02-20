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

export class LinuxMapper implements OSMapper {
	gamepadState: GamepadState = {
		buttons: Array(11).fill(0),
		axes: Array(8).fill(0)
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
			// LT and RT are not actually buttons, so we'll throw an error to make sure
			// that we are getting them from the axis array
			case 'LT':
			case 'RT':
				throw new Error('LT and RT are not axes internally. Use the buttons array instead.');
			case 'Back':
				return 6;
			case 'Center':
				return 8;
			case 'Start':
				return 7;
			case 'LS':
				return 9;
			case 'RS':
				return 10;
			// The D-Pad are not actually buttons, but for compatibility reasons we'll
			// return the index of the axis array
			case 'Up':
				return 7;
			case 'Down':
				return 7;
			case 'Left':
				return 6;
			case 'Right':
				return 6;
		}
	}

	mapAxis(axis: Axis): number {
		switch (axis) {
			case 'LX':
				return 0;
			case 'LY':
				return 1;
			case 'RX':
				return 3;
			case 'RY':
				return 4;
			case 'LT':
				return 2;
			case 'RT':
				return 5;
		}
	}

	callButtonHandles(prevState: GamepadState, handles: InternalInputHandle[]): void {
		for (const intHandle of handles) {
			const btnHandle = intHandle.handle as ButtonHandle;

			let previousPressed = false;
			let currentPressed = false;

			// Trigger edge case
			if (btnHandle.button === 'LT' || btnHandle.button === 'RT') {
				const axisIndex = this.mapAxis(btnHandle.button);

				previousPressed = prevState.axes[axisIndex] > 0.5;
				currentPressed = this.gamepadState.axes[axisIndex] > 0.5;
			} else if (
				btnHandle.button === 'Up' ||
				btnHandle.button === 'Down' ||
				btnHandle.button === 'Left' ||
				btnHandle.button === 'Right'
			) {
				const axisIndex = this.mapButton(btnHandle.button);

				if (btnHandle.button === 'Up' || btnHandle.button === 'Left') {
					previousPressed = prevState.axes[axisIndex] < 0;
					currentPressed = this.gamepadState.axes[axisIndex] < 0;
				} else {
					previousPressed = prevState.axes[axisIndex] > 0;
					currentPressed = this.gamepadState.axes[axisIndex] > 0;
				}
			} else {
				const buttonIndex = this.mapButton(btnHandle.button);

				previousPressed = prevState.buttons[buttonIndex] > 0.5;
				currentPressed = this.gamepadState.buttons[buttonIndex] > 0.5;
			}

			if (currentPressed != previousPressed) {
				(intHandle.store as Writable<boolean>).set(currentPressed);
			}
		}
	}

	callAxisHandles(
		prevState: GamepadState,
		handles: InternalInputHandle[],
		processFunc: (v: number, h: AxisHandle) => number
	): void {
		for (const intHandle of handles) {
			const axisHandle = intHandle.handle as AxisHandle;

			const axisIndex = this.mapAxis(axisHandle.axis);

			let previousValue = prevState.axes[axisIndex];
			let currentValue = this.gamepadState.axes[axisIndex];

			// The triggers go from -1 to 1, so we need to normalize them to 0 to 1
			if (axisHandle.axis === 'LT' || axisHandle.axis === 'RT') {
				previousValue = (previousValue + 1) / 2;
				currentValue = (currentValue + 1) / 2;
			}

			// We're going to compare raw values, and only process them for the callback
			// if they've changed
			if (currentValue != previousValue) {
				(intHandle.store as Writable<number>).set(processFunc(currentValue, axisHandle));
			}
		}
	}
}
