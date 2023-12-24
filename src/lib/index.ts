/**
 * An interface for classes that need to perform cleanup actions before destruction.
 * Any class that implements this interface can assume that its `dispose` method will
 * only be called once at the end of its lifetime.
 */
export interface Disposable {
	dispose(): void;
}
