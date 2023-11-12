export type GamepadAxis = 'leftStickX' | 'leftStickY' | 'rightStickX' | 'rightStickY';

export type GamepadButton =
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

export type GamepadTrigger = 'leftTrigger' | 'rightTrigger';

export type AxisInputListener = (value: number) => void;
export type ButtonInputListener = (value: boolean) => void;
export type TriggerInputListener = AxisInputListener;

const gamepadAxisMap = new Map<number, GamepadAxis>([
	[0, 'leftStickX'],
	[1, 'leftStickY'],
	[2, 'rightStickX'],
	[3, 'rightStickY']
]);

const gamepadButtonMap = new Map<number, GamepadButton>([
	[0, 'a'],
	[1, 'b'],
	[2, 'x'],
	[3, 'y'],
	[4, 'leftBumper'],
	[5, 'rightBumper'],
	[6, 'leftTrigger'],
	[7, 'rightTrigger'],
	[8, 'back'],
	[9, 'start'],
	[10, 'leftStick'],
	[11, 'rightStick'],
	[12, 'dpadUp'],
	[13, 'dpadDown'],
	[14, 'dpadLeft'],
	[15, 'dpadRight'],
	[16, 'xbox']
]);

const gamepadTriggerMap = new Map<number, GamepadTrigger>([
	[6, 'leftTrigger'],
	[7, 'rightTrigger']
]);

const axisInputListeners = new Map<
	GamepadAxis,
	Set<{ caller: string; callback: AxisInputListener }>
>();

const buttonInputListeners = new Map<
	GamepadButton,
	Set<{ caller: string; callback: ButtonInputListener }>
>();

const triggerInputListeners = new Map<
	GamepadButton,
	Set<{ caller: string; callback: TriggerInputListener }>
>();

export function axisInput(axis: number, value: number): void {
	const listeners = axisInputListeners.get(gamepadAxisMap.get(axis)!);

	for (const listener of listeners ?? []) {
		listener.callback(value);
	}
}

export function buttonInput(button: number, value: boolean): void {
	const listeners = buttonInputListeners.get(gamepadButtonMap.get(button)!);

	for (const listener of listeners ?? []) {
		listener.callback(value);
	}
}

export function triggerInput(trigger: number, value: number): void {
	const listeners = triggerInputListeners.get(gamepadTriggerMap.get(trigger)!);

	for (const listener of listeners ?? []) {
		listener.callback(value);
	}
}

export function addAxisInputListener(
	axis: GamepadAxis,
	caller: string,
	callback: AxisInputListener
): void {
	if (!axisInputListeners.has(axis)) {
		axisInputListeners.set(axis, new Set());
	}

	axisInputListeners.get(axis)!.add({ caller, callback });
}

export function addButtonInputListener(
	button: GamepadButton,
	caller: string,
	callback: ButtonInputListener
): void {
	if (!buttonInputListeners.has(button)) {
		buttonInputListeners.set(button, new Set());
	}

	buttonInputListeners.get(button)!.add({ caller, callback });
}

export function addTriggerInputListener(
	trigger: GamepadTrigger,
	caller: string,
	callback: TriggerInputListener
): void {
	if (!triggerInputListeners.has(trigger)) {
		triggerInputListeners.set(trigger, new Set());
	}

	triggerInputListeners.get(trigger)!.add({ caller, callback });
}
