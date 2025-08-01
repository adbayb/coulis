/* eslint-disable n/no-process-env */
import fs from "node:fs/promises";

import express from "express";

// Constants
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3003;
const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction
	? await fs.readFile("./dist/client/index.html", "utf8")
	: "";

// Create http server
const app = express();

app.disable("x-powered-by");

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite;

if (!isProduction) {
	const { createServer } = await import("vite");

	vite = await createServer({
		appType: "custom",
		base,
		server: { middlewareMode: true },
	});
	app.use(vite.middlewares);
} else {
	const compression = (await import("compression")).default;
	const sirv = (await import("sirv")).default;

	app.use(compression());
	app.use(base, sirv("./dist/client", { extensions: [] }));
}

// Serve HTML
app.use("*all", async (request, response) => {
	try {
		const url = request.originalUrl.replace(base, "");
		/** @type {string} */
		let template;
		/** @type {import('./src/entry-server.ts').render} */
		let render;

		if (!isProduction) {
			// Always read fresh template in development
			template = await fs.readFile("./index.html", "utf8");
			template = await vite.transformIndexHtml(url, template);
			render = (await vite.ssrLoadModule("/src/entry-server.tsx"))
				.renderHtml;
		} else {
			template = templateHtml;
			render = (await import("./dist/server/entry-server.js")).renderHtml;
		}

		const rendered = await render(url);

		const html = template
			.replace(`<!--app-head-->`, rendered.head ?? "")
			.replace(`<!--app-html-->`, rendered.html ?? "");

		response.status(200).set({ "Content-Type": "text/html" }).send(html);
	} catch (error) {
		vite?.ssrFixStacktrace(error);
		console.log(error.stack);
		response.status(500).end(error.stack);
	}
});

// Start http server
app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`);
});
