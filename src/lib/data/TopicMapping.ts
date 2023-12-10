/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A mapping of variable names to ROS topic names and ROS types, as well as instructions for
 * transforming the ROS message into the variable. Every type should have a corresponding
 * TopicMapping.
 */
export type TopicMapping<T> = {
	[key in keyof T]: {
		name: string;
		type: string;
		transform: (message: any) => T[key];
	};
};

/** A simple transform function for messages with a single value named "data". */
export const simpleTopicTransform = (message: any) => message.data;
