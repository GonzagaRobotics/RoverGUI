import { Topic, type Ros } from 'roslib';
import { writable } from 'svelte/store';
import type { TopicMapping } from './TopicMapping';
import { PUBLIC_ALLOW_PARTIAL_DATA } from '$env/static/public';

/** Generic data combined with a loading state. */
export type TopicStoreData<T> = {
	data: T;
	loading: boolean;
};

/**
 * Creates a read-only store that subscribes to ROS topics.
 *
 * This function is intended to only be called once per data type.
 *
 * @param ros The ROS Client instance.
 * @param mapping The TopicMapping to use for subscribing to topics.
 * @param loadingData Dummy data to be replaced while the topics are loading.
 * @param name A name for the store, used for debugging.
 * @returns The store.
 */
export function rosTopicReadStore<T>(
	ros: Ros,
	mapping: TopicMapping<T>,
	loadingData: T,
	name: string
) {
	/*
	 * Now, we need to handle the loading state, and return undefined when the
	 * loading variable is true. To do this, we need to create a new store that
	 * subscribes to the original store and handles the loading state. While this
	 * works, it is not ideal, as it creates 2 stores for every node.
	 */

	// Create the internal store
	const internal = rosTopicReadStoreInternal(ros, mapping, loadingData, name);

	// Create a new store that handles the loading state
	const { subscribe } = writable<T | undefined>(undefined, (set) => {
		const unsubscribe = internal.subscribe((val) => {
			// If partial data is allowed, return the data
			if (PUBLIC_ALLOW_PARTIAL_DATA == 'true') {
				set(val.data);
				return;
			}

			// If we are still loading, return undefined
			if (val.loading) {
				set(undefined);
				return;
			}

			// Otherwise, return the data
			set(val.data);
		});

		return unsubscribe;
	});

	return {
		subscribe
	};
}

/**
 * Creates a read-only store that subscribes to ROS topics.
 *
 * This function is intended to only be called once per data type, and is also
 * meant to be used as an internal function, with a public function that calls
 * this and handles the loading state.
 *
 * @param ros The ROS Client instance.
 * @param mapping The TopicMapping to use for subscribing to topics.
 * @param loadingData Dummy data to be replaced while the topics are loading.
 * @param storeName A name for the store, used for debugging.
 * @returns The store.
 */
function rosTopicReadStoreInternal<T>(
	ros: Ros,
	mapping: TopicMapping<T>,
	loadingData: T,
	storeName: string
) {
	// The topics we have received data from
	const receivedTopics = new Set<string>();

	// Cleanup functions for unsubscribing from topics
	const unsubscribers: (() => void)[] = [];

	// Writable store with a custom set function for initialization and cleanup
	const { subscribe } = writable<TopicStoreData<T>>(
		{ data: loadingData, loading: true },
		(_, update) => {
			Object.keys(mapping).forEach((key) => {
				const topicMapping = mapping[key as keyof T];

				console.debug(
					`|TopicStore|${storeName}| Subscribing to topic ${topicMapping.name}, type: ${topicMapping.type}`
				);

				// Subscribe to the topic
				const subscriber = new Topic({
					ros: ros,
					name: '/' + topicMapping.name,
					messageType: topicMapping.type
				});

				subscriber.subscribe((message) => {
					// Update the store
					update((prevData) => {
						const newData = {
							...prevData,
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							data: { ...prevData.data, [key]: topicMapping.transform(message as any) }
						};

						// If we already finished loading, don't update the loading state
						if (newData.loading == false) return newData;

						// If we have already received first data from this topic, the loading state is already correct
						if (receivedTopics.has(key)) return newData;

						// Add the topic to the set of received topics
						receivedTopics.add(key);

						console.debug(
							`|TopicStore|${storeName}| Received first data from topic ${topicMapping.name}`
						);

						// Check if we have received data from all topics
						const allReceived = Object.keys(mapping).every((topicKey) =>
							receivedTopics.has(topicKey)
						);

						if (allReceived) {
							console.debug(`|TopicStore|${storeName}| Received data from all topics`);
						}

						return {
							data: newData.data,
							loading: !allReceived
						};
					});
				});

				// Keep track of subscriber to potentially unsubscribe later
				unsubscribers.push(() => subscriber.unsubscribe());
			});

			// Return a cleanup function
			return () => {
				console.debug(`|TopicStore|${storeName}| Unsubscribing from topics...`);

				unsubscribers.forEach((unsub) => unsub());
			};
		}
	);

	return {
		subscribe
	};
}
