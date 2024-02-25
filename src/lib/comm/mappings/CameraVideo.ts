import type { Message } from 'roslib';
import { type RosMapping } from '../RosMapping';

export type VideoPacket = {
	header: {
		stamp: {
			seconds: number;
			nanoseconds: number;
		};
		frameId: string;
	};
	width: number;
	height: number;
	encoding: string;
	packetPts: number;
	packetFlags: number;
	bigEndian: boolean;
	data: string;
};

export const videoMsgToObj = (msg: Message): VideoPacket => {
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
		width: obj.width,
		height: obj.height,
		encoding: obj.encoding,
		packetPts: obj.pts,
		packetFlags: obj.flags,
		bigEndian: obj.is_bigendian,
		data: obj.data
	};
};

export type CameraVideo = {
	packet: VideoPacket;
};

export const VideoMapping: RosMapping<CameraVideo> = {
	packet: {
		name: 'realsense_interop/image/ffmpeg',
		type: 'ffmpeg_image_transport_msgs/FFMPEGPacket',
		msgToObj: videoMsgToObj
	}
};
