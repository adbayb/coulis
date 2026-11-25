import { renderToString } from "react-dom/server";
import { CoulisComponent } from "./component";
import { getMetadata } from "./helpers";

export const CoulisCase = () => {
	String(getMetadata(renderToString(<CoulisComponent />)));
};
