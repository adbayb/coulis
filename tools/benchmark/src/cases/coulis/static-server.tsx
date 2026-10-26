import { renderToString } from "react-dom/server";
import { getMetadata } from "./helpers";
import { CoulisStaticComponent } from "./static-component";

export const CoulisStaticCase = () => {
	renderToString(<CoulisStaticComponent />);
	String(getMetadata());
};
