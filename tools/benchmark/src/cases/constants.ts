import { ROW_COUNT } from "../constants";

export const BACKGROUND_COLORS = [
	"lightcoral",
	"lightblue",
	"lightgreen",
	"lightyellow",
	"lightpink",
	"lightsalmon",
	"lightseagreen",
	"lightskyblue",
	"lightslategrey",
	"lightsteelblue",
	"lavender",
	"mistyrose",
	"palegreen",
	"peachpuff",
	"powderblue",
	"thistle",
	"wheat",
	"whitesmoke",
	"oldlace",
	"cornsilk",
] as const;

export const createRowIndexes = () => {
	return Array.from({ length: ROW_COUNT }, (_, index) => {
		return index;
	});
};
