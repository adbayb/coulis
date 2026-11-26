import { renderToString } from "react-dom/server";
import { StyleXComponent } from "../../../dist/stylex/component";
import { bootstrapServerCase } from "../server";

/** No style extraction: the styles are compiled into a style sheet at build time. */
bootstrapServerCase("stylex", () => {
	renderToString(<StyleXComponent />);
});
