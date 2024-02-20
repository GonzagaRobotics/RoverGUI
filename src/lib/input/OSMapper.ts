import type { Axis, AxisHandle, Button, GamepadState, InternalInputHandle } from './InputSystem';

export interface OSMapper {
	gamepadState: GamepadState;

	mapButton(button: Button): number;
	mapAxis(axis: Axis): number;

	callButtonHandles(prevState: GamepadState, handles: InternalInputHandle[]): void;
	callAxisHandles(
		prevState: GamepadState,
		handles: InternalInputHandle[],
		processFunc: (v: number, h: AxisHandle) => number
	): void;
}
