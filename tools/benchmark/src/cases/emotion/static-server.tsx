import { extractCritical } from "@emotion/server";
import { renderToString } from "react-dom/server";
import { EmotionStaticComponent } from "./static-component";

export const EmotionStaticCase = () => {
	extractCritical(renderToString(<EmotionStaticComponent />));
};
