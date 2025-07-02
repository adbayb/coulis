"use client";

import { createStyles } from "../helpers/coulis";

const className = createStyles({
	backgroundColor: "neutralDark",
	color: {
		base: "neutralDark",
	},
});

export default function Home() {
	return <p className={["globalClass", className].join(" ")}>Hello world</p>;
}
