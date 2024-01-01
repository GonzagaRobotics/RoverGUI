import { Topic, type Ros } from 'roslib';
import type { RosMapping } from './RosMapping';
import { derived, writable, type Readable } from 'svelte/store';

export function readFromRover<T>(
	ros: Ros,
	mapping: RosMapping<T>,
	loadingData: T
): Readable<T | null> {
	// The topics we have received data from
	const receivedTopics = new Set<string>();

	// Cleanup functions for the subscriptions
	const unsubscribers: (() => void)[] = [];

	// Internal writable store
	const { subscribe } = writable<{ data: T; loading: boolean }>(
		{ data: loadingData, loading: true },
		(_, update) => {
			// Subscribe to all topics
			Object.keys(mapping).forEach((key) => {
				const { name, type, msgToObj } = mapping[key as keyof T];

				// Make sure that there is a msgToObj function
				if (msgToObj == undefined) {
					throw new Error(`msgToObj not defined for ${name}`);
				}

				// Subscribe to the topic
				const subscriber = new Topic({
					ros: ros,
					name: name,
					messageType: type
				});

				subscriber.subscribe((msg) => {
					// Update the store
					update((prevData) => {
						const newData = {
							data: { ...prevData.data, [key]: msgToObj(msg) },
							loading: prevData.loading
						};

						// If we already finished loading, or we have already received data from this topic,
						// we can just return the new data
						if (prevData.loading == false || receivedTopics.has(key)) {
							return newData;
						}

						// Otherwise, add the topic to the list of received topics
						receivedTopics.add(key);

						// If we have received data from all topics, we can stop loading
						const allReceived = Object.keys(mapping).every((key) => receivedTopics.has(key));

						return { data: newData.data, loading: !allReceived };
					});
				});
			});

			return () => {
				// Unsubscribe from all topics
				unsubscribers.forEach((unsubscribe) => unsubscribe());
			};
		}
	);

	// Return a derived store so we can only allow subscription to the data,
	// or null if we are still loading
	return derived({ subscribe }, (v) => (v.loading ? null : v.data));
}
