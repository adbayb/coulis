"use client";

import { useServerInsertedHTML } from "next/navigation";
import type { ReactNode } from "react";
import { useRef } from "react";
import { getMetadata, setGlobalStyles } from "../helpers/coulis";

setGlobalStyles({
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	".globalClass": {
		color: "surfaceSecondary",
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

export const CoulisRegistry = ({ children }: CoulisRegistryProps): ReactNode => {
	const hasBeenInsertedRef = useRef(false);

	useServerInsertedHTML(() => {
		/**
		 * Prevent inserting multiple times stylesheets if already done.
		 *
		 * @see {@link https://github.com/vercel/next.js/discussions/49354 Issue}.
		 */
		if (hasBeenInsertedRef.current) {
			return;
		}

		hasBeenInsertedRef.current = true;

		return getMetadata().map(({ attributes, content }) => {
			return (
				<style
					{...attributes}
					key={attributes["data-coulis-type"]}
					// oxlint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html: content,
					}}
				/>
			);
		});
	});

	return children;
};
