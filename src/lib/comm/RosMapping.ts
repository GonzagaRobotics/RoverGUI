/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message } from 'roslib';

export type RosMapping<T> = {
	[key in keyof T]: {
		name: string;
		type: string;
		msgToObj?: (msg: Message) => T[key];
		objToMsg?: (obj: T[key]) => Message;
	};
};

export const simpleMsgToObj = (msg: Message): any => (msg as any).data;
export const simpleObjToMsg = (obj: any): Message => new Message({ data: obj });
