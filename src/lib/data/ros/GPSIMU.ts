import { simpleTopicTransform, type TopicMapping } from '$lib/data/TopicMapping';
import { clientConfig, ros } from '$lib/data/Client';
import { rosTopicReadStore } from '$lib/data/TopicStore';

export type GPSIMU = {
	latitude: number;
	longitude: number;
	pitch: number;
	roll: number;
	yaw: number;
	heading: number;
};

export const GPSIMUMapping: TopicMapping<GPSIMU> = {
	latitude: { name: 'gps/lat', type: 'std_msgs/Float32', transform: simpleTopicTransform },
	longitude: { name: 'gps/lng', type: 'std_msgs/Float32', transform: simpleTopicTransform },
	pitch: { name: 'imu/pitch', type: 'std_msgs/Float32', transform: simpleTopicTransform },
	roll: { name: 'imu/roll', type: 'std_msgs/Float32', transform: simpleTopicTransform },
	yaw: { name: 'imu/yaw', type: 'std_msgs/Float32', transform: simpleTopicTransform },
	heading: { name: 'mag/z', type: 'std_msgs/Float32', transform: simpleTopicTransform }
};

const loadingData: GPSIMU = {
	latitude: 0,
	longitude: 0,
	pitch: 0,
	roll: 0,
	yaw: 0,
	heading: 0
};

export const gpsimuStore = clientConfig.preview
	? null
	: rosTopicReadStore(ros!, '', GPSIMUMapping, loadingData);
