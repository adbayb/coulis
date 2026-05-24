"use client";

import type { ReactNode } from "react";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

import { getMetadata, setGlobalStyles } from "../helpers/coulis";

setGlobalStyles({
	".globalClass": {
		color: "surfaceSecondary",
	},
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
});

type CoulisRegistryProps = {
	readonly children: ReactNode;
};

export const CoulisRegistry = ({ children }: CoulisRegistryProps) => {
	const hasBeenInsertedRef = useRef(false);

	useServerInsertedHTML(() => {
		/**
		 * Prevent inserting multiple times stylesheets if already done.
		 * @see {@link https://github.com/vercel/next.js/discussions/49354 Issue}.
		 */
		if (hasBeenInsertedRef.current) return;

		hasBeenInsertedRef.current = true;

		return getMetadata().map(({ attributes, content }) => {
			return (
				<style
					{...attributes}
					// eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
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
