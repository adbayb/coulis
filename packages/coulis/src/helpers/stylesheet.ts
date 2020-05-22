let styleElementForShorthand: any = null;
let styleElementForMedia: any = null;
let styleElement: any = null;

export const getStyleSheet = () => {
	// @todo: globalStyleElement
	if (styleElementForShorthand === null) {
		styleElementForShorthand = document.createElement("style");
		styleElementForShorthand.id = "shorthand";
		document.head.appendChild(styleElementForShorthand);
	}
	if (styleElement === null) {
		styleElement = document.createElement("style");
		document.head.appendChild(styleElement);
	}
	if (styleElementForMedia === null) {
		styleElementForMedia = document.createElement("style");
		styleElementForMedia.id = "media";
		document.head.appendChild(styleElementForMedia);
	}

	return {
		atomic: styleElement,
		shorthand: styleElementForShorthand,
	};
};
