/* eslint-disable react/jsx-no-useless-fragment */
"use client";

import { useRef } from "react";
import type { PropsWithChildren } from "react";
import { useServerInsertedHTML } from "next/navigation";

import { getMetadata, setGlobalStyles } from "../helpers/coulis";

setGlobalStyles({
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	"html": {
		boxSizing: "border-box",
	},
	"html,body": {
		fontFamily: "Open Sans",
		margin: 0,
		padding: 0,
	},
	".globalClass": {
		color: "lightcoral",
	},
});

export const CoulisRegistry = ({ children }: PropsWithChildren) => {
	const hasBeenInserted = useRef(false);

	useServerInsertedHTML(() => {
		/**
		 * Prevent inserting multiple times stylesheets if already done.
		 * @see {@link https://github.com/vercel/next.js/discussions/49354 Issue}.
		 */
		if (hasBeenInserted.current) return;

		hasBeenInserted.current = true;

		return getMetadata().map(({ attributes, content }) => {
			return (
				<style
					{...attributes}
					dangerouslySetInnerHTML={{
						__html: content,
					}}
					key={attributes["data-coulis-type"]}
				/>
			);
		});
	});

	return <>{children}</>;
};
