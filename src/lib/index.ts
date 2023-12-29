/**
 * An interface for classes that need to perform cleanup actions before destruction.
 * Any class that implements this interface can assume that its `dispose` method will
 * only be called once at the end of its lifetime.
 */
export interface Disposable {
	dispose(): void;
}

/**
 * An interface for classes that need to perform actions on every frame.
 */
export interface Tickable {
	tick(delta: number): void;

	/**
	 * Returns the priority of this tickable. Tickables with higher priority will be
	 * ticked first. Tickables with the same priority will be ticked in an undefined
	 * order. Priority defaults to 0, and can only be >= 0.
	 */
	getPriority(): number;
}
