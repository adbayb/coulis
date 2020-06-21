import React from "react";
import Head from "next/head";
import { css } from "coulis";

export default function Home() {
	return (
		<div
			className={css({
				color: "lightcoral",
			})}
		>
			<Head>
				<title>Create Next App</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			Plop
		</div>
	);
}
