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

export const ROW_INDEXES = Array.from({ length: 1000 }, (_, index) => {
	return index;
});
