/* eslint-disable sort-keys-custom-order/object-keys */

/**
 * Https://supercolorpalette.com/.
 *
 * 6 scales per color variant:
 * - 100: Secondary Background / Primary Light Text
 * - 200: Secondary Hover Background / Secondary Light Text
 * - 300: Secondary Active Background / Secondary Border
 * - 400: Primary Hover Background / Secondary Dark Text / Primary Border
 * - 500: Primary Background / Primary Dark Text
 * - 600: Primary Active Background.
 */
export const colors = {
	current: "currentColor",
	inherit: "inherit",
	transparent: "transparent",
	black: "#000",
	white: "#fff",
	yellow: {
		"100": "hsl(40, 98%, 97%)",
		"200": "hsl(40, 98%, 94%)",
		"300": "hsl(40, 98%, 90%)",
		"400": "hsl(40, 98%, 25%)",
		"500": "hsl(40, 98%, 20%)",
		"600": "hsl(40, 98%, 16%)",
	},
	green: {
		"100": "hsl(163, 88%, 97%)",
		"200": "hsl(163, 88%, 94%)",
		"300": "hsl(163, 88%, 90%)",
		"400": "hsl(163, 88%, 22%)",
		"500": "hsl(163, 88%, 20%)",
		"600": "hsl(163, 88%, 14%)",
	},
	blue: {
		"100": "hsl(243, 54%, 97%)",
		"200": "hsl(243, 54%, 94%)",
		"300": "hsl(243, 54%, 90%)",
		"400": "hsl(243, 54%, 40%)",
		"500": "hsl(243, 54%, 30%)",
		"600": "hsl(243, 54%, 20%)",
	},
	red: {
		"100": "hsl(0, 74%, 97%)",
		"200": "hsl(0, 74%, 94%)",
		"300": "hsl(0, 74%, 90%)",
		"400": "hsl(0, 74%, 45%)",
		"500": "hsl(0, 74%, 35%)",
		"600": "hsl(0, 74%, 25%)",
	},
	// https://supercolorpalette.com/
	gray: {
		"100": "hsl(210, 2%, 98%)",
		"200": "hsl(220, 2%, 96%)",
		"300": "hsl(210, 2%, 92%)",
		"400": "hsl(220, 7%, 25%)",
		"500": "hsl(220, 7%, 18%)",
		"600": "hsl(220, 7%, 14%)",
	},
};
