/* eslint-disable react/jsx-no-useless-fragment, react-hooks-extra/no-unnecessary-use-memo */
"use client";

import { useMemo, useRef } from "react";
import type { PropsWithChildren } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { createServerContext, setGlobalStyles } from "coulis";

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

	const context = useMemo(() => {
		return createServerContext();
	}, []);

	useServerInsertedHTML(() => {
		/**
		 * Prevent inserting multiple times stylesheets if already done.
		 * @see {@link https://github.com/vercel/next.js/discussions/49354 Issue}.
		 */
		if (hasBeenInserted.current) return;

		hasBeenInserted.current = true;

		return context.getMetadata().map(({ attributes, content }) => {
			return (
				<style
					{...attributes}
					dangerouslySetInnerHTML={{
						__html: content,
					}}
					key={attributes["data-coulis-id"]}
				/>
			);
		});
	});

	return <>{children}</>;
};
