import { simpleObjToMsg, type RosMapping } from '../RosMapping';

export type Motors = {
	left: number;
	right: number;
};

export const MotorsMapping: RosMapping<Motors> = {
	left: { name: '/motor_command/left_motor', type: 'std_msgs/Float32', objToMsg: simpleObjToMsg },
	right: {
		name: '/motor_command/right_motor',
		type: 'std_msgs/Float32',
		objToMsg: simpleObjToMsg
	}
};
