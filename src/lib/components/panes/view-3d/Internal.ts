import { WebGLRenderer, PerspectiveCamera, Scene, Object3D } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Rover } from './Rover';
import { Lighting } from './Lighting';

export interface Disposable {
	disposed: boolean;
	dispose(): void;
}

export interface RequiresLoading {
	load(caller: View3DInternal): void;
}

export interface Updateable {
	update(deltaTime: number): void;
}

export class View3DInternal implements Disposable {
	canvas: HTMLCanvasElement;
	renderer: WebGLRenderer;
	scene: Scene;
	camera: PerspectiveCamera;
	controls: OrbitControls;

	numLoaders = 0;
	numLoaded = 0;

	updateables: Updateable[] = [];
	children: Disposable[] = [];

	lastRenderTime: number | undefined = undefined;

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

		const rover = new Rover();
		this.numLoaders++;
		rover.load(this);

		const lighting = new Lighting(this);
		this.numLoaders++;
		lighting.load(this);
	}

	addSceneChild(child: Disposable, obj: Object3D): void {
		this.children.push(child);
		this.scene.add(obj);
	}

	addUpdateable(updateable: Updateable): void {
		this.updateables.push(updateable);
	}

	objectLoaded(): void {
		this.numLoaded++;

		if (this.numLoaded === this.numLoaders) {
			// We can start rendering now
			requestAnimationFrame(this.render.bind(this));
		}
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

	private render(now: DOMHighResTimeStamp): void {
		if (this.disposed) {
			return;
		}

		if (this.lastRenderTime == undefined) {
			this.lastRenderTime = now;
		}

		const deltaTime = (now - this.lastRenderTime) / 1000;

		this.controls.update();
		this.updateables.forEach((updateable) => updateable.update(deltaTime));

		this.renderer.render(this.scene, this.camera);

		this.lastRenderTime = now;

		requestAnimationFrame(this.render.bind(this));
	}
}
