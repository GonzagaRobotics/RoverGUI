import {
	BufferGeometry,
	Float32BufferAttribute,
	Points,
	PointsMaterial,
	SRGBColorSpace,
	Texture,
	TextureLoader
} from 'three';
import type { Disposable, RequiresLoading, View3DInternal } from './Internal';

export class PointCloud implements RequiresLoading, Disposable {
	geometry: BufferGeometry;
	sprite: Texture;
	material: PointsMaterial;
	points: number[];
	particles: Points | null = null;

	disposed = false;

	constructor() {
		this.points = [];

		this.geometry = new BufferGeometry();

		this.sprite = new TextureLoader().load('/disc.png');
		this.sprite.colorSpace = SRGBColorSpace;

		this.material = new PointsMaterial({
			size: 0.1,
			map: this.sprite,
			alphaTest: 0.5
		});
		this.material.color.setHSL(0.035, 0.9, 0.6, SRGBColorSpace);
	}

	load(caller: View3DInternal): void {
		this.internalLoad(caller);
	}

	dispose(): void {
		if (this.disposed) {
			return;
		}

		this.geometry.dispose();
		this.material.dispose();
		this.sprite.dispose();

		this.disposed = true;
	}

	private async internalLoad(caller: View3DInternal): Promise<void> {
		const response = await fetch('/terrain-points.txt');

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		await this.parsePoints(response);

		this.geometry.setAttribute('position', new Float32BufferAttribute(this.points, 3));
		this.particles = new Points(this.geometry, this.material);
		this.particles.rotation.y = Math.PI;

		caller.addSceneChild(this, this.particles);
		caller.objectLoaded();
	}

	private async parsePoints(response: Response): Promise<void> {
		// Plain text
		// First line is header (ignore)
		// Second line is number of points
		// Rest of lines are points x,y,z (space separated)

		const scale = 1;

		const lines = (await response.text()).split('\n');
		const numPoints = parseInt(lines[1], 10);

		for (let i = 0; i < numPoints; i++) {
			const line = lines[i + 2].split(' ');

			this.points.push(parseFloat(line[0]) * scale - 10);
			this.points.push(parseFloat(line[1]) * scale - 1);
			this.points.push(parseFloat(line[2]) * scale - 4.5);
		}
	}
}
