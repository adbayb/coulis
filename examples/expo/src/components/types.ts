import type { ReactElement, ReactNode } from "react";

import type { StyleProps } from "../styles";

export type TextLikeChildren = TextLikeChildren[] | boolean | number | string;

export type ReactElementLike = ReactElement | ReactElementLike[] | boolean;

export type CreateComponentProps<
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	OwnProps extends Record<string, unknown> = {},
	Children extends ReactNode = undefined,
> = OwnProps &
	Pick<
		StyleProps,
		| "margin"
		| "marginBottom"
		| "marginHorizontal"
		| "marginLeft"
		| "marginRight"
		| "marginTop"
		| "marginVertical"
	> &
	(Children extends undefined
		? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
			{}
		: {
				children: Children;
			});
