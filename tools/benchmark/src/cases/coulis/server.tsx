import { renderToString } from "react-dom/server";
import { CoulisComponent } from "./component";
import { getMetadata } from "./helpers";

export const CoulisCase = () => {
	renderToString(<CoulisComponent />);
	String(getMetadata());
};
