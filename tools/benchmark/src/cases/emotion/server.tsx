import { extractCritical } from "@emotion/server";
import { renderToString } from "react-dom/server";
import { bootstrapServerCase } from "../server";
import { EmotionComponent } from "./component";

bootstrapServerCase("emotion", () => {
	extractCritical(renderToString(<EmotionComponent />));
});
