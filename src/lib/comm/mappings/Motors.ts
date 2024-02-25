import { simpleObjToMsg, type RosMapping, simpleMsgToObj } from '../RosMapping';

export type Motors = {
	left: number;
	right: number;
};

export const MotorsMapping: RosMapping<Motors> = {
	left: {
		name: '/motor_command/left_motor',
		type: 'std_msgs/Float32',
		objToMsg: simpleObjToMsg,
		msgToObj: simpleMsgToObj
	},
	right: {
		name: '/motor_command/right_motor',
		type: 'std_msgs/Float32',
		objToMsg: simpleObjToMsg,
		msgToObj: simpleMsgToObj
	}
};

export const MotorsLoadingData: Motors = {
	left: 0,
	right: 0
};
