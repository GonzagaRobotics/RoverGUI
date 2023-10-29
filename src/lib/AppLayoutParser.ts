export type PaneUUID = 'view-3d';

export type Pane = {
	// TODO: Alongside deciding which svelte component to use, I would really like this to be dynamic
	uuid: PaneUUID;
	name: string;
};

export type Tab = {
	uuid: string;
	name: string;
	panes: {
		uuid: PaneUUID;
		start: { x: number; y: number };
		size: { width: number; height: number };
	}[];
};

export type AppLayout = {
	panes: Pane[];
	tabs: Tab[];
};

export class AppLayoutParser {
	/**
	 * Parses the given data into an AppLayout object.
	 *
	 * @param data A JSON string containing the layout data.
	 */
	static parse(data: string): AppLayout {
		// Convert string to object
		const jsonObj = JSON.parse(data);

		// Extract lists for easy lookup
		const paneLookup = jsonObj.panes;
		const tabLookup = jsonObj.tabs;

		// Extract all panes first
		const panes: Pane[] = [];

		for (const paneId in paneLookup) {
			const paneObj = paneLookup[paneId];

			panes.push({
				uuid: paneId as PaneUUID,
				name: paneObj.name
			});
		}

		// Extract all tabs after
		const tabs: Tab[] = [];

		for (const tabId in tabLookup) {
			const tabObj = tabLookup[tabId];

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const panes = tabObj.panes.map((p: any) => {
				return {
					uuid: p.uuid,
					start: {
						x: Number(p.start.x),
						y: Number(p.start.y)
					},
					size: {
						width: Number(p.size.width),
						height: Number(p.size.height)
					}
				};
			});

			tabs.push({
				uuid: tabId,
				name: tabObj.name,
				panes: panes
			});
		}

		return {
			panes: panes,
			tabs: tabs
		};
	}
}
