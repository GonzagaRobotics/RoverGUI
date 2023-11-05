import {
	WebGLRenderer,
	Scene,
	PerspectiveCamera,
	Object3D,
	Mesh,
	GridHelper,
	EquirectangularReflectionMapping,
	DataTexture,
	MeshPhysicalMaterial,
	Material,
	DirectionalLight
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

enum View3DInternalState {
	Initializing,
	Ready,
	Rendering,
	Disposed
}

export class View3DInternal {
	canvas: HTMLCanvasElement;

	renderer: WebGLRenderer | undefined;
	scene: Scene | undefined;
	camera: PerspectiveCamera | undefined;
	controls: OrbitControls | undefined;

	skyTexture: DataTexture | undefined;
	sun: DirectionalLight | undefined;
	rover: Object3D | undefined;

	state: View3DInternalState = View3DInternalState.Initializing;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;

		this.initialize().then(() => {
			this.state = View3DInternalState.Rendering;

			requestAnimationFrame(this.render.bind(this));
		});
	}

	resize(width: number, height: number) {
		if (
			this.state == View3DInternalState.Initializing ||
			this.state == View3DInternalState.Disposed
		) {
			console.warn('View3DInternal.resize() called in invalid state: ' + this.state);
			return;
		}

		// Only resize if the new size is different from the current size
		if (width == this.canvas.width && height == this.canvas.height) {
			return;
		}

		this.canvas.width = width;
		this.canvas.height = height;
	}

	render() {
		if (this.state != View3DInternalState.Rendering) {
			console.warn('View3DInternal.render() called in invalid state: ' + this.state);
			return;
		}

		this.controls!.update();

		this.renderer!.render(this.scene!, this.camera!);

		requestAnimationFrame(this.render.bind(this));
	}

	dispose() {
		if (
			this.state == View3DInternalState.Disposed ||
			this.state == View3DInternalState.Initializing
		) {
			console.error('View3DInternal.dispose() called in invalid state: ' + this.state);
			return;
		}

		this.state = View3DInternalState.Disposed;

		this.scene!.traverse((object) => {
			if (object.type === 'Mesh') {
				const mesh = object as Mesh;

				mesh.geometry.dispose();

				if (Array.isArray(mesh.material)) {
					mesh.material.forEach((material) => material.dispose());
				} else {
					mesh.material.dispose();
				}
			}
		});

		this.skyTexture!.dispose();

		this.renderer!.dispose();
		this.controls!.dispose();
	}

	private async initialize() {
		this.renderer = new WebGLRenderer({
			canvas: this.canvas,
			antialias: true
		});

		this.scene = new Scene();

		this.camera = new PerspectiveCamera(70, this.canvas.width / this.canvas.height, 0.1, 1000);
		this.camera.position.set(0, 1, -1.5);

		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.target.set(0, 0.25, 0);
		this.controls.enablePan = false;
		this.controls.zoomSpeed = 1.5;
		this.controls.minDistance = 1;
		this.controls.maxDistance = 5;
		this.controls.enableDamping = true;

		this.skyTexture = await this.loadSkybox();
		this.scene.background = this.skyTexture;

		this.sun = new DirectionalLight(0xfefff2, 1);
		this.sun.position.set(0, 1, 0.1);
		this.scene.add(this.sun);

		const gridHelper = new GridHelper();
		this.scene.add(gridHelper);

		this.rover = await this.loadRover();
		this.rover.position.set(0, 0.4, 0);
		this.scene.add(this.rover);

		this.state = View3DInternalState.Ready;
	}

	private async loadRover(): Promise<Object3D> {
		const loader = new GLTFLoader();

		const loaderResult = await loader.loadAsync('/rover-model.gltf');

		// The rover is the only object in the scene and is a Mesh
		const rover = loaderResult.scene.children[0] as Mesh;

		(rover.material as Material).dispose();
		rover.material = new MeshPhysicalMaterial({
			color: 0xffffff,
			metalness: 0.1,
			roughness: 0.8,
			envMap: this.skyTexture
		});

		return rover;
	}

	private async loadSkybox(): Promise<DataTexture> {
		const loader = new RGBELoader();

		const loaderResult = await loader.loadAsync('/skybox.hdr');

		loaderResult.mapping = EquirectangularReflectionMapping;

		return loaderResult;
	}
}
