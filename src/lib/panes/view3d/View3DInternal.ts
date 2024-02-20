import type { Disposable, Tickable } from '$lib';
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export class View3DInternal implements Tickable, Disposable {
	private canvas: HTMLCanvasElement;

	private scene: Scene;
	private camera: PerspectiveCamera;
	private renderer: WebGLRenderer;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;

		this.scene = new Scene();
		this.camera = new PerspectiveCamera(
			75,
			this.canvas.clientWidth / this.canvas.clientHeight,
			0.1,
			100
		);
		this.renderer = new WebGLRenderer({ canvas: canvas, antialias: true });

		this.scene.background = new Color(0x000000);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tick(delta: number): void {
		this.renderer.render(this.scene, this.camera);
	}

	dispose(): void {
		this.renderer.dispose();
	}
}
