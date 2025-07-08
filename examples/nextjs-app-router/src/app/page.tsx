"use client";

import { createStyles } from "../helpers/coulis";

const className = createStyles({
	backgroundColor: "neutralDark",
	fontSize: "3rem",
	margin: 0,
	padding: "5rem",
});

export default function Home() {
	return <p className={["globalClass", className].join(" ")}>Hello world</p>;
}
