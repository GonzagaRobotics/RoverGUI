import type { Message, Topic } from 'roslib';
import { get } from 'svelte/store';
import { clientState } from './Client';

/** A publisher. */
export type Publisher<T> = {
	/** Unique identifier of the publisher. */
	id: string;
	/** The topic the publisher is publishing to. */
	topic: Topic;
	/** A function to convert the publisher data to a ROS message. */
	dataTransform: (data: T) => Message;
};

/** All publishers. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const publishers: Publisher<any>[] = [];

/** Publisher IDs and the message they are going to send. */
const messages = new Map<string, Message>();

/** The ID our publishing callback interval is set to. */
const publishIntervalId = setInterval(publish, 1000 / get(clientState).publishingRate);

// Listen for changes to the publishing rate
clientState.subscribe((state) => {
	// Clear the interval
	clearInterval(publishIntervalId);

	// Set the new interval
	setInterval(publish, 1000 / state.publishingRate);
});

function publish() {
	// Check if publishing is enabled
	if (get(clientState).publishingAllowed == false) {
		// If not, clear all messages and return
		messages.clear();
		return;
	}

	// Copy the messages to prevent possible changes while publishing
	const messagesCopy = new Map(messages);

	// Check if there are any messages to publish
	if (messagesCopy.size == 0) {
		return;
	}

	console.debug(`|PublishManager| Publishing ${messagesCopy.size} messages.`);

	// Publish all messages
	messagesCopy.forEach((message, topic) => {
		const publisher = publishers.find((publisher) => publisher.id === topic);

		if (!publisher) {
			console.warn(`|PublishManager| Publisher with id ${topic} does not exist.`);
			return;
		}

		publisher.topic.publish(message);
	});

	// Clear all messages that were published
	messagesCopy.forEach((_, topic) => messages.delete(topic));
}

/**
 * Registers a publisher with the manager.
 *
 * @param publisher The publisher to register.
 */
export function registerPublisher<T>(publisher: Publisher<T>): void {
	if (publishers.some((existingPub) => existingPub.id === publisher.id)) {
		console.warn(`|PublishManager| Publisher with id ${publisher.id} already exists.`);
		return;
	}

	console.debug(`|PublishManager| Registering publisher with id ${publisher.id}.`);
	publishers.push(publisher);
}

/**
 * Removes a publisher with the manager.
 *
 * @param id The ID of the publisher.
 */
export function removePublisher(id: string): void {
	const index = publishers.findIndex((publisher) => publisher.id === id);

	if (index === -1) {
		console.warn(`|PublishManager| Publisher with id ${id} does not exist.`);
		return;
	}

	console.debug(`|PublishManager| Removing publisher with id ${id}.`);
	publishers.splice(index, 1);
}

/**
 * Requests to publish a message.
 *
 * @param id The ID of the publisher.
 * @param data The data to publish.
 */
export function requestPublish<T>(id: string, data: T): void {
	const publisher = publishers.find((publisher) => publisher.id === id);

	if (!publisher) {
		console.warn(`|PublishManager| Publisher with id ${id} does not exist.`);
		return;
	}

	messages.set(publisher.id, publisher.dataTransform(data));
}

/**
 * Clears a publisher's message.
 *
 * @param id The ID of the publisher.
 */
export function clearPublisherMessage(id: string): void {
	const publisher = publishers.find((publisher) => publisher.id === id);

	if (!publisher) {
		console.warn(`|PublishManager| Publisher with id ${id} does not exist.`);
		return;
	}

	messages.delete(publisher.id);
}
