import { extractCritical } from "@emotion/server";
import { renderToString } from "react-dom/server";
import { EmotionComponent } from "./component";

export const EmotionCase = () => {
	extractCritical(renderToString(<EmotionComponent />));
};
