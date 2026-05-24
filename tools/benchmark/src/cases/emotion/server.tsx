import { extractCritical } from "@emotion/server";
import { renderToString } from "react-dom/server";

import { EmotionComponent } from "./Component";

export const EmotionCase = () => {
	return extractCritical(renderToString(<EmotionComponent />));
};
