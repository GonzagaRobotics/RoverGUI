import { simpleObjToMsg, type RosMapping } from '../RosMapping';

export type Motors = {
	left: number;
	right: number;
};

export const MotorsMapping: RosMapping<Motors> = {
	left: { name: 'motors/left', type: 'std_msgs/Float32', objToMsg: simpleObjToMsg },
	right: { name: 'motors/right', type: 'std_msgs/Float32', objToMsg: simpleObjToMsg }
};
