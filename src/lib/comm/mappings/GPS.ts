import { simpleMsgToObj, type RosMapping } from '../RosMapping';

export type GPS = {
	latitude: number;
	longitude: number;
	heading: number;
};

export const GPSMapping: RosMapping<GPS> = {
	latitude: { name: 'gps/lat', type: 'std_msgs/Float32', msgToObj: simpleMsgToObj },
	longitude: { name: 'gps/lng', type: 'std_msgs/Float32', msgToObj: simpleMsgToObj },
	heading: { name: 'mag/z', type: 'std_msgs/Float32', msgToObj: simpleMsgToObj }
};

export const GPSLoadingData: GPS = {
	latitude: 0,
	longitude: 0,
	heading: 0
};
