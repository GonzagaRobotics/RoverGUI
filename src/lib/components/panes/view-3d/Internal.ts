import { WebGLRenderer, PerspectiveCamera, Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface Disposable {
	disposed: boolean;
	dispose(): void;
}

export class View3DInternal implements Disposable {
	canvas: HTMLCanvasElement;
	renderer: WebGLRenderer;
	scene: Scene;
	camera: PerspectiveCamera;
	controls: OrbitControls;

	children: Disposable[] = [];

	disposed = false;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		// Make sure the canvas is the same size as the element
		this.canvas.width = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;

		this.renderer = new WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		});

		this.scene = new Scene();

		this.camera = new PerspectiveCamera(70, this.canvas.width / this.canvas.height, 0.1, 1000);
		// If the camera is at the origin, then the OrbitControls will not work
		this.camera.position.set(0, 0, -5);

		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.enablePan = false;
		this.controls.zoomSpeed = 1.5;
		this.controls.minDistance = 1;
		this.controls.maxDistance = 5;
		this.controls.enableDamping = true;

		// Start the render loop
		requestAnimationFrame(() => this.render());
	}

	dispose(): void {
		if (this.disposed) {
			return;
		}

		this.disposed = true;

		this.children.forEach((child) => child.dispose());

		this.renderer.dispose();
		this.controls.dispose();
	}

	private render(): void {
		if (this.disposed) {
			return;
		}

		this.controls.update();

		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(() => this.render());
	}
}
