import { renderToString } from "react-dom/server";
import { extractCritical } from "@emotion/server";

import { EmotionComponent } from "./Component";

export const EmotionCase = () => {
	return extractCritical(renderToString(<EmotionComponent />));
};
