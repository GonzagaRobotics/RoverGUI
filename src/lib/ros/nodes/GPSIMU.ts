import type { TopicMapping } from '$lib/ros/TopicMapping';
import { clientConfig, ros } from '$lib/ros/Client';
import { rosTopicReadStore } from '$lib/ros/TopicStore';

export type GPSIMU = {
	latitude: number;
	longitude: number;
	pitch: number;
	roll: number;
	yaw: number;
	heading: number;
};

export const GPSIMUMapping: TopicMapping<GPSIMU> = {
	latitude: { name: 'gps/lat', type: 'std_msgs/Float32' },
	longitude: { name: 'gps/lng', type: 'std_msgs/Float32' },
	pitch: { name: 'imu/pitch', type: 'std_msgs/Float32' },
	roll: { name: 'imu/roll', type: 'std_msgs/Float32' },
	yaw: { name: 'imu/yaw', type: 'std_msgs/Float32' },
	heading: { name: 'mag/z', type: 'std_msgs/Float32' }
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
	: rosTopicReadStore(ros!, 'gps_imu_pub', GPSIMUMapping, loadingData, true);