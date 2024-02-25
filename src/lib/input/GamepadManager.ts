import type { Disposable } from '$lib';
import { get, writable, type Writable } from 'svelte/store';
import { LinuxMapper } from './LinuxMapper';
import type { OSMapper } from './OSMapper';
import { WinMapper } from './WinMapper';

export class GamepadManager implements Disposable {
	private _gamepad = writable<Gamepad | null>(null);

	constructor() {
		window.addEventListener('gamepadconnected', (e) => {
			// For now, assume that only one gamepad will be connected at a time
			if (get(this._gamepad)) {
				console.warn(
					'|GamepadManager| Attempted to connect a gamepad when one was already connected.'
				);

				return;
			}

			if (this.isGamepadSupported(e.gamepad) == false) {
				console.warn('|GamepadManager| Attempted to connect an unsupported gamepad', e.gamepad);

				return;
			}

			console.log(
				`|GamepadManager| Gamepad ${e.gamepad.id} at index ${e.gamepad.index} connected.`
			);

			// For some reason, VSCode is thinking that this._gamepad is the "never" type
			// Even though it's clearly a Writable<Gamepad | null>
			(this._gamepad as Writable<Gamepad | null>).set(e.gamepad);
		});

		window.addEventListener('gamepaddisconnected', (e) => {
			console.log(
				`|GamepadManager| Gamepad ${e.gamepad.id} at index ${e.gamepad.index} disconnected.`
			);

			this._gamepad.set(null);
		});
	}

	dispose(): void {
		this._gamepad.set(null);
	}

	get gamepad() {
		return { subscribe: this._gamepad.subscribe };
	}

	getMapper(): OSMapper {
		if (navigator.userAgent.includes('Linux')) {
			return new WinMapper();
		}

		return new WinMapper();
	}

	private isGamepadSupported(gamepad: Gamepad): boolean {
		console.log(gamepad);

		// XInput gamepads are supported using the standard layout, but we also
		// hack in support for our controller on Linux
		if (navigator.userAgent.includes('Linux')) {
			return true;
		}

		if (gamepad.mapping != 'standard' || gamepad.id.toLowerCase() != 'xinput') {
			return false;
		}

		return true;
	}
}
