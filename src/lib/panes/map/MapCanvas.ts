import type { Disposable, Tickable } from '$lib';
const imgUrl = new URL('/mrds-area-test.png', import.meta.url).href;

export class MapCanvas implements Disposable, Tickable {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private width: number;
	private height: number;

	private image: HTMLImageElement = new Image();

	private roverX: number = 300;
	private roverY: number = 300;
	private roverHeading: number = 0;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.width = canvas.width;
		this.height = canvas.height;
		this.context = this.canvas.getContext('2d')!;

		this.image.src = imgUrl;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tick(delta: number): void {
		if (this.image.complete == false) {
			return;
		}

		// TODO: Only draw when needed
		this.draw();
	}

	dispose(): void {}

	private draw() {
		this.context.clearRect(0, 0, this.width, this.height);

		this.context.drawImage(this.image, 0, 0, this.width, this.height);

		// TODO: Convert real world coordinates to canvas coordinates

		this.drawTriangle(this.roverX, this.roverY, this.roverHeading, 20);
	}

	private drawTriangle(x: number, y: number, heading: number, size: number): void {
		// Transform the canvas
		this.context.translate(x, y);
		this.context.rotate((heading * Math.PI) / 180);

		// Draw the triangle
		this.context.beginPath();

		// Front point
		this.context.moveTo(0, -size / 2);

		// Left point
		this.context.lineTo(-size / 2, size / 2);

		// Right point
		this.context.lineTo(size / 2, size / 2);

		// Close the path and fill
		this.context.closePath();
		this.context.fillStyle = 'red';
		this.context.fill();

		// Clean up
		this.context.resetTransform();
	}
}
