import { debug } from './Logger';

export type Pane = {
	uuid: string;
	name: string;
};

export type PaneLayout = {
	uuid: string;
	start: { x: number; y: number };
	size: { x: number; y: number };
};

export type Tab = {
	uuid: string;
	name: string;
	panes: PaneLayout[];
};

export type WindowLayout = {
	panes: Pane[];
	tabs: Tab[];
};

export class WindowLayoutParser {
	/**
	 * Parses the given data into an WindowLayout object.
	 *
	 * @param data A JSON string containing the layout data.
	 */
	static parse(data: string): WindowLayout {
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
				uuid: paneId,
				name: paneObj.name
			});
		}

		// Extract all tabs after
		const tabs: Tab[] = [];

		for (const tabId in tabLookup) {
			const tabObj = tabLookup[tabId];

			tabs.push({
				uuid: tabId,
				name: tabObj.name,
				panes: tabObj.panes.map((p: unknown) => p as PaneLayout)
			});
		}

		debug('WindowLayoutParser', 'Parsed window layout', panes, tabs);

		return {
			panes: panes,
			tabs: tabs
		};
	}
}
