export type ClientConfig = {
	/** Whether to preview the client, which won't cause attempt any connection to the rover. */
	preview: boolean;

	/** The URL of the rosbridge server. */
	rosbridgeUrl: string;
};

export enum ClientConnectionStatus {
	Disconnected,
	Connecting,
	Connected,
	Error
}

export type ClientState = {
	/** The current connection status. */
	connectionStatus: ClientConnectionStatus;
};
