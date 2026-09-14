import { extractCritical } from "@emotion/server";
import { renderToString } from "react-dom/server";
import { EmotionStaticComponent } from "./StaticComponent";

export const EmotionStaticCase = () => {
	extractCritical(renderToString(<EmotionStaticComponent />));
};
