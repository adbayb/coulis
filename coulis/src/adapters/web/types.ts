import type { StyleType } from "../../core/entities/style";

export type ClassName = string;
export type CreateStyleSheet = (type: StyleType) => StyleSheet;
export type Rule = string;

export type StyleSheet = {
	clear: () => void;
	getContent: () => string;
	getHydratedClassNames: () => ClassName[];
	setRule: (className: ClassName, rule: Rule) => void;
};
