/**
 * A mapping of variable names to ROS topic names and ROS types.
 * Every type should have a corresponding TopicMapping, and within
 * a TopicMapping, every variable name should have a corresponding ROS topic name and type.
 */
export type TopicMapping<T> = {
	// [key: string]: { name: string; type: string };
	[key in keyof T]: { name: string; type: string };
};
