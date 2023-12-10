import type { InputButton, InputAxis } from './InputSystem';

/**
 * Options for a general input handle.
 */
export type InputHandleOptions = {
	/** The UUID of a pane, or global if omitted. */
	scope?: string;
};

/**
 * Options for a button input handle.
 */
export type InputButtonHandle = InputHandleOptions & {
	/** What button this handle is attached to. */
	button: InputButton;
	/** The callback to use when an event is fired. */
	callback: (value: boolean) => void;
};

/**
 * Options for an axis input handle.
 */
export type InputAxisHandle = InputHandleOptions & {
	/** Whether to invert the axis. @default false */
	inverted?: boolean;
	/** What axis this handle is attached to. */
	axis: InputAxis;
	/** The deadzone of the axis. @default 0.05 */
	deadzone?: number;
	/**
	 * How much the axis needs to change before an event is fired.
	 *
	 * @default 0.05
	 */
	eventDelta?: number;
	/** Exponent to apply to the input value. Must be greater than 0. @default 1 */
	curve?: number;
	/** The callback to use when an event is fired. */
	callback: (value: number) => void;
};
