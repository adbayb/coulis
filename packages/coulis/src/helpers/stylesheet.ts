let shorthandElement: HTMLStyleElement | null = null;
let groupedElement: HTMLStyleElement | null = null;
let longhandElement: HTMLStyleElement | null = null;

export const getStyleSheet = () => {
	// @todo: globalStyleElement
	if (shorthandElement === null) {
		shorthandElement = document.createElement("style");
		shorthandElement.id = "shorthand";
		document.head.appendChild(shorthandElement);
	}

	if (longhandElement === null) {
		longhandElement = document.createElement("style");
		document.head.appendChild(longhandElement);
	}

	if (groupedElement === null) {
		groupedElement = document.createElement("style");
		groupedElement.id = "media";
		document.head.appendChild(groupedElement);
	}

	return {
		longhand: longhandElement,
		shorthand: shorthandElement,
		grouped: groupedElement,
	};
};

// @todo: insertRule isomorphic
// Same interface with insertRule but different implementations following server / browser but also dev / prod environment
