import type { ReactElement, ReactNode } from "react";

import type { StyleProps } from "../styles";

export type CreateComponentProps<
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	OwnProps extends Record<string, unknown> = {},
	Children extends ReactNode = undefined,
> = (Children extends undefined
	? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
		{}
	: {
			children: Children;
		}) &
	OwnProps &
	Pick<
		StyleProps,
		| "margin"
		| "marginBottom"
		| "marginHorizontal"
		| "marginLeft"
		| "marginRight"
		| "marginTop"
		| "marginVertical"
	>;

export type ReactElementLike = boolean | ReactElement | ReactElementLike[];

export type TextLikeChildren = boolean | number | string | TextLikeChildren[];
