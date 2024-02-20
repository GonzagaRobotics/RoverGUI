import { Message, Topic } from 'roslib';
import type { ClientRos } from './ClientRos';

export class ClientRosTopic {
	private readonly ros: ClientRos;

	readonly internal: Topic | null = null;
	readonly name: string;
	readonly messageType: string;

	constructor(name: string, messageType: string, ros: ClientRos) {
		this.ros = ros;
		this.name = name;
		this.messageType = messageType;

		if (this.ros.internal) {
			this.internal = new Topic({
				ros: this.ros.internal,
				name: this.name,
				messageType: this.messageType
			});
		}
	}

	advertise() {
		this.internal?.advertise();
	}

	unadvertise() {
		this.internal?.unadvertise();
	}

	publish(message: Message) {
		this.internal?.publish(message);
	}

	subscribe(callback: (message: Message) => void) {
		this.internal?.subscribe(callback);
	}
}
