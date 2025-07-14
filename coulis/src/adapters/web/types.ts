import type { StyleType } from "../../core/entities/style";

export type ClassName = string;

export type Rule = string;

export type StyleSheet = {
	getContent: () => string;
	getHydratedClassNames: () => ClassName[];
	insert: (className: ClassName, rule: Rule) => void;
	remove: (preservableClassNames: ClassName[]) => void;
};

export type CreateStyleSheet = (type: StyleType) => StyleSheet;
