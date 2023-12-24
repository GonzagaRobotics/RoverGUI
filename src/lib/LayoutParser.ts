export type Pane = {
	id: string;
	name: string;
};

export type Tab = {
	id: string;
	name: string;
	panes: {
		id: string;
		start: { x: number; y: number };
		size: { x: number; y: number };
	}[];
};

export type WindowLayoutData = {
	panes: Pane[];
	tabs: Tab[];
};

export function parseWindowLayout(text: string): WindowLayoutData {
	const obj = JSON.parse(text);

	const objPanes = obj.panes;
	const objTabs = obj.tabs;

	const panes: Pane[] = [];

	for (const paneId in objPanes) {
		const pane = objPanes[paneId];

		panes.push({
			id: paneId,
			name: pane.name
		});
	}

	const tabs: Tab[] = [];

	for (const tabId in objTabs) {
		const tab = objTabs[tabId];

		tabs.push({
			id: tabId,
			name: tab.name,
			panes: tab.panes
		});
	}

	console.debug('|WindowLayoutParser| Parsed layout data', panes, tabs);

	return {
		panes,
		tabs
	};
}
