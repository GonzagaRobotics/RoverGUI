import { DataTexture, DirectionalLight, EquirectangularReflectionMapping } from 'three';
import type { Disposable, RequiresLoading, View3DInternal } from './Internal';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

export class Lighting implements Disposable, RequiresLoading {
	sun: DirectionalLight;
	skyTexture: DataTexture | undefined;

	disposed = false;

	constructor(caller: View3DInternal) {
		this.sun = new DirectionalLight();
		this.sun.position.set(-1, 5, 0);
		this.sun.target.position.set(0, 0, 0);
		this.sun.castShadow = true;

		caller.addSceneChild(this, this.sun);
	}

	load(caller: View3DInternal): void {
		this.loadSkybox().then(() => {
			caller.scene.environment = this.skyTexture!;
			caller.scene.background = this.skyTexture!;
			caller.objectLoaded();
		});
	}

	dispose(): void {
		if (this.disposed) {
			return;
		}

		this.disposed = true;

		this.sun.dispose();
	}

	private async loadSkybox(): Promise<void> {
		const loader = new RGBELoader();

		const loaderResult = await loader.loadAsync('/skybox.hdr');

		loaderResult.mapping = EquirectangularReflectionMapping;

		this.skyTexture = loaderResult;
	}
}
