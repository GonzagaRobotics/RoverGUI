import type { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { Disposable } from './Internal';

export class Rover implements Disposable {
	rover: Object3D | undefined;

	disposed = false;

	dispose(): void {
		if (this.disposed) {
			return;
		}

		this.disposed = true;

		this.rover;
	}

	private async loadRover(): Promise<Object3D> {
		const loader = new GLTFLoader();

		const loaderResult = await loader.loadAsync('/rover-model.gltf');

		const rover = loaderResult.scene.children[0];

		return rover;
	}
}
