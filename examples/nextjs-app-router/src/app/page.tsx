"use client";

import { createStyles } from "../helpers/coulis";

const className = createStyles({
	backgroundColor: "neutralDark",
	margin: 0,
	padding: "5rem",
	fontSize: "3rem",
});

export default function Home() {
	return <p className={["globalClass", className].join(" ")}>Hello world</p>;
}
