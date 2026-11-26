import { renderToString } from "react-dom/server";
import { StyleXComponent } from "../../../dist/stylex/component";

/** No style extraction: the styles are compiled into a style sheet at build time. */
export const StyleXCase = () => {
	renderToString(<StyleXComponent />);
};
