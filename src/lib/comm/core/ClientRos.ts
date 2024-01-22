import type { ClientConfig } from '$lib/Client';
import { Ros } from 'roslib';

export class ClientRos {
	private config: ClientConfig;

	readonly internal: Ros | null = null;

	constructor(config: ClientConfig) {
		this.config = config;

		if (this.config.preview == false) {
			this.internal = new Ros({});
		}
	}

	connect() {
		this.internal?.connect(this.config.roverUrl);
	}

	disconnect() {
		this.internal?.close();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(event: 'connection' | 'close' | 'error', callback: (event: any) => void) {
		this.internal?.on(event, callback);
	}
}
