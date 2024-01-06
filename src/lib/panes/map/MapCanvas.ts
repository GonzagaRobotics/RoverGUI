import type { Disposable, Tickable } from '$lib';
import type { GPS } from '$lib/comm/mappings/GPS';
import { get, type Readable } from 'svelte/store';
const imgUrl = new URL('/mrds-area-test.png', import.meta.url).href;

export class MapCanvas implements Disposable, Tickable {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private width: number;
	private height: number;

	private gpsStore: Readable<GPS | null>;
	private redraw: boolean = true;

	private image: HTMLImageElement = new Image();

	constructor(canvas: HTMLCanvasElement, gpsStore: Readable<GPS | null>) {
		this.canvas = canvas;
		this.width = canvas.width;
		this.height = canvas.height;
		this.context = this.canvas.getContext('2d')!;

		this.gpsStore = gpsStore;

		// When the GPS store updates, redraw the canvas
		this.gpsStore.subscribe(() => {
			this.redraw = true;
		});

		this.image.src = imgUrl;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	tick(delta: number): void {
		if (this.image.complete && this.redraw) {
			this.redraw = false;
			this.draw();
		}
	}

	dispose(): void {}

	private draw() {
		this.context.clearRect(0, 0, this.width, this.height);

		this.context.drawImage(this.image, 0, 0, this.width, this.height);

		const gpsData = get(this.gpsStore)!;

		// TODO: Convert real world coordinates to canvas coordinates
		const roverPX = 300;
		const roverPY = 300;

		this.drawPath([
			{ x: roverPX, y: roverPY },
			{ x: roverPX + 100, y: roverPY + 100 },
			{ x: roverPX + 200, y: roverPY - 100 }
		]);
		this.drawTriangle(roverPX, roverPY, gpsData.heading, 24);
		this.drawHelperLines(roverPX, roverPY, 25, 3);
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
		this.context.lineTo(-size / 2.5, size / 2);

		// Right point
		this.context.lineTo(size / 2.5, size / 2);

		// Close the path and fill
		this.context.closePath();
		this.context.fillStyle = 'FireBrick';
		this.context.fill();

		// Clean up
		this.context.resetTransform();
	}

	private drawHelperLines(x: number, y: number, margin: number, width: number): void {
		// Draw 4 straight lines from the edges of the canvas to the x/y point

		this.context.lineWidth = width;
		this.context.setLineDash([10, 10]);
		this.context.strokeStyle = 'FireBrick';

		this.context.beginPath();

		// North
		this.context.moveTo(x, 0);
		this.context.lineTo(x, y - margin);

		// East
		this.context.moveTo(this.width, y);
		this.context.lineTo(x + margin, y);

		// South
		this.context.moveTo(x, this.height);
		this.context.lineTo(x, y + margin);

		// West
		this.context.moveTo(0, y);
		this.context.lineTo(x - margin, y);

		this.context.stroke();

		// Clean up
		this.context.setLineDash([]);
	}

	private drawPath(segments: { x: number; y: number }[]): void {
		// Draw a path from the given segments
		this.context.beginPath();

		segments.forEach((segment, i) => {
			if (i == 0) {
				this.context.moveTo(segment.x, segment.y);
			} else {
				this.context.lineTo(segment.x, segment.y);
			}
		});

		this.context.lineWidth = 2;
		this.context.strokeStyle = 'DarkBlue';
		this.context.setLineDash([15, 20]);

		this.context.stroke();

		// Clean up
		this.context.setLineDash([]);

		// Draw a hollow circle at the end of the path
		const lastPoint = segments[segments.length - 1];

		this.context.beginPath();
		this.context.ellipse(lastPoint.x, lastPoint.y, 10, 10, 0, 0, 2 * Math.PI);
		this.context.stroke();
	}
}
