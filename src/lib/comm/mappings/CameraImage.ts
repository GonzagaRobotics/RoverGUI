import type { Message } from 'roslib';
import { type RosMapping } from '../RosMapping';

export type CompressedImage = {
	header: {
		stamp: {
			seconds: number;
			nanoseconds: number;
		};
		frameId: string;
	};
	format: string;
	data: string;
};

export const cameraMsgToObj = (msg: Message): CompressedImage => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const obj = msg as any;

	return {
		header: {
			stamp: {
				seconds: obj.header.stamp.sec,
				nanoseconds: obj.header.stamp.nanosec
			},
			frameId: obj.header.frame_id
		},
		format: obj.format,
		data: obj.data
	};
};

export type CameraImage = {
	image: CompressedImage;
};

export const CameraMapping: RosMapping<CameraImage> = {
	image: {
		name: 'realsense_interop/image/compressed',
		type: 'sensor_msgs/CompressedImage',
		msgToObj: cameraMsgToObj
	}
};
