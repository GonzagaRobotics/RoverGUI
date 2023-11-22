import type { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { RequiresLoading, Disposable, View3DInternal, Updateable } from './Internal';

export class Rover implements RequiresLoading, Disposable, Updateable {
	rover: Object3D | undefined;

	disposed = false;

	constructor() {}

	load(caller: View3DInternal): void {
		this.loadRover().then(() => {
			caller.addSceneChild(this, this.rover!);
			caller.addUpdateable(this);
			caller.objectLoaded();
		});
	}

	update(deltaTime: number): void {
		if (this.disposed) {
			return;
		}
	}

	dispose(): void {
		if (this.disposed) {
			return;
		}

		this.disposed = true;
	}

	private async loadRover() {
		const loader = new GLTFLoader();

		const loaderResult = await loader.loadAsync('/rover-model.gltf');

		const rover = loaderResult.scene.children[0];

		this.rover = rover;
	}
}
